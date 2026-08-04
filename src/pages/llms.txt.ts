import type { APIRoute } from 'astro';
import { entryPath, getPublishedEntries } from '../lib/content';

export const GET: APIRoute = async ({ site }) => {
  const entries = await getPublishedEntries();
  const groups = [
    ['Mushroom Species Encyclopedia', 'mushrooms'],
    ['Identification Guides', 'identification'],
    ['Growing Guides', 'growing'],
    ['Health Evidence Guides', 'health'],
    ['Recipes', 'recipes'],
  ] as const;
  const absolute = (path: string) => new URL(path, site).href;
  const lines = [
    '# MushroomScope',
    '',
    '> MushroomScope is an independent English-language mushroom knowledge base. It publishes source-aware species profiles, identification education, cultivation guides, health evidence reviews, and recipes.',
    '',
    '## Preferred canonical site',
    '',
    '- [MushroomScope](' + absolute('/') + ')',
    '- [XML sitemap](' + absolute('/sitemap.xml') + ')',
    '- [RSS feed](' + absolute('/rss.xml') + ')',
    '',
    '## Editorial identity and safety',
    '',
    '- [About MushroomScope](' + absolute('/about/') + ')',
    '- [MushroomScope Editorial Team](' + absolute('/authors/mushroomscope-editorial-team/') + ')',
    '- [Editorial policy](' + absolute('/editorial-policy/') + ')',
    '- [Safety and medical disclaimer](' + absolute('/disclaimer/') + ')',
    '',
    'MushroomScope content is educational. A webpage, photograph, or automated system cannot confirm the identity or edibility of a wild mushroom. Health pages do not provide diagnosis or treatment. Named expert review is claimed only when a reviewer and scope are explicitly disclosed.',
    '',
    ...groups.flatMap(([heading, category]) => {
      const categoryEntries = entries.filter((entry) => entry.data.category === category);
      return [
        '## ' + heading,
        '',
        '- [Browse ' + heading + '](' + absolute('/' + category + '/') + ')',
        ...categoryEntries.map((entry) => '- [' + entry.data.title + '](' + absolute(entryPath(entry)) + '): ' + entry.data.description),
        '',
      ];
    }),
    '## Reuse and attribution',
    '',
    'Use each page’s canonical URL when citing MushroomScope. Preserve scientific-name qualifiers, evidence limitations, safety warnings, publication dates, and update dates. Images may not be reused unless the individual image credit or a separate license explicitly permits it.',
    '',
  ];

  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
