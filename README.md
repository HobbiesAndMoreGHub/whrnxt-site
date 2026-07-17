# WHRNXT site (whrnxt.net)

Marketing landing page + articles for WHRNXT. Built with [Eleventy](https://www.11ty.dev/)
and deployed on Netlify. **This is its own project — separate from the app repo.**

## Run it locally
```bash
npm install
npm start          # live preview at http://localhost:8080
```
Build the static site to `_site/`:
```bash
npm run build
```

## Add an article
Create a Markdown file in `src/posts/`, e.g. `src/posts/my-new-article.md`:
```markdown
---
title: My new article
description: One-line summary shown on the /articles list and in search results.
kicker: Guide
date: 2026-07-20
---

Write the article in **Markdown**. It automatically gets the shared layout,
appears on the /articles page (newest first), and lives at
/articles/my-new-article/.
```
That's it — no HTML, no touching the layout. Commit and push; Netlify rebuilds.

## Deploy (Netlify, git-based)
1. Push this folder to a **dedicated GitHub repo** (see below).
2. In Netlify, link the `whrnxt-site` project to that repo.
3. `netlify.toml` already sets the build command (`npm run build`) and publish
   dir (`_site`) — nothing to configure in the dashboard.

Every push then auto-deploys. The two forms (share a trip / launch list) use
Netlify Forms and appear under **Netlify → Forms** for manual review.

## Structure
```
src/
  index.njk            landing page
  articles.njk         /articles index (lists all posts)
  404.njk              not-found page
  thanks.njk           form success page
  posts/*.md           one Markdown file per article
  _includes/           base layout + nav/footer/post partials
  _data/site.json      site name, URLs, email (edit these once)
  assets/styles.css    the shared "departures board" design
```
