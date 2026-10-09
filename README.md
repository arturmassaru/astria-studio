# Astria Studio

Loja online + painel administrativo. *Um universo de possibilidades.*

Next.js 15 (App Router) · TypeScript · React 19 · Tailwind v4 · pronto para Supabase e Vercel.

## Como rodar

```bash
npm install
npm run lint
npm run typecheck
npm run build
npm run dev          # http://localhost:3000  ·  painel em /admin
```

Copie `.env.example` para `.env.local` e preencha:

| Variável | Uso |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | URL pública (sitemap, metadados) |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Número que recebe as solicitações (ex.: `5511999999999`) |
| `NEXT_PUBLIC_INSTAGRAM_URL` | Link do Instagram |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase (futuro) |
| `SUPABASE_SERVICE_ROLE_KEY` | Somente servidor. Nunca no navegador. |

Sem o número de WhatsApp configurado, o botão de envio avisa em vez de abrir um link quebrado.

## Estrutura

```
src/app/(loja)/      loja pública: home, produtos, kits, carrinho, solicitação, personalizados, FAQ, políticas
src/app/admin/       painel: dashboard, solicitações, pedidos, clientes, produtos, kits, produção,
                     estoque, materiais, máquinas, financeiro, relatórios, categorias, tags, usuários, configurações
src/components/      ui, layout, home, shop, admin
src/lib/domain/      regras de negócio (ações, pedidos, financeiro)
src/lib/pricing.ts   custo, margem, markup, preço sugerido
src/lib/store/       armazenamento do modo demonstração
src/services/        acesso ao catálogo (assíncrono, para trocar por Supabase)
src/data/            seeds (produtos, kits, FAQ, políticas)
supabase/migrations/ modelo de dados e RLS (rascunho)
```

## Regras de negócio implementadas

- **Solicitação ≠ pedido.** Enviar uma solicitação não baixa estoque, não fatura e não libera produção. Fluxo: carrinho → solicitação → WhatsApp → confirmação → pedido oficial.
- **Status independentes:** comercial, pagamento, produção (e entrega separada).
- **Snapshots:** o pedido guarda nome, preço, custo e dados do cliente do momento da venda.
- **Produção** só é liberada com pedido confirmado, pagamento integral e prazo, ou por exceção autorizada (responsável, data, motivo).
- **Custo e margem:** a tarifa de energia vem de Configurações (nunca fixa no código); a margem segue produto > categoria > global; não há custo de mão de obra; margem ≠ markup.
- **Resultado × fluxo de caixa** são visões separadas. A ferramenta é gerencial, não contábil nem fiscal.
- **Sem dados inventados:** painéis mostram estados vazios. Produtos demonstrativos são marcados e nunca apresentados como vendas.

## Modo demonstração (importante)

Hoje os dados do painel ficam no `localStorage` do navegador. Consequências:

- Alterações no painel **não** aparecem para outros visitantes nem alteram o catálogo público de outro navegador.
- **Não há login real.** O seletor de perfil (admin / operacional / financeiro / leitura) só simula permissões na interface. Proteção real deve vir de autenticação Supabase + RLS.
- Antes de publicar de verdade, conecte o Supabase e proteja `/admin`.

## Conectando o Supabase

1. Crie o projeto e aplique `supabase/migrations/0001_init.sql` (revise antes; é um rascunho).
2. O público lê só a view `public_products` (sem custo, margem ou estoque). Solicitações entram pela função `create_request`, que recalcula o total no servidor.
3. Troque a implementação de `src/services/catalog.ts` e a camada `src/lib/store` por chamadas ao Supabase; crie o middleware de autenticação para `/admin`.
4. Financeiro e pagamentos ficam restritos a `admin` e `financeiro` por RLS.

## Produtos reais e conteúdo provisório

- Reais, com foto: **Mini Jesus**, **Bandeja Nuvem**, **Kit Natal: Aconchego**. Preços e descrições são **provisórios**; ajuste em `src/data/` ou no painel.
- Sagrada Família e Mini Árvore (componentes do kit) ainda não têm foto própria.
- Demonstrativos (marcados `isDemo`): Vaso Canelado, Porta Vela, Kit Natal: Ornare.
- Os textos de políticas são **modelos provisórios** e precisam de revisão antes de publicar.

## Pendências

- Lint, typecheck e build **não foram executados** neste ambiente (registro npm bloqueado). Rode os comandos acima e corrija o que aparecer.
- Integração Supabase, autenticação real e upload de imagens.
- Número de WhatsApp e link do Instagram.
