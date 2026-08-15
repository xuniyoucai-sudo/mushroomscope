import { getCollection } from 'astro:content';

export const MIN_TAXON_INDEX_ENTRIES = 3;

export async function getAllKnowledgeEntries() {
  const [species, identification, growing, recipes, health] = await Promise.all([
    getCollection('species'),
    getCollection('identification'),
    getCollection('growing'),
    getCollection('recipes'),
    getCollection('health'),
  ]);
  return [...species, ...identification, ...growing, ...recipes, ...health];
}

export async function getPublishedEntries() {
  return (await getAllKnowledgeEntries())
    .filter(({ data }) => !data.draft)
    .sort((a, b) => b.data.publishDate.valueOf() - a.data.publishDate.valueOf());
}

export const entryPath = (entry: { id: string; data: { category: string } }) =>
  `/${entry.data.category}/${entry.id}/`;

export const entryKey = (entry: { id: string; data: { category: string } }) =>
  `${entry.data.category}/${entry.id}`;

export const taxonPath = (rank: 'genus' | 'family', name: string) =>
  `/mushrooms/${rank}/${name.toLowerCase()}/`;

export function getIndexableTaxa(
  species: Array<{ data: { taxonomy?: { genus?: string; family?: string } } }>,
  rank: 'genus' | 'family',
) {
  const counts = species.reduce((map, { data }) => {
    const value = data.taxonomy?.[rank];
    if (value) map.set(value, (map.get(value) ?? 0) + 1);
    return map;
  }, new Map<string, number>());

  return [...counts].filter(([, count]) => count >= MIN_TAXON_INDEX_ENTRIES);
}
