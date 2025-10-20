# cf-worker-wizard

A Next.js 14 (App Router) + TypeScript + Tailwind CSS + shadcn/ui app that guides you through deploying a Cloudflare Worker, binding a route, and setting up a DNS CNAME record.

This repository will host the Cloudflare Worker deployment wizard app.

- Framework: Next.js 14 App Router, React 18, TypeScript
- Styling: Tailwind CSS
- UI primitives: shadcn/ui (Radix-based)

## Monorepo layout

This repo uses a simple workspace with the app under apps/cf-worker-wizard.

- apps/cf-worker-wizard: Next.js application and API routes

## Getting started

Prerequisites: Node 18+.

Install dependencies and run the development server:

```bash
# Using pnpm (recommended)
pnpm install
pnpm dev

# Or using npm
npm install
npm run dev
```

Then visit http://localhost:3000.

## License

MIT
