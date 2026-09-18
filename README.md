# Mota Intranet + CRM + Financeiro IA

Portal interno da **Mota & Advogados**: intranet + CRM jurídico + módulo **Financeiro IA · DataDocs**.
Construído sobre **Next.js 15** (App Router) · **TypeScript** · **Prisma** + **PostgreSQL** · **Auth.js v5**
(Google SSO, `hd=mota.adv.br`) · **TailwindCSS**. Design system Mota — navy + gold, glassmorphism,
ícones Material Symbols. Deploy em Docker via GitHub Actions → GHCR → Hostinger (Traefik + Let's Encrypt).

> Produção: **https://intranet.motaadv.net**

---

## Módulos

**Menu**
- **Início** — portal / ações rápidas
- **Chamados TI** — suporte interno (protocolo, categoria, prioridade, status, comentários)
- **Comunicados** — mural de avisos
- **Agenda** — compromissos

**CRM Jurídico**
- **Leads** — prospecção (estágios, área jurídica, valor)
- **Casos** — processos (CNJ, cliente, área, status, atividades/prazos)
- **Clientes** — pessoa / empresa / poder público
- **Serviços** — catálogo de serviços jurídicos
- **Configurações**

**Financeiro IA · DataDocs** _(acesso restrito — whitelist + cofre com PIN)_
- **Bases de dados documentais**: o usuário cria categorias e envia arquivos (PDF, imagens, XML, CSV, XLSX, TXT…).
- **Leitura por visão**: PDFs/imagens são transcritos fielmente em Markdown por um modelo multimodal
  (preservando R$, CNPJ/CPF, datas, notas e impostos). Planilhas/CSV/JSON são lidos direto (SheetJS).
- **Busca semântica (RAG) opcional**: se houver modelo de embeddings, cada arquivo é vetorizado e a
  pergunta recupera os documentos mais relevantes (cosseno, top-8). Sem embeddings, usa contexto direto.
- **Pergunta em linguagem natural** → resposta como **tabela** ou texto, com as **fontes**.
- **Exportação .xlsx** do resultado (SheetJS).
- **IA 100% por env** (OpenAI-compatible) — nenhum provedor/modelo fixo no código.

---

## Stack & arquitetura

```
Next.js 15 (App Router, RSC)        UI + rotas de API (runtime nodejs)
TypeScript
Prisma 5 + PostgreSQL 16            ORM + banco
Auth.js v5 (next-auth) + Google     SSO restrito ao domínio (hd)
TailwindCSS                         design system Mota (navy/gold)
xlsx (SheetJS)                      leitura/geração de planilhas
```

### Estrutura (resumo)

```
src/
├─ app/
│  ├─ (páginas: chamados, casos, clientes, leads, servicos, comunicados, agenda, config, entrar)
│  ├─ financeiro/                 # módulo Financeiro IA
│  │  ├─ page.tsx                 # grid de bases (guard: allowed + unlocked)
│  │  ├─ [id]/page.tsx            # workspace de uma base
│  │  └─ _components/             # PinGate, BasesGrid, BaseWorkspace (client)
│  └─ api/
│     └─ financeiro/
│        ├─ unlock/               # POST — verifica PIN e libera o cofre (cookie HMAC 8h)
│        ├─ bases/                # GET/POST — listar/criar bases
│        ├─ bases/[id]/           # GET/DELETE — detalhe/excluir
│        ├─ bases/[id]/files/     # POST/DELETE — upload multipart + extração; remover
│        ├─ bases/[id]/ask/       # POST — pergunta em linguagem natural (RAG + chat)
│        └─ export/               # POST — gera .xlsx
├─ components/  Shell.tsx (sidebar/header), Icon.tsx
└─ lib/
   ├─ ai.ts        # camada IA OpenAI-compatible: chat / visionRead / embed / cosine
   ├─ finance.ts   # whitelist + role, verifyPin, cofre (cookie HMAC), isUnlocked
   ├─ auth.ts / auth.config.ts   # NextAuth (Google), papéis
   └─ db.ts        # PrismaClient singleton
prisma/schema.prisma              # modelos (inclui FinanceBase/File/Query)
```

---

## Acesso & papéis

- **Login**: Google SSO, restrito ao domínio `GOOGLE_HD` (ex.: `mota.adv.br`).
- **Papéis** (atribuídos em `auth.ts` na criação do usuário):
  - `TI` para o e-mail em `GOOGLE_ADMIN_EMAIL`; `USER` para os demais.
- **Financeiro** (`isFinanceAllowed`): libera para papel `ADMIN` **ou** e-mail em `FINANCE_WHITELIST`.
  Como o app não atribui `ADMIN` automaticamente, **o acesso ao Financeiro é controlado pela
  `FINANCE_WHITELIST`** — inclua ali os e-mails que devem ver o módulo.
- **Cofre (PIN)**: quem tem acesso digita `FINANCE_PIN` (6 dígitos); a sessão fica liberada **8h**
  via cookie httpOnly assinado com HMAC(`AUTH_SECRET`).

---

## Variáveis de ambiente

Copie `.env.example` para `.env` e preencha. **Nunca** comite o `.env` (já está no `.gitignore`).

| Variável | Para quê |
|---|---|
| `DATABASE_URL` | Conexão PostgreSQL |
| `AUTH_SECRET` | Segredo do Auth.js (também assina o cookie do cofre) |
| `NEXTAUTH_URL` / `AUTH_URL` | URL pública do app |
| `AUTH_TRUST_HOST` | `true` atrás de proxy (Traefik) |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | OAuth Google |
| `GOOGLE_HD` | Domínio permitido no login (ex.: `mota.adv.br`) |
| `GOOGLE_ADMIN_EMAIL` | E-mail que recebe papel `TI` |
| `AI_BASE_URL` / `AI_API_KEY` / `AI_MODEL` | Endpoint OpenAI-compatible + modelo de chat |
| `AI_VISION_MODEL` | Modelo multimodal que lê PDF/imagens (fallback: `AI_MODEL`) |
| `AI_EMBED_BASE_URL` / `AI_EMBED_API_KEY` / `AI_EMBED_MODEL` | Slot próprio de embeddings (RAG). Vazio ⇒ usa o do chat; sem `AI_EMBED_MODEL` ⇒ RAG desligado |
| `FINANCE_PIN` | PIN de 6 dígitos do cofre |
| `FINANCE_WHITELIST` | E-mails com acesso ao Financeiro (separados por vírgula) |

> Sem `AI_*` preenchido o módulo abre normalmente e mostra **"IA não configurada"** — não quebra.

### Config do Google OAuth (importante)

No Google Cloud (APIs & Services → Credentials), o **Authorized redirect URI** do client precisa ser o
callback do Auth.js:

```
https://intranet.motaadv.net/api/auth/callback/google
```

---

## Desenvolvimento local

```bash
npm install
cp .env.example .env      # preencha as variáveis
npx prisma generate
npx prisma db push        # cria as tabelas no seu Postgres
npm run dev               # http://localhost:3000
```

Scripts: `dev`, `build` (`prisma generate && next build`), `start`, `db:push`, `db:seed`.

---

## Deploy (produção)

Pipeline: **push na `main` → GitHub Actions → imagem no GHCR → Hostinger Docker (Traefik)**.

1. **CI** (`.github/workflows/build.yml`): a cada push na `main`, builda e publica
   `ghcr.io/carlosslack/mota-intranet-v2:latest` (imagem **standalone** do Next).
2. **Hostinger (Docker Compose)** — projeto com 3 serviços:
   - `db` — PostgreSQL 16 (volume persistente).
   - `db-init` — roda **antes** do app: clona a `main`, executa `prisma db push` (aplica o schema,
     inclusive as tabelas do Financeiro) e `prisma/seed.ts`. Idempotente e **aditivo**.
   - `app` — a imagem `:latest`, roteada pelo Traefik em `intranet.motaadv.net` com TLS Let's Encrypt.
3. Para atualizar: `docker compose pull && docker compose up -d` (o `db-init` reaplica o schema e o
   `app` sobe com a imagem nova). As variáveis de ambiente ficam no `.env`/painel do projeto.

O schema do banco evolui pelo `db-init` (`prisma db push`); mudanças **aditivas** (novas tabelas/colunas)
são seguras. Para operações destrutivas, prefira migrations versionadas.

---

## Notas de segurança

- Rotacione `AUTH_SECRET`, senha do Postgres, `FINANCE_PIN` e chaves de IA fora do repositório.
- Mantenha o Postgres **sem porta publicada** (acesso só pela rede interna do compose).
- `FINANCE_WHITELIST` define quem enxerga dados financeiros — revise periodicamente.
- Considere manter o **Next.js** atualizado (correções de segurança).
