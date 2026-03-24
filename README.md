# Tessa Admin

Base inicial do painel administrativo da Tessa, criada com React 19 + Vite 8, TypeScript estrito, Tailwind CSS v4 e ESLint com regras type-aware.

## Stack

- React 19
- Vite 8
- TypeScript 5 com checagens extras
- Tailwind CSS v4 com `@tailwindcss/vite`
- React Router para a estrutura de páginas
- ESLint 9 com `typescript-eslint`, `react-hooks` e `react-refresh`

## Scripts

```bash
npm install
npm run dev
npm run lint
npm run typecheck
npm run build
```

## Ambiente

Crie o arquivo `.env` a partir de `.env.example`:

```bash
cp .env.example .env
```

Valor padrão para desenvolvimento local:

```env
VITE_API_BASE_URL=http://localhost:3002
```

## Estrutura inicial

- `src/app`: shell, providers e rotas
- `src/features/auth`: sessão e login conectado à API
- `src/features/dashboard`: visão geral e checagem de saúde da API
- `src/features/content`: base visual para gestão de páginas
- `src/features/users`: base visual para gestão de admins
- `src/shared`: config, cliente HTTP e utilidades compartilhadas

## Próximos passos naturais

1. Conectar as telas de conteúdo aos endpoints `GET/PUT/POST /api/content/admin/pages`.
2. Implementar CRUD de admins usando `/api/users`.
3. Adicionar formulários com validação e feedback de erro por campo.
