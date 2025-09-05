---
runme:
  document:
    relativePath: DEPLOY_CLOUDFLARE.md
  session:
    id: 01K4CPPV4AR6PTK9Q9TMBRME9X
    updated: 2025-09-05 17:39:52+07:00
---

First build with next-on-pages

```sh
npx @cloudflare/next-on-pages
```

Run deploy

```sh
npx wrangler pages deploy --commit-dirty=true
```