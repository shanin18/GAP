# Hero globe

The globe, desktop/mobile Countries menu, footer and hero destination count read Payload's Countries collection. Changes appear on a fresh page request/reload. No database schema changes are needed.

Use a standard country name (for example Germany, Japan, United Kingdom) or an ISO two-letter country code as the name/slug. Common aliases such as UK, USA and UAE are supported. Unrecognized names remain in navigation but cannot be plotted; correct the name or add a coordinate alias in `lib/globe-destinations.ts`. An empty collection produces an unmarked globe, not invented destinations.

Coordinates are approximate country centers, resolved on the server from `lib/country-coordinates.json`. Source: [Google DSPL canonical countries dataset](https://github.com/google/dspl/blob/master/samples/google/canonical/countries.csv). Country names are used for lookup, not substituted for the client's CMS display names. The dataset is historical; aliases cover several renamed countries. It is not a source of current political boundaries.

Labels use the installed COBE 2 marker anchors and front/back visibility, with percentage positioning fallback for browsers without CSS Anchor Positioning. Reference: [Shuding's COBE component](https://21st.dev/@shuding/components/cobe-globe).

Automatic rotation runs at up to 30fps only while visible, pauses during interaction, and respects reduced motion. No animation dependency or play/pause buttons are added. The visually hidden country links become visible on keyboard focus.

Nearby country labels are staggered with connector lines when their touch targets would overlap. Hover and keyboard focus independently pause rotation.

## Populated QA without database writes

`scripts/fixtures/globe-page.tsx.txt` is a seven-country test page template, outside the production route tree. For local QA, copy it to `app/(frontend)/qa-globe-local/page.tsx`, build, and run `node scripts/qa-ui.mjs --globe-fixture`. Remove the temporary route and rebuild afterwards. Never deploy the fixture route. The check verifies marker alignment, country links, label collisions and page overflow at 320px, 768px and 1440px.
