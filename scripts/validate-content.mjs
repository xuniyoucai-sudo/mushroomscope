import { readdir, readFile } from 'node:fs/promises';
import { extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../src/content/', import.meta.url));
const files = [];
const walk = async (directory) => {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await walk(path);
    else if (['.md', '.mdx'].includes(extname(entry.name))) files.push(path);
  }
};
await walk(root);

const errors = [];
const published = [];
const placeholderPattern = /\[(?:describe|cover|add|insert|write|todo)\b|\b(?:todo|tbd|lorem ipsum|draft template)\b/gi;
for (const file of files) {
  const source = await readFile(file, 'utf8');
  const frontmatterEnd = source.indexOf('\n---', 4);
  if (frontmatterEnd < 0) {
    errors.push(`${relative(root, file)}: missing closing frontmatter delimiter`);
    continue;
  }
  const frontmatter = source.slice(4, frontmatterEnd);
  const body = source.slice(frontmatterEnd + 4);
  if (!/^draft:\s*false\s*$/m.test(frontmatter)) continue;
  published.push(file);
  if (placeholderPattern.test(source)) errors.push(`${relative(root, file)}: contains placeholder text`);
  placeholderPattern.lastIndex = 0;
  if (/^#\s+/m.test(body)) errors.push(`${relative(root, file)}: body contains an H1; the layout supplies the only H1`);
  const sourceCount = (frontmatter.match(/^\s+- title:/gm) ?? []).length;
  if (sourceCount < 3) errors.push(`${relative(root, file)}: published entries require at least three sources`);
  const faqCount = (frontmatter.match(/^\s+- question:/gm) ?? []).length;
  if (faqCount < 3) errors.push(`${relative(root, file)}: published entries require at least three FAQs`);
  if (!/^## References\s*$/m.test(body)) errors.push(`${relative(root, file)}: published entries require a visible References section`);
}

if (errors.length) {
  console.error(`Content validation failed (${errors.length} issue${errors.length === 1 ? '' : 's'}):\n- ${errors.join('\n- ')}`);
  process.exit(1);
}
console.log(`Content validation passed for ${published.length} published entries.`);
