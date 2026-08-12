#!/usr/bin/env node

import { createSign } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";

const keyFile = process.env.GOOGLE_SERVICE_ACCOUNT_FILE
  || "/Users/asuka/.config/suangeshui/google-service-account.json";
const gscProperty = process.env.GSC_SITE_URL || "sc-domain:mushroomscope.com";
const ga4Property = process.env.GA4_PROPERTY_ID || "548108803";
const bingSite = process.env.BING_SITE_URL || "https://mushroomscope.com/";

const base64url = (value) => Buffer.from(value).toString("base64url");

async function getAccessToken(credentials) {
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = base64url(JSON.stringify({
    iss: credentials.client_email,
    scope: [
      "https://www.googleapis.com/auth/webmasters.readonly",
      "https://www.googleapis.com/auth/analytics.readonly",
    ].join(" "),
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  }));
  const unsigned = `${header}.${claim}`;
  const signer = createSign("RSA-SHA256");
  signer.update(unsigned);
  signer.end();
  const assertion = `${unsigned}.${signer.sign(credentials.private_key, "base64url")}`;

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });
  if (!response.ok) throw new Error(`Google OAuth failed: HTTP ${response.status}`);
  return (await response.json()).access_token;
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = body?.error?.message || body?.Message || `HTTP ${response.status}`;
    throw new Error(message);
  }
  return body;
}

const date = (value) => value.toISOString().slice(0, 10);
const range = (endOffset, length = 28) => {
  const endDate = new Date();
  endDate.setUTCDate(endDate.getUTCDate() - endOffset);
  const startDate = new Date(endDate);
  startDate.setUTCDate(startDate.getUTCDate() - (length - 1));
  return { startDate: date(startDate), endDate: date(endDate) };
};

async function getGsc(headers) {
  const endpoint = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(gscProperty)}/searchAnalytics/query`;
  const query = async (period) => fetchJson(endpoint, {
      method: "POST",
      headers: { ...headers, "content-type": "application/json" },
      body: JSON.stringify({
        ...period,
        dimensions: ["query", "page"],
        rowLimit: 250,
        dataState: "all",
      }),
    });
  const recentPeriod = range(3);
  const previousPeriod = range(31);
  const [recent, previous] = await Promise.all([
    query(recentPeriod),
    query(previousPeriod),
  ]);
  return {
    status: "connected",
    property: gscProperty,
    recent: { period: recentPeriod, rows: recent.rows || [] },
    previous: { period: previousPeriod, rows: previous.rows || [] },
  };
}

async function getGa4(headers) {
  const query = async (period) => fetchJson(
    `https://analyticsdata.googleapis.com/v1beta/properties/${ga4Property}:runReport`,
    {
      method: "POST",
      headers: { ...headers, "content-type": "application/json" },
      body: JSON.stringify({
        dateRanges: [{ startDate: period.startDate, endDate: period.endDate }],
        dimensions: [{ name: "pagePath" }],
        metrics: [
          { name: "sessions" },
          { name: "activeUsers" },
          { name: "screenPageViews" },
        ],
        limit: 250,
      }),
    },
  );
  const recentPeriod = range(1);
  const previousPeriod = range(29);
  const [recent, previous] = await Promise.all([
    query(recentPeriod),
    query(previousPeriod),
  ]);
  return {
    status: "connected",
    propertyId: ga4Property,
    recent: {
      period: recentPeriod,
      rowCount: Number(recent.rowCount || 0),
      rows: recent.rows || [],
    },
    previous: {
      period: previousPeriod,
      rowCount: Number(previous.rowCount || 0),
      rows: previous.rows || [],
    },
  };
}

function getBingKey() {
  if (process.env.BING_WEBMASTER_API_KEY) return process.env.BING_WEBMASTER_API_KEY;
  return execFileSync("security", [
    "find-generic-password",
    "-w",
    "-a",
    "mushroomscope-automation",
    "-s",
    "mushroomscope-bing-webmaster-api",
  ], { encoding: "utf8" }).trim();
}

async function getBing() {
  try {
    const key = getBingKey();
    const url = new URL("https://ssl.bing.com/webmaster/api.svc/json/GetUserSites");
    url.searchParams.set("apikey", key);
    const response = await fetchJson(url);
    const sites = response.d || [];
    const verified = sites.some((site) => site.Url === bingSite && site.IsVerified);
    return { status: verified ? "connected" : "site-unavailable", site: bingSite };
  } catch (error) {
    return { status: "unavailable", site: bingSite, error: error.message };
  }
}

const credentials = JSON.parse(await readFile(keyFile, "utf8"));
const token = await getAccessToken(credentials);
const headers = { authorization: `Bearer ${token}` };
const [gsc, ga4, bing] = await Promise.all([
  getGsc(headers),
  getGa4(headers),
  getBing(),
]);

console.log(JSON.stringify({ generatedAt: new Date().toISOString(), gsc, ga4, bing }, null, 2));
