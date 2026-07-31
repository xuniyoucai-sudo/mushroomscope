import type { APIRoute } from 'astro';
import { entryPath, getPublishedEntries } from '../lib/content';

const staticPaths = ['/', '/about/', '/editorial-policy/', '/disclaimer/'];
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
  const paths: SitemapEntry[] = [
    ...staticPaths.map((path) => ({ path })),
    ...(articles.length ? [{ path: '/blog/' }] : []),
    ...populatedCategories.map((category) => ({ path: `/${category}/` })),
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
