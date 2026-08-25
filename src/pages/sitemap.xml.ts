import type { APIRoute } from 'astro';
import { entryPath, getIndexableTaxa, getPublishedEntries, taxonPath } from '../lib/content';
import { hubDefinitions } from '../lib/hubs';

const editorialStaticPaths: SitemapEntry[] = [
  { path: '/about/', lastmod: '2026-08-15' },
  { path: '/authors/mushroomscope-editorial-team/', lastmod: '2026-08-23' },
  { path: '/editorial-policy/', lastmod: '2026-08-15' },
  { path: '/glossary/', lastmod: '2026-08-15' },
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
  const dateOf = (entry: (typeof articles)[number]) => entry.data.updatedDate ?? entry.data.publishDate;
  const maxDate = (entries: typeof articles) => entries.length
    ? new Date(Math.max(...entries.map((entry) => dateOf(entry).valueOf()))).toISOString().slice(0, 10)
    : undefined;
  const newestDate = maxDate(articles);
  const populatedCategories = [...new Set(articles.map(({ data }) => data.category))];
  const species = articles.filter(({ data }) => data.category === 'mushrooms');
  const genera = getIndexableTaxa(species as any, 'genus').map(([name]) => name);
  const families = getIndexableTaxa(species as any, 'family').map(([name]) => name);
  const hubEntries = Object.entries(hubDefinitions).map(([slug, hub]) => ({
    path: `/hubs/${slug}/`,
    lastmod: maxDate(articles.filter((entry) => hub.categories.includes(entry.data.category as never))),
  }));
  const paths: SitemapEntry[] = [
    { path: '/', lastmod: newestDate },
    { path: '/blog/', lastmod: newestDate },
    ...editorialStaticPaths,
    ...hubEntries,
    ...populatedCategories.map((category) => ({ path: `/${category}/`, lastmod: maxDate(articles.filter(({ data }) => data.category === category)) })),
    ...genera.map((genus) => ({ path: taxonPath('genus', genus), lastmod: maxDate(species.filter(({ data }) => (data as any).taxonomy?.genus === genus)) })),
    ...families.map((family) => ({ path: taxonPath('family', family), lastmod: maxDate(species.filter(({ data }) => (data as any).taxonomy?.family === family)) })),
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
