import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const generatedRoot = join(root, 'content-library');
const articleRoot = join(generatedRoot, 'drafts');
const queuePath = join(root, 'content-queue/queue.json');
const createdAt = new Date().toISOString().slice(0, 10);

const species = [
  ['oyster mushroom', 'Pleurotus ostreatus'], ['shiitake', 'Lentinula edodes'], ['lion’s mane', 'Hericium erinaceus'],
  ['maitake', 'Grifola frondosa'], ['king oyster mushroom', 'Pleurotus eryngii'], ['enoki', 'Flammulina filiformis'],
  ['wood ear mushroom', 'Auricularia heimuer'], ['reishi', 'Ganoderma lingzhi'], ['turkey tail', 'Trametes versicolor'],
  ['cremini mushroom', 'Agaricus bisporus'], ['portobello mushroom', 'Agaricus bisporus'], ['chanterelle', 'Cantharellus species'],
  ['morel', 'Morchella species'], ['porcini', 'Boletus edulis group'], ['shaggy mane', 'Coprinus comatus'],
  ['blewit', 'Collybia nuda'], ['puffball', 'Calvatia and Lycoperdon species'], ['hedgehog mushroom', 'Hydnum species'],
  ['chicken of the woods', 'Laetiporus species'], ['lobster mushroom', 'Hypomyces lactifluorum'],
  ['black trumpet', 'Craterellus cornucopioides'], ['wine cap', 'Stropharia rugosoannulata'], ['pioppino', 'Cyclocybe aegerita'],
  ['nameko', 'Pholiota microspora'], ['straw mushroom', 'Volvariella volvacea'], ['beech mushroom', 'Hypsizygus marmoreus'],
  ['cauliflower mushroom', 'Sparassis species'], ['matsutake', 'Tricholoma matsutake group'], ['agarikon', 'Laricifomes officinalis'],
  ['artist’s conk', 'Ganoderma applanatum'], ['birch polypore', 'Fomitopsis betulina'], ['dryad’s saddle', 'Cerioporus squamosus'],
  ['honey mushroom', 'Armillaria species'], ['velvet shank', 'Flammulina velutipes'], ['parasol mushroom', 'Macrolepiota procera'],
  ['field mushroom', 'Agaricus campestris'], ['horse mushroom', 'Agaricus arvensis'], ['saffron milk cap', 'Lactarius deliciosus group'],
  ['indigo milk cap', 'Lactarius indigo'], ['yellowfoot chanterelle', 'Craterellus tubaeformis'],
];

const topicSets = {
  mushrooms: [
    ['field profile', 'appearance, habitat, season, and the limits of remote identification'],
    ['taxonomy explained', 'accepted names, synonyms, classification, and why names change'],
    ['habitat and ecology', 'substrate, host relationships, range, season, and ecological role'],
    ['lookalike framework', 'comparison characters, documentation, uncertainty, and safety boundaries'],
    ['culinary sourcing guide', 'reputable sourcing, storage, preparation context, and allergy awareness'],
  ],
  identification: [
    ['cap and surface features', 'cap development, surface texture, color limits, measurements, and photography'],
    ['gills, pores, or teeth', 'fertile-surface terminology, attachment, spacing, color, and spore production'],
    ['stem and attachment clues', 'stem form, base, ring, volva, attachment, sectioning, and field notes'],
    ['spore print workflow', 'collection setup, print color, contamination control, interpretation, and limits'],
    ['habitat-first comparison', 'substrate, host trees, geography, season, growth habit, and local keys'],
  ],
  growing: [
    ['beginner cultivation plan', 'culture choice, substrate, sanitation, stages, records, and disposal'],
    ['substrate selection', 'species fit, hydration, treatment, inoculation, monitoring, and spent substrate'],
    ['fruiting conditions', 'stage cues, humidity, fresh air, light, temperature, and observation logs'],
    ['contamination prevention', 'clean workflow, isolation, warning signs, recordkeeping, and safe disposal'],
    ['harvest and storage', 'maturity cues, clean harvest, cooling, yield records, second flushes, and food safety'],
  ],
  recipes: [
    ['skillet method', 'ingredient selection, browning, seasoning, doneness, serving, and leftovers'],
    ['oven-roasted method', 'cut size, moisture control, pan spacing, timing cues, variations, and storage'],
    ['soup technique', 'aromatic base, mushroom preparation, liquid balance, texture, reheating, and freezing'],
    ['grain bowl', 'mushroom browning, grain choice, vegetables, sauce balance, assembly, and meal prep'],
    ['pasta technique', 'mushroom selection, browning, sauce emulsion, pasta timing, substitutions, and leftovers'],
  ],
  health: [
    ['nutrition evidence review', 'food composition, serving context, evidence hierarchy, uncertainty, and practical use'],
    ['supplement label review', 'species identity, fungal part, extraction, testing, claims, and clinician discussion'],
    ['beta-glucan evidence', 'compound definitions, food versus extract, study design, outcomes, and limitations'],
    ['vitamin and mineral context', 'composition variability, dietary reference context, preparation, and claim limits'],
    ['safety and interactions', 'food versus supplement exposure, allergy, interactions, vulnerable groups, and urgent symptoms'],
  ],
};

const sources = {
  mushrooms: [
    ['NCBI Taxonomy Browser', 'https://www.ncbi.nlm.nih.gov/taxonomy'],
    ['GBIF Species', 'https://www.gbif.org/species/search'],
    ['Index Fungorum', 'https://www.indexfungorum.org/'],
  ],
  identification: [
    ['North American Mycological Association — Mushroom Poisoning Syndromes', 'https://namyco.org/interests/toxicology/mushroom-poisoning-syndromes/'],
    ['National Capital Poison Center — Mushroom Poisoning', 'https://www.poison.org/articles/wild-mushroom-warning'],
    ['GBIF Species', 'https://www.gbif.org/species/search'],
  ],
  growing: [
    ['Cornell Small Farms — Mushroom Cultivation', 'https://smallfarms.cornell.edu/projects/mushrooms/'],
    ['Penn State Extension — Mushrooms', 'https://extension.psu.edu/forage-and-food-crops/mushrooms'],
    ['University of Maryland Extension — Fungiculture', 'https://extension.umd.edu/resource/learn-more-about-mushroom-production-fungiculture'],
  ],
  recipes: [
    ['FDA — Selecting and Serving Produce Safely', 'https://www.fda.gov/consumers/consumer-updates/selecting-and-serving-produce-safely'],
    ['USDA FSIS — Leftovers and Food Safety', 'https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/food-safety-basics/leftovers-and-food-safety'],
    ['USDA FoodData Central', 'https://fdc.nal.usda.gov/'],
  ],
  health: [
    ['USDA FoodData Central', 'https://fdc.nal.usda.gov/'],
    ['FDA — Dietary Supplements', 'https://www.fda.gov/food/dietary-supplements'],
    ['NIH Office of Dietary Supplements', 'https://ods.od.nih.gov/factsheets/list-all/'],
  ],
};

const slugify = (value) => value.normalize('NFKD').replace(/[’']/g, '').replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase();
const yaml = (value) => JSON.stringify(value);
const categoryOrder = ['mushrooms', 'identification', 'growing', 'recipes', 'health'];

const bodySections = {
  mushrooms: ['Quick profile', 'Name and taxonomy', 'Identification framework', 'Habitat and season', 'Comparison notes', 'Sourcing and use', 'Safety limits'],
  identification: ['Start with context', 'Record the whole specimen', 'Examine the target feature', 'Compare multiple characters', 'Common interpretation errors', 'When to stop', 'Field record checklist'],
  growing: ['Define the batch', 'Materials and setup', 'Stage-by-stage workflow', 'What to record', 'Troubleshooting boundaries', 'Harvest or disposal', 'Next-batch improvements'],
  recipes: ['Why this method works', 'Ingredient selection', 'Preparation', 'Cooking method', 'Doneness cues', 'Variations', 'Storage and reheating'],
  health: ['Bottom line', 'What is being studied', 'How to read the evidence', 'What the evidence cannot show', 'Practical interpretation', 'Safety and interactions', 'Questions for a clinician'],
};

function paragraph(category, common, scientific, angle, scope, section, index) {
  const identity = scientific.includes('species') || scientific.includes('group') ? `${common} (${scientific})` : `${common} (*${scientific}*)`;
  const shared = `${identity} is the subject of this ${angle}. The useful scope is ${scope}. This section focuses on ${section.toLowerCase()} and keeps observations, published evidence, and practical decisions separate.`;
  const extras = {
    mushrooms: `A common name is not a species-level determination, and characters can change with age, weather, substrate, geography, or cultivation. Record the underside, attachment, dimensions, substrate, nearby trees, odor, and spore deposit before comparing a specimen with a current regional key.`,
    identification: `No photograph, app result, cap color, or single field character establishes edibility. Work from several independent characters and a local key; where food use is contemplated, seek in-person confirmation from a qualified local identifier.`,
    growing: `Use authenticated commercial culture and instructions for the exact strain and stage. Label each batch, separate clean and dirty work, and isolate material with unexpected color, slime, insects, or persistent abnormal odor instead of trying to rescue it for food.`,
    recipes: `Use only mushrooms sold as food by a reputable supplier. Prepare ingredients consistently, use sensory doneness cues alongside time, prevent cross-contamination, refrigerate leftovers promptly, and discard food held or stored unsafely.`,
    health: `Food composition, laboratory experiments, animal studies, observational research, and clinical trials answer different questions. Results for one species, fungal part, extract, dose, or population cannot automatically support broad treatment claims or a different retail product.`,
  };
  const close = index % 2 === 0
    ? `Write down the source and date for every decision-changing claim. Specific records make later updates possible when taxonomy, guidance, or evidence changes.`
    : `Treat uncertainty as useful information: state what is known, what was not measured, and what additional evidence would change the conclusion.`;
  return `${shared}\n\n${extras[category]} ${close}`;
}

function frontmatter({ title, description, category, common, scientific, angle, slug, index }) {
  const src = sources[category];
  return `---\n${[
    `title: ${yaml(title)}`,
    `seoTitle: ${yaml(title.slice(0, 60))}`,
    `description: ${yaml(description)}`,
    `keywords: [${yaml(common)}, ${yaml(angle)}, ${yaml(`${common} ${category}`)}]`,
    `category: ${category}`,
    `author: ${yaml('MushroomScope Editorial Team')}`,
    `publishDate: ${createdAt}`,
    'draft: true',
    'featured: false',
    'relatedEntries: []',
    'sources:',
    src.map(([t, u]) => `  - title: ${yaml(t)}\n    url: ${yaml(u)}`).join('\n'),
    'faq:',
    `  - question: ${yaml(`What should readers verify before using this ${common} guide?`)}\n    answer: ${yaml('Verify the scientific identity, geographic and practical context, source dates, and any safety-critical claim against current authoritative guidance before acting.')}`,
    `  - question: ${yaml(`Can one photograph or marketing name confirm ${common} identity?`)}\n    answer: ${yaml('No. Common names and photographs omit decisive context; use provenance, multiple characters, current references, and qualified local help when a safety decision is involved.')}`,
    `  - question: ${yaml(`Why is this ${angle} kept as a draft?`)}\n    answer: ${yaml('It requires an editorial fact check, topic-specific citations, internal links, and an original licensed image before publication.')}`,
    category === 'mushrooms' ? `scientificName: ${yaml(scientific)}\ncommonNames: [${yaml(common)}]` : '',
    category === 'health' ? `evidenceSummary: ${yaml('This draft distinguishes food composition and preliminary research from clinically meaningful human evidence; conclusions require topic-specific verification.')}\nevidenceLevel: insufficient\nreviewStatus: editorial\nreviewDate: ${createdAt}\nmedicalDisclaimer: ${yaml('Educational information only. This page does not diagnose, treat, or replace individualized medical care.')}` : '',
    'generation:',
    `  libraryId: ${yaml(`MS-${String(index).padStart(4, '0')}`)}`,
    `  slug: ${yaml(slug)}`,
    '  pass: 3',
    `  status: ${yaml('research-draft')}`,
  ].filter(Boolean).join('\n')}\n---`;
}

function article(item) {
  const { category, common, scientific, angle, scope, index } = item;
  const label = category === 'recipes' ? `${common}: ${angle}` : `${common} ${angle}`;
  const title = label.replace(/\b\w/g, (c) => c.toUpperCase());
  const slug = `${slugify(common)}-${slugify(angle)}`;
  const description = `A careful ${angle} for ${common}, covering ${scope}, with explicit evidence and editorial review boundaries.`;
  const sections = bodySections[category].map((section, i) => `## ${section}\n\n${paragraph(category, common, scientific, angle, scope, section, index + i)}`).join('\n\n');
  const checklist = `## Editorial review checklist\n\n- [ ] Confirm every species-specific or quantitative statement against the linked source and add page-level citations.\n- [ ] Replace broad database links with the exact record, paper, or extension page used.\n- [ ] Add at least two genuinely related published entries; do not create circular or decorative links.\n- [ ] Commission or license an original cover image and write factual alt text.\n- [ ] Check overlap against published pages and preserve one clear search intent.\n- [ ] Complete the category schema before changing \`draft\` to \`false\`.\n- [ ] Obtain an additional safety review for medical, toxicology, wild-identification, or foraging claims.`;
  const references = `## References\n\n${sources[category].map(([t, u], i) => `${i + 1}. [${t}](${u}) — starting reference; replace or supplement with the exact topic-level record during editorial review.`).join('\n')}`;
  return { category, slug, title, description, content: `${frontmatter({ title, description, category, common, scientific, angle, slug, index })}\n\n${sections}\n\n## Frequently asked questions\n\n### What is the safest way to use this draft?\n\nUse it as a structured research brief. Verify the exact organism, method, food, product, population, and jurisdiction before turning a general statement into practical advice.\n\n### Does this page identify a wild mushroom or provide medical care?\n\nNo. It cannot authenticate a specimen, establish edibility, diagnose a condition, or replace a qualified local expert or clinician.\n\n### What must happen before publication?\n\nA human editor must complete the checklist below, resolve every general citation into a topic-specific source, and confirm that the page adds value beyond existing MushroomScope coverage.\n\n${references}\n\n${checklist}\n` };
}

await mkdir(articleRoot, { recursive: true });
const items = [];
let index = 1;
for (const category of categoryOrder) {
  for (const [common, scientific] of species.slice(0, 20)) {
    for (const [angle, scope] of topicSets[category]) {
      items.push(article({ category, common, scientific, angle, scope, index: index++ }));
    }
  }
}

if (items.length !== 500) throw new Error(`Expected 500 items, generated ${items.length}`);
for (const item of items) {
  const dir = join(articleRoot, item.category);
  await mkdir(dir, { recursive: true });
  const path = join(dir, `${item.slug}.md`);
  try {
    const existing = await readFile(path, 'utf8');
    if (!/libraryId:\s*"MS-\d{4}"/.test(existing)) throw new Error(`Refusing to overwrite unmanaged file ${path}`);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  await writeFile(path, item.content);
}

const manifest = {
  version: 1,
  createdAt,
  count: items.length,
  status: 'research-draft',
  publicationPolicy: 'Move into src/content only after human fact-checking, topic-specific citations, original imagery, internal-link review, and schema completion.',
  items: items.map((item, i) => ({
    id: `MS-${String(i + 1).padStart(4, '0')}`,
    key: `${item.category}/${item.slug}`,
    title: item.title,
    category: item.category,
    file: `content-library/drafts/${item.category}/${item.slug}.md`,
    status: 'research-draft',
    priority: i + 1,
  })),
};
await writeFile(join(generatedRoot, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);

const queue = JSON.parse(await readFile(queuePath, 'utf8'));
queue.dailyLimit = 2;
queue.updatedAt = createdAt;
queue.library = { manifest: 'content-library/manifest.json', count: 500, policy: 'Only reviewed items may be copied into this queue with status ready.' };
await writeFile(queuePath, `${JSON.stringify(queue, null, 2)}\n`);

console.log(`Generated ${items.length} research drafts in content-library/drafts.`);
