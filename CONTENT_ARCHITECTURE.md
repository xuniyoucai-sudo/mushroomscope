# MushroomScope Content Architecture

MushroomScope uses five independent Astro Content Collections. This keeps each knowledge domain strongly typed while allowing all published entries to share one routing, listing, RSS, and sitemap pipeline.

## Collection map

| Collection | Source directory | Public URL | Purpose |
| --- | --- | --- | --- |
| `species` | `src/content/mushrooms/` | `/mushrooms/{slug}/` | Mushroom Species Encyclopedia |
| `identification` | `src/content/identification/` | `/identification/{slug}/` | Feature-led identification guides |
| `growing` | `src/content/growing/` | `/growing/{slug}/` | Cultivation methods and growing records |
| `recipes` | `src/content/recipes/` | `/recipes/{slug}/` | Structured mushroom recipes |
| `health` | `src/content/health/` | `/health/{slug}/` | Evidence-aware nutrition and health guides |

All schemas are defined in `src/content.config.ts`. Shared querying and canonical route construction live in `src/lib/content.ts`.

## Shared publishing fields

Every entry has `title`, `description`, `keywords`, `category`, `author`, `publishDate`, optional `updatedDate`, cover image metadata, `draft`, `featured`, `reviewedBy`, `sources`, `faq`, and explicit `relatedEntries`. Published content must include a descriptive cover alt and at least two valid relationships to other published entries.

Draft entries may omit database fields while research is in progress. When `draft: false`, collection-specific required fields are enforced by schema validation. This prevents incomplete records from reaching production, RSS, internal listings, or the sitemap.

## Species Encyclopedia

Published species records require:

- `scientificName` and `commonNames`
- optional structured `taxonomy`
- `identification.summary` and key features
- `appearance`: cap, hymenium, stem, flesh, and spore print
- `habitat`: summary, geographic regions, and substrates
- `season`: summary and months
- `edibility`: controlled status and contextual notes
- `toxicity`: controlled risk level and notes
- `nutrition`: summary with optional quantitative nutrients
- `growingDifficulty`: controlled level and notes
- `similarSpecies`: comparison records with optional internal slugs

Edibility and toxicity are deliberately separate. A mushroom can be inedible without being toxic, and preparation-dependent edibility must not be represented as a simple safety claim.

## Identification Guide

Published identification records require five observable feature groups:

- `cap`: shape, color, surface, and size
- `stem`: shape, color, surface, ring, and volva
- `gills`: attachment, spacing, color, and optional notes
- `spores`: print color, shape, and optional size
- `habitat`: substrate, associated trees, regions, and summary

A `safetyNotice` is also mandatory for publication. Identification content supports learning and comparison; it must never present image-only identification as sufficient evidence for consumption.

## Growing Database

Published growing records require target species, difficulty, methods, substrates, environmental conditions, timelines, equipment, contamination risks, and ordered steps. Environmental conditions distinguish colonization from fruiting so records can later support filtering and comparison tools.

## Recipe Database

Published recipes require `mushroomSpecies` and a structured `recipe` object containing preparation time, cooking time, yield, ingredients, and instructions. Optional cuisine, category, total time, calories, and dietary tags support search filters and Schema.org Recipe output.

## Health collection

Health remains a separate evidence-aware collection. Publication requires an evidence summary, controlled evidence level, explicit review status, medical disclaimer, sources, and FAQs. Editorial review is disclosed as such. A named reviewer and review date become mandatory only when a page is explicitly marked `expert-reviewed`; the system must never imply expert review without a real person and review record.

## Relationships and future scale

Internal references should use stable slugs rather than copied URLs. The next architecture phase can introduce reusable taxonomy data files for species, regions, substrates, host trees, and culinary ingredients. At that point, schema validation can verify cross-collection references and generate faceted index pages without changing entry URLs.

Recommended future relationship keys:

- Species → similar species, growing guides, identification guides, recipes
- Identification guide → candidate species and dangerous lookalikes
- Growing guide → target species and substrate records
- Recipe → edible species and ingredient records

Do not change a published slug casually. If a slug must change, add a permanent redirect from the old URL and update every structured reference.
