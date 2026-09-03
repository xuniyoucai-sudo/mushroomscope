# Parasol mushroom optimization plan

Status: planning only; do not modify the public URL during the September 3 publication window.

Target: `/mushrooms/parasol-mushroom-guide/`

## Why it is next

- Google state at the September 3 inspection: Discovered — currently not indexed.
- Current body length: approximately 1,578 English words.
- Exact competitive paragraphs at least 120 characters: 12 of 24, or 50%.
- Counted contextual body inlinks from published articles: 0.
- Current source list: 4; FAQ items: 5.
- Publish date must remain `2026-08-21`. Change `updatedDate` only after a substantive rewrite passes all gates.

## Search intent and page boundary

Keep this as a species-level field-record guide for *Macrolepiota procera*. It should not compete with the general identification category, the identification-safety hub, or the poisonous-mushroom warning page. Its defining intent is how to document a true parasol candidate and distinguish it from regionally relevant large lepiotoid mushrooms, especially *Chlorophyllum molybdites*.

Suggested title direction: `Parasol Mushroom: Stem Pattern, Ring, Spores, and Lookalikes`.

Suggested description direction: describe the snakeskin-patterned stem, movable double ring, free pale gills, white spore deposit, intact base, habitat, and green-spored lookalike boundary without promising remote identification.

## Competitive templates to replace

Replace the generic identification overview, habitat boilerplate, broad food/safety paragraph, generic cultivation paragraph, “complete field record” block, general reader checklist, generic uncertainty language, and reusable record-keeping paragraphs. Retain only concise necessary statements that a webpage cannot confirm edibility and that poisoning symptoms require prompt professional help.

## Species-specific structure

1. Follow cap development from drumstick to broad parasol, recording umbo and scale arrangement.
2. Photograph free pale gills and explain why white gills alone are insufficient.
3. Document both surfaces and actual mobility of the substantial ring without forcing it.
4. Record the brown snakeskin or zigzag stem pattern over its full length.
5. Recover and photograph the intact bulbous base; explicitly distinguish a bulb from a volva.
6. Make a mature spore deposit on adjoining light and dark nonabsorbent surfaces.
7. Separate *Chlorophyllum molybdites* using mature greenish spores, regional/lawn context, and the limits of immature white gills.
8. Separate the *Chlorophyllum rhacodes* complex using stem ornamentation, bruising, stature, and regional taxonomy.
9. Add high-consequence small-lepiotoid and *Amanita* boundaries without implying one checklist clears a specimen.
10. Record grassland, pasture, verge, woodland-edge, mowing, chemical treatment, road proximity, and fruiting pattern.
11. Explain why European *M. procera* concepts cannot be exported unchanged to every continent.
12. Keep food history conditional on verified identity, clean habitat, sound material, and local advice.

## Source work required

- Retain the exact GBIF species record for current-name and occurrence context.
- Replace the generic NCBI landing page with an exact taxon or a more useful specialist nomenclature source.
- Add at least two authoritative or professional sources that directly support morphology and the *C. molybdites* comparison.
- Use a toxicology source that specifically documents gastrointestinal poisoning by *C. molybdites* or the relevant syndrome.
- Tie every measurement, stain, spore-color, distribution, or toxicity statement to the source that actually supports it.

## Contextual inlink plan

Implement only on a future day when those source pages are within the allowed update scope, or incorporate links during their own substantive updates:

- From `/identification/mushroom-spore-colors/`: link from the white-versus-green deposit discussion using an anchor such as “parasol and green-spored lawn lookalikes.”
- From `/identification/poisonous-mushroom-warning-signs/`: link from the section explaining why cap appearance is weaker than a mature spore deposit.
- From `/identification/mushroom-stem-features/`: link from ring mobility and stem-surface pattern documentation.
- From `/mushrooms/horse-mushroom-guide/`: only add a link if a future grassland-mushroom comparison naturally contrasts brown-spored *Agaricus* with white-spored parasol-like fungi.

Do not add footer, tag-cloud, or unrelated anchors merely to raise the count.

## Acceptance gates for the future run

- 1,500+ English body words after removing templates.
- Competitive exact-paragraph share materially below the current 50%, ideally near zero without deleting required safety language.
- At least 3 directly relevant reliable sources and a visible References section.
- Five species-specific FAQ items aligned with FAQ Schema.
- At least 2 contextual body links to already published pages; no draft or missing targets.
- Every H2/H3 accurately describes the section that follows.
- Existing cover opened at source and production sizes, compared against two same-category baselines, and checked for morphology, crop, clarity, disclosure, and license fields.
- Full build immediately after modification and again before commit; `git diff --check`, canonical, Article/Taxon/FAQ Schema, sitemap, RSS, search index, deployment, and live HTTP checks all pass.
- Submit only the live Parasol URL to IndexNow after a genuinely substantive update.
