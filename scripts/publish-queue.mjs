import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const queuePath = join(root, 'content-queue/queue.json');
const today = new Date().toISOString().slice(0, 10);

const queue = JSON.parse(await readFile(queuePath, 'utf8'));
const requestedLimit = Number(process.argv[2] ?? queue.dailyLimit ?? 2);
const limit = Math.min(requestedLimit, 2);

if (!Number.isInteger(requestedLimit) || requestedLimit < 1) {
  throw new Error('Publication limit must be a positive integer.');
}

const candidates = queue.items
  .filter((item) => item.status === 'ready')
  .sort((a, b) => (a.priority ?? 9999) - (b.priority ?? 9999))
  .slice(0, limit);

if (candidates.length === 0) {
  console.log('No ready queue items to publish.');
  process.exit(0);
}

for (const item of candidates) {
  if (item.editorialReview !== 'approved') {
    throw new Error(`${item.key} is ready but does not have editorialReview: approved.`);
  }
  const filePath = join(root, item.file);
  let source = await readFile(filePath, 'utf8');
  if (!/^draft:\s*true\s*$/m.test(source)) {
    throw new Error(`${item.file} is not an unpublished draft.`);
  }
  source = source
    .replace(/^draft:\s*true\s*$/m, 'draft: false')
    .replace(/^publishDate:\s*.+$/m, `publishDate: ${today}`);
  await writeFile(filePath, source);
  item.status = 'published';
  item.publishedDate = today;
}

queue.updatedAt = today;
await writeFile(queuePath, `${JSON.stringify(queue, null, 2)}\n`);

console.log(`Published ${candidates.length} item${candidates.length === 1 ? '' : 's'}:`);
for (const item of candidates) console.log(`- ${item.key}`);
