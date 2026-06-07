/*
 * Realtime channel subscriptions for the auction (PRD §3.3 / FR-AUC-3..6).
 *
 * Three channels:
 *   - `auction-state-{roomId}` — postgres_changes on the auction_state
 *     row. Triggers a re-sync of the local cache.
 *   - `skip-votes-{roomId}` — Supabase broadcast (not persisted).
 *   - `auction-players-{roomId}` — postgres_changes on the participants
 *     JSONB column; we listen on the same auction_state row but with a
 *     filter on the participants field.
 *
 * Activation: these subscriptions are no-ops when the app is running on
 * the mock backend (isUsingMock === true), so calling sites can wire
 * them unconditionally.
 */

import { isUsingMock } from "./backend";
import type { AuctionState } from "./backend";

type Unsubscribe = () => void;

export async function subscribeToAuction(
  roomId: string,
  onState: (state: AuctionState) => void,
  onSkipVote: (voterId: string) => void
): Promise<Unsubscribe> {
  if (isUsingMock) return () => {};
  const { supabase } = await import("./supabaseBackend");

  // State channel — postgres_changes on the single auction_state row.
  const stateChannel = supabase
    .channel(`auction-state-${roomId}`)
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "auction_state",
        filter: `room_id=eq.${roomId}`,
      },
      (payload) => {
        const row = payload.new as Record<string, unknown>;
        onState(rowToState(row));
      }
    )
    .subscribe();

  // Ephemeral skip-vote broadcasts.
  const skipChannel = supabase
    .channel(`skip-votes-${roomId}`)
    .on("broadcast", { event: "skip_vote" }, (payload) => {
      const data = payload.payload as { voter_id?: string };
      if (data.voter_id) onSkipVote(data.voter_id);
    })
    .subscribe();

  return () => {
    supabase.removeChannel(stateChannel);
    supabase.removeChannel(skipChannel);
  };
}

/** Broadcast a skip vote without persisting it. */
export async function broadcastSkipVote(roomId: string, voterId: string): Promise<void> {
  if (isUsingMock) return;
  const { supabase } = await import("./supabaseBackend");
  await supabase.channel(`skip-votes-${roomId}`).send({
    type: "broadcast",
    event: "skip_vote",
    payload: { voter_id: voterId },
  });
}

/* ----- row mapper ----- */

function rowToState(row: Record<string, unknown>): AuctionState {
  return {
    roomId: row.room_id as string,
    status: row.status as AuctionState["status"],
    currentPlayerIndex: Number(row.current_player_index),
    currentBidAmount: Number(row.current_bid_amount),
    currentBidderId: (row.current_bidder_id as string) ?? null,
    timerEnd: new Date(row.timer_end as string).getTime(),
    pool: (row.pool ?? []) as AuctionState["pool"],
    participants: ((row.participants as AuctionState["participants"]) ?? []),
    log: ((row.log as AuctionState["log"]) ?? []),
  };
}
