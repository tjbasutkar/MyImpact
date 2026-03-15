# Project Guidelines

## Code Style
- **TypeScript**: Strict mode enabled - full type annotations required for props, function returns, etc. Reference [tsconfig.json](tsconfig.json) for compiler options.
- **React**: Functional components with Server Components by default. Use `React.ReactNode` for children props (see [src/app/layout.tsx](src/app/layout.tsx#L16)).
- **Tailwind CSS v4**: Inline utility-first classes. Import via `@import "tailwindcss"` in [src/app/globals.css](src/app/globals.css). Supports dark mode with `prefers-color-scheme`.
- **Linting**: ESLint with Next.js core-web-vitals and TypeScript rules. Config in [eslint.config.mjs](eslint.config.mjs).

## Architecture
- **App Router**: Uses `src/app/` directory structure (not pages/). Root layout in [src/app/layout.tsx](src/app/layout.tsx), homepage in [src/app/page.tsx](src/app/page.tsx).
- **Path Aliases**: `@/*` maps to `./src/*` (configured in [tsconfig.json](tsconfig.json)).
- **Minimal Structure**: Currently only boilerplate; add components in `src/components/`, API routes in `src/app/api/`, utilities in `src/lib/`.

## Build and Test
- **Install**: `npm install`
- **Development**: `npm run dev` (starts dev server at localhost:3000)
- **Build**: `npm run build`
- **Serve Production**: `npm start`
- **Lint**: `npm run lint`
- **No tests configured yet** - add Jest or Vitest when implementing tests.

## Conventions
- **React 19 + TypeScript 5**: Ensure async components and new React APIs are properly typed.
- **Dark Mode**: Built-in support - check `prefers-color-scheme` when adding UI components.
- **Font Optimization**: Use `next/font/google` for fonts (Geist family in [src/app/layout.tsx](src/app/layout.tsx)).
- **Images**: Use `next/image` for automatic optimization (example in [src/app/page.tsx](src/app/page.tsx)).
- **Metadata**: Export from layout for SEO (see [src/app/layout.tsx](src/app/layout.tsx)).