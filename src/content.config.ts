import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import type { ImageMetadata } from 'astro';

const categories = ['mushrooms', 'identification', 'growing', 'health', 'recipes'] as const;
const difficulty = z.enum(['easy', 'moderate', 'difficult', 'expert', 'unknown']);

const commonFields = (image: () => z.ZodType<ImageMetadata>, category: (typeof categories)[number]) => ({
  title: z.string().min(10),
  description: z.string().min(50).max(170),
  keywords: z.array(z.string()).default([]),
  category: z.literal(category),
  author: z.string().default('MushroomScope Editorial Team'),
  publishDate: z.coerce.date(),
  updatedDate: z.coerce.date().optional(),
  coverImage: image().optional(),
  coverAlt: z.string().optional(),
  imageCredit: z.string().optional(),
  imageNote: z.string().optional(),
  relatedEntries: z.array(z.string().regex(/^(mushrooms|identification|growing|health|recipes)\/[a-z0-9-]+$/)).default([]),
  draft: z.boolean().default(true),
  featured: z.boolean().default(false),
  reviewedBy: z.string().optional(),
  sources: z.array(z.object({ title: z.string().min(4), url: z.url() })).default([]),
  faq: z.array(z.object({ question: z.string().min(10), answer: z.string().min(40) })).default([]),
});

const requireForPublication = (data: Record<string, unknown>, ctx: z.RefinementCtx, fields: string[]) => {
  if (data.draft !== false) return;
  for (const field of fields) {
    const value = data[field];
    if (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
      ctx.addIssue({ code: 'custom', path: [field], message: `${field} is required before publication` });
    }
  }
  const coverAlt = typeof data.coverAlt === 'string' ? data.coverAlt.trim() : '';
  if (coverAlt && coverAlt.length < 20) {
    ctx.addIssue({ code: 'custom', path: ['coverAlt'], message: 'coverAlt must describe the image rather than repeat a short keyword' });
  }
};

const requireEditorialBasics = (data: Record<string, unknown>, ctx: z.RefinementCtx) => {
  requireForPublication(data, ctx, ['coverImage', 'coverAlt', 'imageCredit', 'imageNote', 'relatedEntries', 'sources', 'faq']);
  if (data.draft === false && Array.isArray(data.sources) && data.sources.length < 3) {
    ctx.addIssue({ code: 'custom', path: ['sources'], message: 'At least three sources are required before publication' });
  }
  if (data.draft === false && Array.isArray(data.relatedEntries) && data.relatedEntries.length < 2) {
    ctx.addIssue({ code: 'custom', path: ['relatedEntries'], message: 'At least two intentional internal relationships are required before publication' });
  }
  if (data.draft === false && Array.isArray(data.faq) && data.faq.length < 3) {
    ctx.addIssue({ code: 'custom', path: ['faq'], message: 'At least three topic-specific FAQs are required before publication' });
  }
};

const species = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/mushrooms' }),
  schema: ({ image }) => z.object({
    ...commonFields(image, 'mushrooms'),
    scientificName: z.string().optional(),
    taxonomicAuthority: z.string().optional(),
    synonyms: z.array(z.string()).default([]),
    externalIds: z.object({ ncbi: z.string().optional(), gbif: z.string().optional(), indexFungorum: z.string().optional() }).optional(),
    commonNames: z.array(z.string()).optional(),
    taxonomy: z.object({
      kingdom: z.string().default('Fungi'),
      phylum: z.string().optional(),
      class: z.string().optional(),
      order: z.string().optional(),
      family: z.string().optional(),
      genus: z.string(),
    }).optional(),
    identification: z.object({ summary: z.string(), keyFeatures: z.array(z.string()).min(1) }).optional(),
    appearance: z.object({
      cap: z.string(),
      hymenium: z.string(),
      stem: z.string(),
      flesh: z.string(),
      sporePrint: z.string(),
    }).optional(),
    habitat: z.object({ summary: z.string(), regions: z.array(z.string()), substrates: z.array(z.string()) }).optional(),
    season: z.object({ summary: z.string(), months: z.array(z.string()) }).optional(),
    edibility: z.object({ status: z.enum(['edible', 'inedible', 'conditional', 'unknown']), notes: z.string() }).optional(),
    toxicity: z.object({ level: z.enum(['none-known', 'low', 'moderate', 'high', 'deadly', 'unknown']), notes: z.string() }).optional(),
    nutrition: z.object({ summary: z.string(), servingSize: z.string().optional(), calories: z.number().nonnegative().optional(), proteinGrams: z.number().nonnegative().optional(), fiberGrams: z.number().nonnegative().optional() }).optional(),
    growingDifficulty: z.object({ level: z.enum(['not-cultivated', 'easy', 'moderate', 'difficult', 'expert', 'unknown']), notes: z.string() }).optional(),
    similarSpecies: z.array(z.object({ name: z.string(), slug: z.string().optional(), differences: z.string() })).optional(),
  }).superRefine((data, ctx) => {
    requireEditorialBasics(data, ctx);
    requireForPublication(data, ctx, ['scientificName', 'commonNames', 'identification', 'appearance', 'habitat', 'season', 'edibility', 'toxicity', 'nutrition', 'growingDifficulty', 'similarSpecies', 'sources', 'faq']);
    if (data.draft === false && data.sources.length < 3) ctx.addIssue({ code: 'custom', path: ['sources'], message: 'At least three sources are required before publication' });
    if (data.draft === false && data.faq.length < 3) ctx.addIssue({ code: 'custom', path: ['faq'], message: 'At least three FAQs are required before publication' });
  }),
});

const identification = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/identification' }),
  schema: ({ image }) => z.object({
    ...commonFields(image, 'identification'),
    cap: z.object({ shape: z.array(z.string()), color: z.array(z.string()), surface: z.array(z.string()), size: z.string() }).optional(),
    stem: z.object({ shape: z.array(z.string()), color: z.array(z.string()), surface: z.array(z.string()), ring: z.string(), volva: z.string() }).optional(),
    gills: z.object({ attachment: z.array(z.string()), spacing: z.array(z.string()), color: z.array(z.string()), notes: z.string().optional() }).optional(),
    spores: z.object({ printColor: z.array(z.string()), shape: z.array(z.string()), size: z.string().optional() }).optional(),
    habitat: z.object({ summary: z.string(), substrates: z.array(z.string()), associatedTrees: z.array(z.string()).default([]), regions: z.array(z.string()) }).optional(),
    safetyNotice: z.string().optional(),
  }).superRefine((data, ctx) => {
    requireEditorialBasics(data, ctx);
    requireForPublication(data, ctx, ['cap', 'stem', 'gills', 'spores', 'habitat', 'safetyNotice']);
  }),
});

const growing = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/growing' }),
  schema: ({ image }) => z.object({
    ...commonFields(image, 'growing'),
    targetSpecies: z.array(z.string()).optional(),
    difficulty: difficulty.optional(),
    methods: z.array(z.string()).optional(),
    substrates: z.array(z.string()).optional(),
    conditions: z.object({ colonizationTemperature: z.string(), fruitingTemperature: z.string(), humidity: z.string(), light: z.string(), freshAir: z.string() }).optional(),
    timeline: z.object({ colonization: z.string(), fruiting: z.string(), total: z.string().optional() }).optional(),
    equipment: z.array(z.string()).optional(),
    contaminationRisks: z.array(z.object({ name: z.string(), prevention: z.string() })).optional(),
    steps: z.array(z.object({ title: z.string(), instruction: z.string() })).optional(),
  }).superRefine((data, ctx) => {
    requireEditorialBasics(data, ctx);
    requireForPublication(data, ctx, ['targetSpecies', 'difficulty', 'methods', 'substrates', 'conditions', 'timeline', 'equipment', 'contaminationRisks', 'steps']);
  }),
});

const recipes = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/recipes' }),
  schema: ({ image }) => z.object({
    ...commonFields(image, 'recipes'),
    mushroomSpecies: z.array(z.string()).optional(),
    dietaryTags: z.array(z.string()).default([]),
    recipe: z.object({
      prepTime: z.string().min(2),
      cookTime: z.string().min(2),
      totalTime: z.string().min(2).optional(),
      recipeYield: z.string(),
      recipeCategory: z.string().default('Main course'),
      recipeCuisine: z.string().optional(),
      ingredients: z.array(z.string()).min(1),
      instructions: z.array(z.string()).min(1),
      calories: z.string().optional(),
    }).optional(),
  }).superRefine((data, ctx) => {
    requireEditorialBasics(data, ctx);
    requireForPublication(data, ctx, ['mushroomSpecies', 'recipe']);
  }),
});

const health = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/health' }),
  schema: ({ image }) => z.object({
    ...commonFields(image, 'health'),
    evidenceSummary: z.string().optional(),
    evidenceLevel: z.enum(['established', 'moderate', 'preliminary', 'insufficient']).optional(),
    reviewStatus: z.enum(['editorial', 'expert-reviewed']).default('editorial'),
    reviewDate: z.coerce.date().optional(),
    medicalDisclaimer: z.string().optional(),
  }).superRefine((data, ctx) => {
    requireEditorialBasics(data, ctx);
    requireForPublication(data, ctx, ['evidenceSummary', 'evidenceLevel', 'reviewStatus', 'reviewDate', 'medicalDisclaimer', 'sources', 'faq']);
    if (data.draft === false && data.reviewStatus === 'expert-reviewed' && !data.reviewedBy) ctx.addIssue({ code: 'custom', path: ['reviewedBy'], message: 'reviewedBy is required for expert-reviewed health content' });
    if (data.draft === false && data.reviewStatus === 'expert-reviewed' && !data.reviewDate) ctx.addIssue({ code: 'custom', path: ['reviewDate'], message: 'reviewDate is required for expert-reviewed health content' });
  }),
});

export const collections = { species, identification, growing, recipes, health };
