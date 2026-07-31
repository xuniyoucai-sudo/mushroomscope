import type { APIRoute } from 'astro';
import { entryPath, getPublishedEntries } from '../lib/content';

export const GET: APIRoute = async () => {
  const entries = await getPublishedEntries();

  const index = entries.map((entry) => {
    const data = entry.data;
    const searchable = data as typeof data & Record<string, unknown>;
    const terms: string[] = [...data.keywords];
    const addList = (key: string) => {
      const value = searchable[key];
      if (Array.isArray(value)) terms.push(...value.filter((item): item is string => typeof item === 'string'));
    };

    if (entry.collection === 'species') {
      if (typeof searchable.scientificName === 'string') terms.push(searchable.scientificName);
      addList('commonNames');
    } else if (entry.collection === 'recipes') {
      addList('mushroomSpecies');
      addList('dietaryTags');
    } else if (entry.collection === 'growing') {
      addList('targetSpecies');
      addList('methods');
      addList('substrates');
    }

    return {
      title: data.title,
      description: data.description,
      category: data.category,
      url: entryPath(entry),
      terms: terms.filter(Boolean),
    };
  });

  return new Response(JSON.stringify(index), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
};
