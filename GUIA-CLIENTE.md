# Guia para a Artista — Gestao do Site daliacordeiro.art

Este documento explica como gerir o conteudo do site no dia a dia, os custos envolvidos, e ideias para o futuro.

---

## 1. Gestao de Conteudo (Sanity Studio)

O site usa o **Sanity Studio** como painel de administracao. E como um backoffice visual onde pode editar tudo sem tocar em codigo.

### Como aceder

Abra o Studio no browser: **https://dalia-cordeiro.sanity.studio** (ou localmente em `localhost:3333` durante o desenvolvimento).

Faca login com a conta Google associada ao projecto.

### O que pode editar

| Seccao | O que controla | Como editar |
|--------|---------------|-------------|
| **Obras** | Catalogo de pinturas | Adicionar, editar ou remover obras. Cada obra tem titulo, imagem, ano, tecnica, dimensoes, serie, estado (disponivel/vendida/reservada/nao a venda) e descricao em PT e EN |
| **Sobre** | Pagina "Sobre a artista" | Retrato, biografia curta e longa (PT/EN), estatisticas (nascida em, trabalha com, expoe desde), lista de exposicoes selecionadas |
| **Definicoes do Site** | Elementos globais | Frase principal da homepage, obra em destaque, tagline, email de contacto, link do Instagram, texto do rodape |

### Linguas PT e EN

Cada campo de texto tem duas versoes: **Portugues** e **English**. No Studio, use as tabs PT/EN no topo do formulario para alternar. Se deixar o campo ingles vazio, o site mostra automaticamente o texto portugues.

### Adicionar uma nova obra

1. Va a **Obras** → clique no botao **+**
2. Preencha o titulo, carregue a imagem principal
3. Gere o slug (clique em "Generate")
4. Preencha ano, tecnica (PT e EN), dimensoes, serie, estado
5. Escreva a descricao em PT e EN
6. Defina a ordem de exibicao (numero — quanto menor, mais cedo aparece)
7. Clique **Publish**

### Mudar a obra em destaque na homepage

1. Va a **Definicoes do Site**
2. No campo "Obra destacada (hero)", selecione a obra pretendida
3. Pode tambem alterar a frase principal ("Frase principal (hero)")
4. Clique **Publish**

### Apos publicar

Depois de publicar alteracoes no Studio, o site precisa de ser **reconstruido** para as mudancas ficarem visiveis. Este passo e feito pelo programador (demora ~30 segundos). No futuro, pode ser automatizado com um webhook que reconstroi o site automaticamente sempre que publica algo no Studio.

---

## 2. Custos

### Custos atuais (mensais)

| Servico | Custo | Notas |
|---------|-------|-------|
| **Sanity (CMS)** | Gratis | Plano Free — ate 100K pedidos API/mes, 1M de assets, 3 utilizadores. Mais que suficiente |
| **Cloudflare Pages (hosting)** | Gratis | Plano Free — sites estaticos ilimitados, largura de banda ilimitada, SSL incluido |
| **Web3Forms (formulario)** | Gratis | Plano Free — ate 250 submissoes/mes |
| **Google Fonts** | Gratis | Fonts self-hosted, sem dependencia externa |
| **Total mensal** | **0 EUR** | |

### Custo do dominio

| Item | Custo estimado | Frequencia |
|------|---------------|------------|
| Dominio `daliacordeiro.art` | ~15-20 EUR | Anual |
| Dominio `daliacordeiro.com` (alternativa) | ~10-12 EUR | Anual |

O dominio e o unico custo recorrente. Pode ser registado no [Cloudflare Registrar](https://www.cloudflare.com/products/registrar/) (precos ao custo, sem markup), [Namecheap](https://www.namecheap.com/), ou [Google Domains](https://domains.google/).

### Quando podem surgir custos

- **Sanity Pro** (~99 USD/mes): so se ultrapassar os limites free (improvavel para um portfolio)
- **Cloudflare Pro**: so se precisar de funcionalidades avancadas (desnecessario)
- **Dominio email** (studio@daliacordeiro.art): ~5 EUR/mes via Google Workspace, ou gratis via Cloudflare Email Routing

---

## 3. Manutencao

### O que precisa de manutencao regular

| Tarefa | Frequencia | Quem faz |
|--------|-----------|----------|
| Adicionar/atualizar obras | Quando necessario | A artista (via Studio) |
| Reconstruir o site apos alteracoes | Apos publicacao no Studio | Programador (ou automatico com webhook) |
| Renovar dominio | Anual | Pagamento automatico |
| Atualizar dependencias (seguranca) | ~2x por ano | Programador |

### Automatizacao recomendada (futuro)

Configurar um **webhook no Sanity** que dispara automaticamente o rebuild no Cloudflare Pages sempre que se publica conteudo. Assim, a artista publica no Studio e o site atualiza sozinho em ~1 minuto, sem envolver o programador.

---

## 4. Alteracoes e Novas Funcionalidades

### Alteracoes simples (1-2 horas)

- Mudar cores, tipografia ou tema do site
- Adicionar redes sociais (Facebook, LinkedIn, Behance)
- Ajustar textos fixos ou layout
- Adicionar Google Analytics ou Cloudflare Analytics
- Tornar o tema/accent editavel no CMS

### Funcionalidades medias (4-8 horas)

- **Webhook de auto-rebuild** — o site reconstroi automaticamente quando publica no Studio
- **Pagina individual por obra** — URL propria para cada pintura (melhor para SEO e partilha)
- **Galeria de imagens por obra** — slider com multiplas fotos (detalhe, contexto, moldura)
- **Blog/Noticias** — seccao para novidades, exposicoes, artigos
- **Email profissional** — configurar studio@daliacordeiro.art com Cloudflare Email Routing

### Funcionalidades avancadas (1-3 dias)

- **Loja online / Pagamentos** — venda direta de obras com Stripe ou Shopify Lite. A artista marca o preco no Studio, o visitante paga online. Comissao Stripe: 1.4% + 0.25 EUR por transacao
- **Agenda de eventos** — calendario com exposicoes futuras, inauguracoes, workshops. Schema no Sanity com data, local, descricao, link para bilhetes
- **Newsletter** — integracao com Mailchimp ou Buttondown para recolher emails e enviar novidades
- **Prints / Edicoes limitadas** — seccao separada para venda de reproducooes numeradas
- **Video/Processo** — seccao com videos do processo criativo (embed YouTube/Vimeo)
- **Press Kit** — pagina com bio formatada, fotos de alta resolucao e logotipo para download
- **Modo escuro** — ja suportado pelo CSS (tema "dark"), so falta um toggle para o visitante

### Ideias especificas para artistas plasticos

| Ideia | Descricao | Complexidade |
|-------|-----------|-------------|
| **Vista de exposicao virtual** | Mockup 3D de uma sala com as obras nas paredes | Alta |
| **Comparacao de escala** | Mostrar a obra ao lado de uma figura humana para dar nocao de tamanho | Media |
| **Certificado de autenticidade** | Gerar PDF automaticamente por obra com QR code | Media |
| **Portfolio PDF** | Botao para descarregar catalogo completo em PDF gerado automaticamente | Media |
| **Mapa de exposicoes** | Mapa interativo com os locais onde ja expos | Baixa-Media |
| **Comissoes/Encomendas** | Formulario especifico para pedir obras por encomenda com brief | Baixa |

---

## 5. Resumo

O site esta construido para ser **simples de gerir, rapido e sem custos mensais**. A artista edita tudo no Sanity Studio sem precisar de programador para o conteudo do dia a dia. A arquitetura e moderna e permite escalar com novas funcionalidades quando necessario.

Para qualquer alteracao ou nova funcionalidade, contacte o programador com a descricao do que pretende.
