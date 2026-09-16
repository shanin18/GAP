# GAP v1 QA checklist

## Responsive
Test 375, 480, 768, 1024, 1280 and 1440px widths. Check header/mobile nav, hero, cards, forms, tables/dashboard, university filters and article pages.

## Accessibility
Keyboard through navigation/dialogs/forms; visible focus; semantic labels; error messages announced; meaningful image alt text; reduced-motion preference; zoom to 200%.

## Functional
Lead submission; application submission/reference; country/university filtering; news links; CMS publish/unpublish; Payload login; `/staff` authentication; application status updates; private document access.

## SEO
Canonical production URL, metadata on key pages, `robots.txt`, `sitemap.xml`, one H1/page and descriptive titles/descriptions.

## Performance
Run Lighthouse on home, universities, university detail, news, apply. Optimize remote images and avoid unnecessary client components.
