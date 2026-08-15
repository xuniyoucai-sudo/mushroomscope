# MushroomScope Content Library

This directory contains 500 complete **research briefs**, not publication-ready articles.

Each brief provides a unique topic, search intent, long-form section plan, safety language, starting sources, FAQs, and an editorial checklist. Repeated scaffolding is intentional: it preserves a consistent research and safety process while an editor replaces general passages with topic-specific reporting.

Do not copy a file into `src/content` or mark it `ready` until all unchecked editorial tasks are complete. In particular, every brief still requires exact topic-level citations, independent factual verification, original or properly licensed imagery, category-specific schema fields, intentional internal links, and a human review for health, toxicology, identification, or wild-food claims.

The live publishing queue is capped at two entries per run. A queued entry also needs `editorialReview: "approved"`; the publication script rejects it otherwise.

Commands:

```sh
pnpm library:audit
pnpm build
pnpm queue:publish
```

`pnpm library:generate` is reproducible and overwrites only files carrying a managed `MS-####` library ID.
