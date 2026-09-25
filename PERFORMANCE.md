# Website performance

Public CMS reads use a shared, five-minute Next Data Cache as well as production page ISR. Content save/delete hooks invalidate the relevant collection tags and pages. Private admin data, authentication and submissions are not cached by this helper.

Navigation links prefetch their destinations. The homepage defers WebGL initialization and carousel copies until needed, and route changes no longer fade the entire page.

## Local measurements

Production build, local Chrome, September 25, 2026. Browser measurements cover prefetched clicks until the heading updates plus two animation frames, six clicks per viewport across Home, About and Services:

| Measurement | Result |
| --- | --- |
| Desktop navigation, 1440px | 35–105 ms |
| Mobile viewport navigation, 390px | 37–57 ms |
| Warm production server RSC response medians, seven routes | 29–32 ms |
| Warm development RSC response medians, seven routes | 82–112 ms |
| CMS loader calls across 35 warm requests per mode | 0 |

Mobile results use desktop Chrome emulation, not a physical phone. Production server measurements preceded the final browser rendering optimizations. These are local observations, not latency guarantees: cold starts, compilation, cache expiry, devices, hosting and network distance affect results. The initial clean development compilation still took about 24 seconds.

## Admin dashboard data loading

Read-only local measurements on September 25, 2026, using the configured database and a staff user's collection permissions:

| Dashboard data load | Before | After |
| --- | --- | --- |
| First load after Payload initialization | 486 ms | 434 ms |
| Two warm loads | 202–247 ms | 111–114 ms |

The dashboard now derives the open-application total from its existing status counts. Recent-item queries select only displayed fields, populate only country names, and skip unused pagination totals. Private dashboard data remains uncached and permission checked.

Run `npm run payload -- run scripts/benchmark-dashboard.ts` to repeat these read-only measurements. The script loads an existing staff user locally without creating a login session. These numbers cover the dashboard data loader only, excluding HTTP routing, authentication, sidebar queries, rendering, and browser hydration; they are not full route latency measurements. Payload initialization took approximately 1.8 seconds in both runs.

## Running and checking

Use `npm run build` followed by `npm start` to assess production navigation. `npm run dev` includes compilation and development overhead.

- `node scripts/benchmark-navigation.mjs` measures production server responses.
- `node scripts/benchmark-navigation.mjs --dev` measures development responses in an isolated build directory.
- `node scripts/qa-ui.mjs --navigation` measures desktop/mobile browser clicks (requires local Chrome).
- `npx payload run scripts/verify-cache-invalidation.ts` verifies a temporary service can be created, updated and deleted with cache invalidation. It uses the configured database and removes its test records.
- Set `CMS_CACHE_DEBUG=true` to log actual public CMS cache misses.

Database schema synchronization is now explicit: after changing Payload collection fields, run `npm run cms:sync`, then restart development. Ordinary content edits require only Save in the admin panel. Production schema changes should use Payload migrations. An already-open browser tab may retain prefetched content until refreshed.
