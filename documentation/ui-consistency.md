# Public UI conventions

The existing Fraunces/Manrope fonts and semantic color tokens remain unchanged.

- Section rhythm: 64px mobile, 80px tablet, 96px desktop; 20px side gutters, 32px desktop; maximum width 1280px.
- Section headings: 30px mobile / 36px desktop, 1.15 line height. Card headings: 24px.
- Content cards: shared `cardVariants` in `components/ui/card.tsx`, 24px radius, semantic border/background, small resting shadow. Interactive cards add a restrained hover/focus treatment.
- Card padding: 24px mobile / 32px desktop. Grid gaps: 24px.
- Controls: existing Button/Input/Select/Textarea primitives, at least 44px targets, visible keyboard focus, 200ms feedback, reduced-motion support.
- Loading: shared `PageSkeleton` / `Skeleton`, using the muted token so shapes are visible in both themes; a single accessible loading announcement.
- Empty content: shared `EmptyState`, descriptive user-facing copy and a relevant action. Never present invented student reviews as genuine.
- Images: preserve aspect ratios and dimensions to reserve space. See `visual-assets.md` for placeholder replacements.
