# Workflow — Gestao de Conteudo e Deploy

Guia tecnico para alterar conteudo, testar localmente e fazer deploy.

---

## 1. Editar conteudo (Sanity Studio local)

O Sanity Studio e o painel onde se editam obras, textos e definicoes do site.

### Iniciar o Studio

```bash
pnpm dev:studio
```

Abre em **http://localhost:3333**. Faz login com a conta Google associada ao projecto Sanity.

### Editar e publicar

1. No Studio, navega ate a seccao pretendida (Obras, Sobre, Definicoes do Site)
2. Faz as alteracoes (nomes, textos, imagens, etc.)
3. Clica **Publish**

> **Nota**: Publicar no Studio atualiza os dados na cloud do Sanity, mas o site **nao atualiza automaticamente**. Os dados sao buscados apenas no momento do build.

---

## 2. Testar localmente

Depois de publicar alteracoes no Studio, corre o dev server para ver o resultado:

```bash
pnpm dev:web
```

Abre em **http://localhost:4321**. O dev server busca os dados mais recentes do Sanity.

Para validar o build estatico completo:

```bash
pnpm build:web
```

Verifica no output que as 7 paginas sao geradas sem erros. Os ficheiros ficam em `web/dist/`.

### Resumo do fluxo atual

```
Editar no Studio → Publish → pnpm dev:web → Verificar em localhost:4321
```

---

## 3. Deploy para Cloudflare Pages (futuro)

O site nao esta publicamente acessivel de momento. Quando for altura de publicar:

### Deploy manual

```bash
pnpm build:web
wrangler pages deploy web/dist --project-name dalia-cordeiro
```

- `pnpm build:web` — gera o HTML estatico com os dados mais recentes do Sanity (~15s)
- `wrangler pages deploy` — envia os ficheiros para o Cloudflare Pages (~10s)

Se o projecto nao existir no Cloudflare, o `wrangler` cria-o automaticamente e atribui o subdominio `dalia-cordeiro.pages.dev` (publico).

### Deploy automatico (CI/CD)

Um workflow em `.github/workflows/deploy.yml` faz deploy automaticamente no push para `main`. Requer configurar os secrets no GitHub:

| Secret | Descricao |
|--------|-----------|
| `CLOUDFLARE_API_TOKEN` | Token da API Cloudflare com permissao de Pages |
| `CLOUDFLARE_ACCOUNT_ID` | ID da conta Cloudflare |

---

## 4. Gerir o projecto no Cloudflare Pages (futuro)

### Eliminar o projecto

Via dashboard: **Workers & Pages** > **dalia-cordeiro** > **Settings** > **General** > **Delete project**

Ou via CLI:

```bash
wrangler pages project delete dalia-cordeiro
```

> **Nada se perde**: o codigo fonte e os dados do Sanity ficam intactos. Para voltar a publicar, basta correr os dois comandos de build + deploy.

### Desativar acesso publico (sem eliminar)

A opcao "Disable access to *.pages.dev" so aparece quando existe um dominio custom associado. Sem dominio custom, as alternativas sao:

- **Eliminar e recriar** quando necessario (ver acima)
- **Deploy de pasta vazia** para tirar o conteudo do ar mantendo o projecto:

```bash
mkdir -p /tmp/empty-deploy
wrangler pages deploy /tmp/empty-deploy --project-name dalia-cordeiro
```

### Associar dominio custom

Quando o dominio `daliacordeiro.art` for registado:

1. No dashboard do Cloudflare: **Pages** > **dalia-cordeiro** > **Custom domains**
2. Adiciona `daliacordeiro.art` e `www.daliacordeiro.art`
3. Configura os DNS conforme as instrucoes do Cloudflare
4. Com dominio custom, passa a ser possivel desativar o acesso via `*.pages.dev`

---

## 5. Automatizar rebuilds (futuro)

Para que o site atualize automaticamente quando se publica no Studio (sem correr comandos), configura-se um webhook:

1. No Cloudflare Pages, cria um **Deploy Hook** (Settings > Builds & Deployments > Deploy hooks)
2. No Sanity, adiciona o URL do hook em **API** > **Webhooks**, com trigger em "Create", "Update" e "Delete"

Com isto, publicar no Studio dispara automaticamente um rebuild e deploy.
