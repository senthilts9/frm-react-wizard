# Cloudflare Pages deployment

## Git-based deployment

1. Push the project to GitHub.
2. Open Cloudflare Dashboard → Workers & Pages.
3. Create a Pages application and connect the repository.
4. Configure:

```text
Framework preset: Vite
Build command: npm run build
Build output directory: dist
Production branch: main
```

5. Save and deploy.

Cloudflare will provide a `pages.dev` URL. Every push to `main` creates a new production deployment. Other branches can create preview deployments.

## Current app storage

The starter stores progress in browser `localStorage`, so no backend or monthly bill is needed.

## Later cloud sync

When user accounts and cross-device progress are required, add Supabase or Cloudflare D1. Keep question-bank and PDF access private and authenticated.
