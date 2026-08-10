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
      const taxonomy = searchable.taxonomy as { genus?: string; family?: string } | undefined;
      if (taxonomy?.genus) terms.push(taxonomy.genus);
      if (taxonomy?.family) terms.push(taxonomy.family);
      const habitat = searchable.habitat as { regions?: string[]; substrates?: string[] } | undefined;
      terms.push(...(habitat?.regions ?? []), ...(habitat?.substrates ?? []));
      const similarSpecies = searchable.similarSpecies as { name?: string }[] | undefined;
      terms.push(...(similarSpecies ?? []).map(({ name }) => name).filter((name): name is string => Boolean(name)));
    } else if (entry.collection === 'identification') {
      const habitat = searchable.habitat as { regions?: string[]; substrates?: string[]; associatedTrees?: string[] } | undefined;
      terms.push(...(habitat?.regions ?? []), ...(habitat?.substrates ?? []), ...(habitat?.associatedTrees ?? []));
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
      terms: [...new Set(terms.filter(Boolean))],
    };
  });

  return new Response(JSON.stringify(index), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
};
