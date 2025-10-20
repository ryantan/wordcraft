# 9. Deployment Architecture

## Deployment Strategy

**Frontend Deployment:**
- **Platform:** Vercel
- **Build Command:** `pnpm build`
- **Output Directory:** `.next`
- **CDN/Edge:** Vercel Edge Network (global CDN, 300+ locations)

**No Backend Deployment:**
- Application is entirely client-side
- No server-side API routes
- No database connections

## Vercel Configuration

**vercel.json:**

```json
{
  "buildCommand": "pnpm build",
  "installCommand": "pnpm install",
  "framework": "nextjs",
  "regions": ["sfo1"],
  "env": {
    "NEXT_PUBLIC_APP_NAME": "WordCraft",
    "NEXT_PUBLIC_APP_VERSION": "1.0.0"
  }
}
```

**next.config.js:**

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Static export for client-side only app
  reactStrictMode: true,

  // Optimize images (future)
  images: {
    unoptimized: true, // Required for static export
  },

  // Environment variables
  env: {
    APP_VERSION: process.env.npm_package_version,
  },
}

module.exports = nextConfig
```

## CI/CD Pipeline

**GitHub Actions Workflow (.github/workflows/deploy.yml):**

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Type check
        run: pnpm type-check

      - name: Lint
        run: pnpm lint

      - name: Test
        run: pnpm test:coverage

      - name: Build
        run: pnpm build

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

## Environments

| Environment | URL | Purpose | Trigger |
|-------------|-----|---------|---------|
| **Development** | http://localhost:3000 | Local development | `pnpm dev` |
| **Preview** | https://spelling-fun-git-*.vercel.app | Pre-production testing | Every PR |
| **Production** | https://wordcraft.app | Live environment | Push to `main` |

**Environment-Specific Configuration:**

- **Development:** Hot reload, verbose logging, React DevTools enabled
- **Preview:** Production build, preview URLs for testing, same as production
- **Production:** Optimized build, minified assets, error tracking (future)

## Deployment Checklist

Before deploying to production:

- [ ] All tests pass (`pnpm test:all`)
- [ ] TypeScript builds without errors (`pnpm type-check`)
- [ ] Linting passes (`pnpm lint`)
- [ ] E2E tests pass (`pnpm test:e2e`)
- [ ] Manual smoke testing completed
- [ ] No console errors in production build
- [ ] Bundle size within budget (<200KB initial)
- [ ] Lighthouse score >90 (Performance, Accessibility, Best Practices, SEO)
- [ ] Works in private browsing mode
- [ ] localStorage persistence verified
- [ ] Cross-browser testing (Chrome, Safari, Firefox)

---
