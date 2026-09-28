# Sabor & Cia — cardápio e pedidos online

Site de pedidos para restaurante de porções, batata, frango e almoço, com painel administrativo.

**Site:** https://ruancarlosdejesus.github.io/restaurante-app/

## Funcionalidades

**Loja (cliente)**
- Cardápio com busca, categorias, tamanhos (ex.: ½ metro / 1 metro) e adicionais
- Carrinho, pedido mínimo, taxa de entrega e frete grátis configuráveis
- Finalização com entrega ou retirada, pagamento na entrega (Pix, cartão, dinheiro com troco)
- Acompanhamento do status do pedido em tempo real
- Status aberto/fechado automático pelos horários

**Painel admin (`/admin`)**
- Login com bloqueio após tentativas erradas e opção "manter conectado"
- Visão geral do dia: pedidos, faturamento, ticket médio, esgotados
- Pedidos em colunas (novo → em preparo → saiu/pronto), com alerta sonoro de pedido novo
- Cadastro de produtos com envio de foto, tamanhos, adicionais, selos, esgotado e visibilidade
- Horários de funcionamento, abrir/fechar manual, entrega e dados do restaurante

## Rodando localmente

```bash
npm install
npm run dev
```

## Tecnologias

React 19, TypeScript, Vite, Tailwind CSS 4, React Router, Motion, Radix Dialog, Vaul, Sonner,
Lucide e canvas-confetti.

O deploy no GitHub Pages é feito automaticamente a cada push na `main`
(`.github/workflows/deploy.yml`).
