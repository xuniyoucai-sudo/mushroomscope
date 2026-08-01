import type { APIRoute } from 'astro';
import { entryPath, getPublishedEntries } from '../lib/content';

const staticPaths = ['/', '/about/', '/authors/mushroomscope-editorial-team/', '/contact/', '/editorial-policy/', '/disclaimer/', '/glossary/', '/privacy-policy/', '/sitemap/', '/terms/'];
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
  const genera = [...new Set(species.map(({ data }) => (data as any).taxonomy?.genus).filter(Boolean))];
  const families = [...new Set(species.map(({ data }) => (data as any).taxonomy?.family).filter(Boolean))];
  const paths: SitemapEntry[] = [
    ...staticPaths.map((path) => ({ path })),
    ...(articles.length ? [{ path: '/blog/' }] : []),
    ...populatedCategories.map((category) => ({ path: `/${category}/` })),
    ...genera.map((genus) => ({ path: `/mushrooms/genus/${String(genus).toLowerCase()}/` })),
    ...families.map((family) => ({ path: `/mushrooms/family/${String(family).toLowerCase()}/` })),
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
