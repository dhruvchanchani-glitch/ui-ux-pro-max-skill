# resolve-match

Webhook receiver for end-of-match data. Settles every pending bet for
a match in one shot. PRD §FR-BET-12.

## Deploy

```bash
supabase functions deploy resolve-match --no-verify-jwt
supabase secrets set MATCH_WEBHOOK_SECRET="<your shared secret>"
```

`--no-verify-jwt` because the caller is the data provider, not a
logged-in user. We verify their signature ourselves instead.

## Configure the provider

Point your provider's match-end webhook at:

```
https://<project-ref>.functions.supabase.co/resolve-match
```

The provider signs each request with HMAC-SHA256 over the raw body
using the same `MATCH_WEBHOOK_SECRET`, and sends the hex digest as
`X-Signature`.

## Payload

```json
{
  "match_id": "m_bra_por",
  "home_score": 2,
  "away_score": 1,
  "top_scorer_player_id": "p_vinicius",
  "motm_player_id": "p_vinicius",
  "first_scorer_player_id": "p_vinicius",
  "red_card": false
}
```

## Response

```json
{ "settled": 12, "won": 5, "lost": 7 }
```

## Notes

- Streak handling here is simplified — a real implementation reads
  `profiles.streak`, increments on win (capped at 5 for the +50%
  multiplier), and resets on loss. Doing it in plpgsql via an RPC is
  cleaner than the inline writes shown here.
- Accumulator settling is not in this stub; add a pass after per-bet
  settlement that finds accumulators whose every leg is now resolved
  and bulk-credits the combined payout.
