import { getCollection } from 'astro:content';

export const MIN_TAXON_ROUTE_ENTRIES = 3;
export const MIN_GENUS_INDEX_ENTRIES = 5;
export const MIN_FAMILY_INDEX_ENTRIES = 6;

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
    .sort((a, b) => entryDisplayDate(b).valueOf() - entryDisplayDate(a).valueOf());
}

export const entryDisplayDate = (entry: { data: { publishDate: Date; updatedDate?: Date } }) =>
  entry.data.updatedDate ?? entry.data.publishDate;

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

  const minimum = rank === 'genus' ? MIN_GENUS_INDEX_ENTRIES : MIN_FAMILY_INDEX_ENTRIES;
  return [...counts].filter(([, count]) => count >= minimum);
}

export function getRoutableTaxa(
  species: Array<{ data: { taxonomy?: { genus?: string; family?: string } } }>,
  rank: 'genus' | 'family',
) {
  const counts = species.reduce((map, { data }) => {
    const value = data.taxonomy?.[rank];
    if (value) map.set(value, (map.get(value) ?? 0) + 1);
    return map;
  }, new Map<string, number>());

  return [...counts].filter(([, count]) => count >= MIN_TAXON_ROUTE_ENTRIES);
}
