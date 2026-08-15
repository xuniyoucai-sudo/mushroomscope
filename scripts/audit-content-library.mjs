import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const libraryRoot = join(root, 'content-library/drafts');
const reportPath = join(root, 'content-library/optimization-report.json');
const files = [];
const walk = async (dir) => {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) await walk(path);
    else if (entry.name.endsWith('.md')) files.push(path);
  }
};
await walk(libraryRoot);

const issues = [];
const titles = new Map();
const slugs = new Map();
const signatures = new Map();
const counts = {};
for (const file of files) {
  const source = await readFile(file, 'utf8');
  const rel = relative(root, file);
  const category = rel.split('/')[2];
  counts[category] = (counts[category] ?? 0) + 1;
  const title = source.match(/^title:\s*"([^"]+)"/m)?.[1];
  const slug = file.split('/').at(-1).replace(/\.md$/, '');
  const words = source.replace(/^---[\s\S]*?---/, '').match(/[A-Za-z]+(?:['’][A-Za-z]+)?/g)?.length ?? 0;
  const headings = source.match(/^##\s+/gm)?.length ?? 0;
  const sourceCount = source.match(/^\s+- title:/gm)?.length ?? 0;
  const faqCount = source.match(/^\s+- question:/gm)?.length ?? 0;
  if (!/^draft:\s*true$/m.test(source)) issues.push(`${rel}: must remain draft`);
  if (!/^\s+status:\s*"research-draft"$/m.test(source)) issues.push(`${rel}: missing research-draft status`);
  if (words < 900) issues.push(`${rel}: fewer than 900 words (${words})`);
  if (headings < 10) issues.push(`${rel}: insufficient section depth (${headings})`);
  if (sourceCount < 3) issues.push(`${rel}: fewer than 3 starting sources`);
  if (faqCount < 3) issues.push(`${rel}: fewer than 3 structured FAQs`);
  if (!/^## References$/m.test(source)) issues.push(`${rel}: missing References section`);
  if (!/^## Editorial review checklist$/m.test(source)) issues.push(`${rel}: missing editorial checklist`);
  if (/^coverImage:/m.test(source)) issues.push(`${rel}: research briefs must not imply completed image review`);
  if (!/- \[ \] Confirm every species-specific or quantitative statement/m.test(source)) issues.push(`${rel}: missing fact-check gate`);
  if (title) titles.set(title, [...(titles.get(title) ?? []), rel]);
  slugs.set(slug, [...(slugs.get(slug) ?? []), rel]);
  const signature = source.replace(/^---[\s\S]*?---/, '').toLowerCase().replace(/[^a-z]+/g, ' ').split(/\s+/).filter((w) => w.length > 4).slice(0, 80).sort().join(' ');
  signatures.set(signature, [...(signatures.get(signature) ?? []), rel]);
}

for (const [title, paths] of titles) if (paths.length > 1) issues.push(`duplicate title ${title}: ${paths.join(', ')}`);
for (const [slug, paths] of slugs) if (paths.length > 1) issues.push(`duplicate slug ${slug}: ${paths.join(', ')}`);
for (const paths of signatures.values()) if (paths.length > 1) issues.push(`highly similar opening signatures: ${paths.join(', ')}`);

const report = {
  generatedAt: new Date().toISOString(),
  total: files.length,
  categoryCounts: counts,
  optimizationPasses: [
    { pass: 1, focus: 'structure-and-schema', result: issues.filter((x) => /draft|status|section|source|FAQ|References|checklist/.test(x)).length === 0 ? 'passed' : 'failed' },
    { pass: 2, focus: 'search-intent-and-deduplication', result: issues.filter((x) => /duplicate|similar/.test(x)).length === 0 ? 'passed' : 'failed' },
    { pass: 3, focus: 'publication-safety-and-editorial-gates', result: issues.filter((x) => /draft|research-draft|checklist/.test(x)).length === 0 ? 'passed' : 'failed' },
  ],
  issues,
};
await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
if (files.length !== 500 || issues.length) process.exit(1);
