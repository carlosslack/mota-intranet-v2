# mota-intranet-v2

Intranet MOTA & Advogados. Next.js 15 + TypeScript + Tailwind + Prisma + Postgres + Auth.js v5 (Google/hd).

## Stack

- Next.js 15 App Router + React 19
- TypeScript, Tailwind, glassmorphism
- Prisma + Postgres 16
- NextAuth v5 · Google · restrito ao domínio `mota.adv.br`
- Docker Compose + Traefik
- Design: navy `#060d1f` + gold `#d4af37`, Instrument Sans / DM Sans, Material Symbols Outlined
- pt-BR · datas DD/MM/AAAA · protocolo `MOTA-0001`

## Dev

```bash
cp .env.example .env
npm install
npm run db:push
npm run dev
```

## Deploy

Push em `main` → GitHub Actions publica `ghcr.io/<owner>/mota-intranet-v2:latest`.
No servidor:

```bash
docker compose pull
docker compose up -d
```

Substitua `OWNER` no `docker-compose.yml` pelo dono do repositório.
