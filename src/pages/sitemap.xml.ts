import type { APIRoute } from 'astro';
import { entryPath, getIndexableTaxa, getPublishedEntries, taxonPath } from '../lib/content';

const staticPaths = [
  '/', '/about/', '/authors/mushroomscope-editorial-team/', '/blog/', '/editorial-policy/', '/glossary/',
  '/hubs/mushroom-identification-safety/', '/hubs/mushroom-nutrition-evidence/', '/hubs/beginner-mushroom-growing/',
  '/hubs/easy-mushroom-recipes/', '/hubs/oyster-mushroom-guide/',
];
type SitemapEntry = { path: string; lastmod?: string };

const escapeXml = (value: string) => value
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&apos;');

export const GET: APIRoute = async ({ site }) => {
  const articles = await getPublishedEntries();
  const populatedCategories = [...new Set(articles.map(({ data }) => data.category))];
  const species = articles.filter(({ data }) => data.category === 'mushrooms');
  const genera = getIndexableTaxa(species as any, 'genus').map(([name]) => name);
  const families = getIndexableTaxa(species as any, 'family').map(([name]) => name);
  const paths: SitemapEntry[] = [
    ...staticPaths.map((path) => ({ path, lastmod: '2026-08-15' })),
    ...populatedCategories.map((category) => ({ path: `/${category}/`, lastmod: '2026-08-15' })),
    ...genera.map((genus) => ({ path: taxonPath('genus', genus) })),
    ...families.map((family) => ({ path: taxonPath('family', family) })),
    ...articles.map(({ id, data }) => ({
      path: entryPath({ id, data }),
      lastmod: (data.updatedDate ?? data.publishDate).toISOString().slice(0, 10),
    })),
  ];

  const urls = paths.map(({ path, lastmod }) => {
    const location = escapeXml(new URL(path, site).href);
    return `  <url>\n    <loc>${location}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ''}\n  </url>`;
  }).join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
