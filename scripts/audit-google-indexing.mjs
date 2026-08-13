#!/usr/bin/env node

import { createSign } from 'node:crypto';
import { readFile } from 'node:fs/promises';

const keyFile = process.env.GOOGLE_SERVICE_ACCOUNT_FILE
  || '/Users/asuka/.config/suangeshui/google-service-account.json';
const siteUrl = process.env.GSC_SITE_URL || 'sc-domain:mushroomscope.com';
const sitemapUrl = process.env.SITEMAP_URL || 'https://mushroomscope.com/sitemap.xml';
const concurrency = 10;

const base64url = (value) => Buffer.from(value).toString('base64url');

async function getAccessToken(credentials) {
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claim = base64url(JSON.stringify({
    iss: credentials.client_email,
    scope: 'https://www.googleapis.com/auth/webmasters.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  }));
  const unsigned = `${header}.${claim}`;
  const signer = createSign('RSA-SHA256');
  signer.update(unsigned);
  signer.end();
  const assertion = `${unsigned}.${signer.sign(credentials.private_key, 'base64url')}`;
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  });
  if (!response.ok) throw new Error(`Google OAuth failed: HTTP ${response.status}`);
  return (await response.json()).access_token;
}

async function inspectUrl(url, token) {
  const response = await fetch('https://searchconsole.googleapis.com/v1/urlInspection/index:inspect', {
    method: 'POST',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify({ inspectionUrl: url, siteUrl, languageCode: 'en-US' }),
  });
  const result = await response.json();
  if (!response.ok) return { url, apiStatus: response.status, error: result.error?.message || 'Inspection failed' };
  const status = result.inspectionResult?.indexStatusResult || {};
  return {
    url,
    verdict: status.verdict || 'VERDICT_UNSPECIFIED',
    coverageState: status.coverageState || 'Unknown',
    robotsTxtState: status.robotsTxtState || 'ROBOTS_TXT_STATE_UNSPECIFIED',
    indexingState: status.indexingState || 'INDEXING_STATE_UNSPECIFIED',
    pageFetchState: status.pageFetchState || 'PAGE_FETCH_STATE_UNSPECIFIED',
    lastCrawlTime: status.lastCrawlTime || null,
    googleCanonical: status.googleCanonical || null,
    userCanonical: status.userCanonical || null,
  };
}

const credentials = JSON.parse(await readFile(keyFile, 'utf8'));
const token = await getAccessToken(credentials);
const sitemapResponse = await fetch(sitemapUrl);
if (!sitemapResponse.ok) throw new Error(`Sitemap fetch failed: HTTP ${sitemapResponse.status}`);
const sitemap = await sitemapResponse.text();
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
const rows = [];
for (let start = 0; start < urls.length; start += concurrency) {
  rows.push(...await Promise.all(urls.slice(start, start + concurrency).map((url) => inspectUrl(url, token))));
}

const countBy = (key) => Object.fromEntries(
  [...new Set(rows.map((row) => row[key] || 'Unknown'))]
    .sort()
    .map((value) => [value, rows.filter((row) => (row[key] || 'Unknown') === value).length]),
);
const canonicalMismatches = rows.filter((row) => row.googleCanonical && row.userCanonical && row.googleCanonical !== row.userCanonical);
const technicalFailures = rows.filter((row) =>
  row.apiStatus
  || row.robotsTxtState === 'DISALLOWED'
  || row.indexingState !== 'INDEXING_ALLOWED' && row.indexingState !== 'INDEXING_STATE_UNSPECIFIED'
  || row.pageFetchState !== 'SUCCESSFUL' && row.pageFetchState !== 'PAGE_FETCH_STATE_UNSPECIFIED',
);

console.log(JSON.stringify({
  generatedAt: new Date().toISOString(),
  siteUrl,
  sitemapUrl,
  inspected: rows.length,
  summary: {
    indexed: rows.filter((row) => row.verdict === 'PASS').length,
    notIndexed: rows.filter((row) => row.verdict !== 'PASS').length,
    coverage: countBy('coverageState'),
    technicalFailureCount: technicalFailures.length,
    canonicalMismatchCount: canonicalMismatches.length,
  },
  technicalFailures,
  canonicalMismatches,
  notIndexed: rows.filter((row) => row.verdict !== 'PASS'),
}, null, 2));
