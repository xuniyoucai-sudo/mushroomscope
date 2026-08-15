import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const source = await readFile(join(root, 'scripts/generate-species-expansion.mjs'), 'utf8');
const slugs = [...source.matchAll(/^\s+\['([^']+)'/gm)].map((match) => match[1]);
const issues = [];
const entries = [];

for (const base of slugs) {
  const slug = base.endsWith('-mushroom') ? `${base}-guide` : `${base}-mushroom-guide`;
  const file = `src/content/mushrooms/${slug}.md`;
  const markdown = await readFile(join(root, file), 'utf8');
  const wordCount = markdown.replace(/^---[\s\S]*?---/, '').match(/[A-Za-z]+(?:['’][A-Za-z]+)?/g)?.length ?? 0;
  const exactGbif = markdown.match(/https:\/\/www\.gbif\.org\/species\/\d+/)?.[0];
  const checks = {
    draftIsolated: /^draft: true$/m.test(markdown),
    completeSchema: ['scientificName:', 'taxonomy:', 'identification:', 'appearance:', 'habitat:', 'season:', 'edibility:', 'toxicity:', 'nutrition:', 'growingDifficulty:', 'similarSpecies:'].every((field) => markdown.includes(field)),
    exactTaxonSource: Boolean(exactGbif),
    sourceCount: (markdown.match(/^\s+- title:/gm) ?? []).length >= 4,
    faqCount: (markdown.match(/^\s+- question:/gm) ?? []).length >= 5,
    internalLinks: (markdown.match(/^relatedEntries: \[(.+)\]$/m)?.[1].match(/"/g)?.length ?? 0) >= 4,
    sufficientBody: wordCount >= 900,
    localCoverImage: /^coverImage:/m.test(markdown),
  };
  for (const [check, passed] of Object.entries(checks)) if (!passed) issues.push(`${file}: ${check}`);
  entries.push({ file, slug, wordCount, exactGbif, checks, publicationReady: Object.values(checks).every(Boolean) && /^draft: false$/m.test(markdown) });
}

const report = { generatedAt: new Date().toISOString(), count: entries.length, publicationReady: entries.filter((entry) => entry.publicationReady).length, issues, entries };
await writeFile(join(root, 'content-library/species-expansion-report.json'), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ count: report.count, publicationReady: report.publicationReady, issueCount: issues.length, issueTypes: [...new Set(issues.map((issue) => issue.split(': ').at(-1)))] }, null, 2));
if (entries.length !== 30) process.exit(1);
