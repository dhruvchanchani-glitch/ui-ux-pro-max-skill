# iap-verify

Validates App Store / Play receipts and credits XP server-side. PRD
§FR-MON-7 / NFR-SEC-6 — XP must never be credited client-side.

## Deploy

```bash
supabase functions deploy iap-verify
supabase secrets set APPLE_SHARED_SECRET="<from App Store Connect>"
# Google validation is sketched but not wired in this stub.
```

## Client payload

```json
{
  "platform": "ios",
  "receipt": "<base64 receipt>",
  "product_id": "wc26.xp.popular"
}
```

## Product map

The product ids must match what's configured in App Store Connect /
Play Console:

| Product id | XP | Price |
|------------|------|------|
| `wc26.xp.starter` | 1,500 | £0.99 |
| `wc26.xp.popular` | 5,000 | £2.99 |
| `wc26.xp.serious` | 12,000 | £5.99 |
| `wc26.xp.season` | 30,000 | £12.99 |

## Rate limit

10 calls per user per minute. A single legitimate purchase fires one
call; anything more is suspicious.

## Hardening

- Persist every receipt in a `iap_receipts` table with a unique index on
  the receipt hash so a replay yields a duplicate-key error.
- For App Store Server API V2 (modern flow), validate using JWS rather
  than the legacy `/verifyReceipt` endpoint.
- For Android, complete the service-account JWT mint + purchase
  consumption call.
