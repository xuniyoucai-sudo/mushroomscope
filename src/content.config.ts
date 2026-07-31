import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const article = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content' }),
  schema: ({ image }) => z.object({
    title: z.string(),
    description: z.string().max(170),
    keywords: z.array(z.string()).default([]),
    category: z.enum(['mushrooms', 'identification', 'growing', 'health', 'recipes']),
    author: z.string().default('MushroomScope Editorial Team'),
    publishDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    coverImage: image().optional(),
    coverAlt: z.string().optional(),
    draft: z.boolean().default(false),
    featured: z.boolean().default(false),
    faq: z.array(z.object({ question: z.string(), answer: z.string() })).default([]),
  }),
});

export const collections = { articles: article };
