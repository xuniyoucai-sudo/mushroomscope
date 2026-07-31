const host = 'mushroomscope.com';
const origin = `https://${host}`;
const key = '880b5a3546e99cd8294ac3c82eed13af';
const keyLocation = `${origin}/${key}.txt`;

const normalizeUrl = (value) => {
  const url = new URL(value, origin);
  if (url.hostname !== host) throw new Error(`Refusing to submit a different host: ${url.href}`);
  url.hash = '';
  return url.href;
};

const requested = process.argv.slice(2);
let urlList;
if (requested.length) {
  urlList = requested.map(normalizeUrl);
} else {
  const sitemapResponse = await fetch(`${origin}/sitemap.xml`, { headers: { 'User-Agent': 'MushroomScope-IndexNow/1.0' } });
  if (!sitemapResponse.ok) throw new Error(`Unable to fetch sitemap: HTTP ${sitemapResponse.status}`);
  const sitemap = await sitemapResponse.text();
  urlList = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => normalizeUrl(match[1]));
}

urlList = [...new Set(urlList)];
if (!urlList.length) throw new Error('No URLs found to submit.');
if (urlList.length > 10_000) throw new Error('IndexNow accepts at most 10,000 URLs per request.');

const keyResponse = await fetch(keyLocation, { headers: { 'User-Agent': 'MushroomScope-IndexNow/1.0' } });
if (!keyResponse.ok || (await keyResponse.text()).trim() !== key) {
  throw new Error(`IndexNow key verification failed at ${keyLocation}`);
}

const response = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8', 'User-Agent': 'MushroomScope-IndexNow/1.0' },
  body: JSON.stringify({ host, key, keyLocation, urlList }),
});

if (![200, 202].includes(response.status)) {
  const detail = (await response.text()).trim();
  throw new Error(`IndexNow submission failed: HTTP ${response.status}${detail ? ` — ${detail}` : ''}`);
}

console.log(`IndexNow accepted ${urlList.length} URL${urlList.length === 1 ? '' : 's'} (HTTP ${response.status}).`);
