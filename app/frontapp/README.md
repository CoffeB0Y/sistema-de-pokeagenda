# Pokédex — frontend

Next.js App Router, React e TypeScript. API NestJS em projeto separado.

## Executar

Use Node.js 24.9 ou superior, conforme o backend. Instale as dependências com `npm install` neste diretório. Configure opcionalmente `.env.local`:

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

```sh
npm run dev
```

Interface em http://localhost:3001. Para produção local: `npm run build` e `npm start`; ambos os modos de execução usam a porta 3001. A API precisa estar disponível na porta 3000. Não há dados fictícios permanentes para substituir a PokéAPI.

## Verificar

```sh
npm run lint
npx tsc --noEmit
npm run build
```

Os scripts `scripts/verify-visual.cjs` e `scripts/verify-navigation.cjs` usam Chrome headless/Playwright, perfil independente e contas de teste. Exigem `--isolated-db`. Essa flag não detecta o banco do servidor: inicie a API com DATABASE_URL apontando para banco descartável antes de executar. Não usar o dev.db original. Configure `PLAYWRIGHT_MODULE` caso Playwright não esteja no runtime padrão, além de `VISUAL_BASE_URL`, `VISUAL_API_URL` e `VISUAL_OUTPUT_DIR` quando necessário.

## Comportamento

Catálogo e ranking têm acesso público. Usuários autenticados visualizam o menu do treinador nessas páginas e nos detalhes. As operações privadas são autorizadas pela API, com cookie HttpOnly. O catálogo cobre as 151 espécies de Kanto; detalhes e evoluções vêm da PokéAPI real. Senhas aceitam até 72 bytes UTF-8, com validação explícita no navegador e servidor.

Resultados e limitações: [auditoria atualizada](../../docs/AUDITORIA_CRUD_2026-11-05.md).
