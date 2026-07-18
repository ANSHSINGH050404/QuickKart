# QuickKart

**10-minute grocery delivery** platform (Zepto-style) built as a Turborepo monorepo.

## Vision

Browse products from nearby dark stores, place orders, track deliveries, and manage ops from admin.

## Monorepo

| Path | Role |
|------|------|
| `apps/web` | Customer web app |
| `apps/admin` | Admin dashboard |
| `apps/api` | Backend API |
| `packages/auth` | Auth shared package |
| `packages/database` | DB layer |
| `packages/ui` | Shared UI |

See [`Architecture.md`](./Architecture.md) for the PRD and MVP phases (auth, location, catalog, cart, orders).

## Getting started

```bash
git clone https://github.com/ANSHSINGH050404/QuickKart.git
cd QuickKart
bun install
cp .env.example .env   # if present
bun run db:generate
bun run db:push
bun run dev
```

## Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Dev all apps |
| `bun run build` | Build |
| `bun run lint` / `typecheck` | Quality |
| `bun run db:studio` | Prisma/DB studio |

## Author

[ANSHSINGH050404](https://github.com/ANSHSINGH050404)