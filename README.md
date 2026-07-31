# MushroomScope

A production-ready, static-first mushroom knowledge website built with Astro, TypeScript, Markdown/MDX, and Tailwind CSS.

## Local development

Requirements: Node.js 22.12+ and pnpm 11. The repository pins both versions for reproducible local, GitHub Actions, and Cloudflare builds.

```bash
corepack enable
pnpm install --frozen-lockfile
cp .env.example .env
pnpm dev
```

Open `http://localhost:4321`.

## Content

Add `.md` or `.mdx` files below `src/content/<category>/`. The site uses separate `species`, `identification`, `growing`, `recipes`, and `health` collections with domain-specific validation. See [CONTENT_ARCHITECTURE.md](./CONTENT_ARCHITECTURE.md) for the complete field model and publishing rules.

```yaml
---
title: "Article title"
description: "A concise search description."
keywords: ["mushrooms"]
category: mushrooms
author: "MushroomScope Editorial Team"
publishDate: 2026-07-31
updatedDate: 2026-07-31
coverImage: "../../assets/example.webp"
coverAlt: "Descriptive alternative text"
draft: false
featured: false
faq:
  - question: "Example question?"
    answer: "Example answer."
---
```

Drafts may omit collection-specific database fields. Setting `draft: false` activates the full publication requirements for that collection, preventing incomplete records from building. Recipe times use ISO 8601 durations (for example `PT15M`); the article layout renders the structured recipe fields and emits matching `Recipe` structured data.

The route is derived from the content path. For example, `src/content/mushrooms/lions-mane.md` builds `/mushrooms/lions-mane/`.

### Draft template library

The repository includes 100 editorial templates: 20 each for mushrooms, identification, growing, health, and recipes. Every template uses `draft: true`, so it is excluded from public routes, category listings, RSS, and the sitemap. Replace all bracketed notes with original researched content, add licensed imagery and sources, complete the editorial checklist, set accurate dates, and only then change `draft` to `false`.

## Build

```bash
pnpm check
pnpm build
pnpm preview
```

The static production output is written to `dist/`.

## Google services

Copy `.env.example` to `.env` and add IDs only when ready. All integrations remain disabled while values are blank. Before enabling Analytics or AdSense, implement consent controls appropriate to each visitor's jurisdiction and expand the privacy policy.

For AdSense, add the exact `ads.txt` line supplied by your approved account to `public/ads.txt`. Do not publish a placeholder or guessed publisher ID. Then configure Google's Privacy & messaging consent flow for the regions you serve. AdSense approval still depends on sufficient original content and policy review; technical readiness alone does not guarantee approval.

## Upload to GitHub

Create an empty repository, then run:

```bash
git add .
git commit -m "Build MushroomScope Astro foundation"
git branch -M main
git remote add origin https://github.com/YOUR-ACCOUNT/mushroomscope.git
git push -u origin main
```

The included GitHub Actions workflow installs the locked dependencies, runs Astro's type checker, builds the complete static site, and uploads `dist` as a temporary workflow artifact on every push and pull request targeting `main`.

## Deploy to Cloudflare Pages

1. In Cloudflare, open **Workers & Pages → Create → Pages → Connect to Git**.
2. Select the GitHub repository.
3. Set the production branch to **main** and the framework preset to **Astro**.
4. Use `npm run build` as the build command and `dist` as the output directory.
5. Set `NODE_VERSION=22.12.0` in the Pages build environment. Cloudflare will use the committed pnpm lockfile during dependency installation.
6. Add the optional public environment variables from `.env.example` in the Pages project settings.
7. Save and deploy.

No server adapter is required because the site uses static generation.

## Add mushroomscope.com

1. Open the Pages project and choose **Custom domains → Set up a custom domain**.
2. Enter `mushroomscope.com` and follow the DNS prompts.
3. Add `www.mushroomscope.com` as a second custom domain if desired, then configure a redirect so only one hostname is canonical.
4. Confirm HTTPS is active and submit `https://mushroomscope.com/sitemap.xml` in Google Search Console.
