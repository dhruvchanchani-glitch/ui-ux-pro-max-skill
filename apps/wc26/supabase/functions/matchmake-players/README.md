# matchmake-players

Atomic room creation from the `matchmaking_queue` table. Replaces the
client-polling matchmaking from PRD §FR-AUC-12 with the
server-side variant from §FR-AUC-13.

## Deploy

```bash
supabase functions deploy matchmake-players --no-verify-jwt
```

`--no-verify-jwt` because this is invoked by a scheduled cron, not by a
user-bearing request.

## Trigger

Either:

- **Cron (recommended)** — schedule every 5 seconds via Supabase's
  Scheduled Functions feature:
  ```
  */5 * * * * * /matchmake-players
  ```
- **Database webhook** — call from a `BEFORE INSERT ON
  matchmaking_queue` trigger so matching is instant.

## Payload

None. The function scans the queue itself.

## Response

```json
{ "matched": 4 }
```

## How clients receive the room id

The client subscribes to `matchmaking:{user_id}` after pushing into
the queue. This function broadcasts a `matched` event with the new
room id on success.

## Hardening before launch

- Region affinity: filter the queue by `region` before grouping.
- Elo banding: only group players within ±50 elo of the head.
- Backoff: if no match is possible, broaden the band gradually.
- Rate limit per user so a single client can't flood the queue.
