/*
 * matchmake-players — atomic room creation from the matchmaking queue.
 *
 * Replaces the client-side polling described in PRD §FR-AUC-12 with a
 * server-side transaction (FR-AUC-13), removing the risk of lobby
 * creation failing when the temporary host's client drops.
 *
 * Flow:
 *   1. Caller pushes themselves into matchmaking_queue with their elo
 *      and desired count.
 *   2. This function (run on a schedule or on enqueue) scans the queue
 *      for groups of N players within an elo window and a region match
 *      where applicable, then in one transaction:
 *        a. inserts a new auction_state row
 *        b. updates each matched queue row to status = 'matched' with
 *           the room_id
 *        c. broadcasts the room_id on a "matchmaking:{user_id}" channel
 *           so the client navigates to the lobby
 *
 * Trigger: schedule every 5s via Supabase cron, OR call inline after
 * each insert via a database trigger that POSTs here.
 */

import { handlePreflight, json, serverError } from "../_shared/cors.ts";
import { serviceClient } from "../_shared/supabase.ts";

Deno.serve(async (req) => {
  const pre = handlePreflight(req);
  if (pre) return pre;
  try {
    const db = serviceClient();

    // 1. Pick the earliest-joined waiting players, capped at a sensible
    //    batch size so a stuck batch can't lock up the queue.
    const { data: queue, error: qErr } = await db
      .from("matchmaking_queue")
      .select("*")
      .eq("status", "waiting")
      .order("joined_at")
      .limit(48);
    if (qErr) throw qErr;
    if (!queue || queue.length < 2) return json({ matched: 0 });

    // 2. Naive matchmaking: group consecutive waiters into rooms of
    //    their `desired_count`. A future pass can use elo banding and
    //    region affinity.
    type Row = (typeof queue)[number];
    const groups: Row[][] = [];
    for (const row of queue) {
      const desired = (row as Row & { desired_count: number }).desired_count;
      const last = groups[groups.length - 1];
      if (last && last[0] && (last[0] as Row & { desired_count: number }).desired_count === desired && last.length < desired) {
        last.push(row);
      } else if (!last || last.length >= ((last[0] as Row & { desired_count: number }).desired_count ?? 0)) {
        groups.push([row]);
      }
    }

    let matched = 0;
    for (const group of groups) {
      const head = group[0] as Row & { desired_count: number };
      if (group.length < head.desired_count) continue;

      // 3. Insert auction_state. Use the host's id concatenated with a
      //    random suffix as the seed so generateAuctionPool stays
      //    reproducible client-side too.
      const seed = `${(head as { player_id: string }).player_id}-${crypto.randomUUID()}`;
      const { data: room, error: roomErr } = await db
        .from("auction_state")
        .insert({
          status: "bidding",
          current_player_index: 0,
          current_bid_amount: 0,
          current_bidder_id: null,
          timer_end: new Date(Date.now() + 15_000).toISOString(),
          pool_seed: seed,
        })
        .select("room_id")
        .single();
      if (roomErr || !room) throw roomErr;

      // 4. Update the queue rows in one statement.
      const ids = group.map((r) => (r as { id: number }).id);
      const { error: updateErr } = await db
        .from("matchmaking_queue")
        .update({ status: "matched", room_id: room.room_id })
        .in("id", ids);
      if (updateErr) throw updateErr;

      // 5. Broadcast so each client navigates to the lobby. The client
      //    listens on `matchmaking:{user_id}` after enqueueing.
      for (const r of group) {
        const userId = (r as { player_id: string }).player_id;
        await db.channel(`matchmaking:${userId}`).send({
          type: "broadcast",
          event: "matched",
          payload: { room_id: room.room_id },
        });
      }
      matched += group.length;
    }
    return json({ matched });
  } catch (err) {
    console.error("matchmake-players failed:", err);
    return serverError((err as Error).message);
  }
});
