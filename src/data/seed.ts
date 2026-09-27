import type { Categoria, ConfigLoja, Produto } from '../types'

/** Dados iniciais usados na primeira vez que o sistema abre (ou após "restaurar padrão"). */

const foto = (id: string) => `https://images.unsplash.com/photo-${id}?w=800&q=75&auto=format&fit=crop`

export const categorias: { valor: Categoria; rotulo: string }[] = [
  { valor: 'batatas', rotulo: 'Batatas' },
  { valor: 'porcoes', rotulo: 'Porções' },
  { valor: 'frangos', rotulo: 'Frangos' },
  { valor: 'almoco', rotulo: 'Almoço' },
  { valor: 'bebidas', rotulo: 'Bebidas' },
]

export const selosDisponiveis = ['Mais pedido', 'Novidade', 'Serve 2', 'Serve 4', 'Picante']

export function rotuloCategoria(categoria: Categoria) {
  return categorias.find((c) => c.valor === categoria)?.rotulo ?? categoria
}

const cheddar = { id: 'cheddar', nome: 'Cheddar cremoso', preco: 8 }
const bacon = { id: 'bacon', nome: 'Bacon crocante', preco: 8 }
const calabresa = { id: 'calabresa', nome: 'Calabresa', preco: 7 }

const criadoEm = '2026-01-01T12:00:00.000Z'

export const produtosIniciais: Produto[] = [
  {
    id: 'batata-metro',
    nome: 'Batata a Metro',
    descricao: 'Batata frita crocante servida na tábua, com 3 molhos da casa.',
    categoria: 'batatas',
    imagem: foto('1585109649139-366815a0d713'),
    tamanhos: [
      { id: 'meio', nome: '½ metro', preco: 49.9 },
      { id: 'metro', nome: '1 metro', preco: 89.9 },
    ],
    adicionais: [cheddar, bacon, calabresa],
    selos: ['Mais pedido', 'Serve 4'],
    disponivel: true,
    visivel: true,
    criadoEm,
  },
  {
    id: 'torre-batata',
    nome: 'Torre de Batata',
    descricao: 'Camadas de batata frita, cheddar cremoso e bacon, montadas na hora.',
    categoria: 'batatas',
    imagem: foto('1573080496219-bb080dd4f877'),
    tamanhos: [
      { id: 'media', nome: 'Média', preco: 45.9 },
      { id: 'grande', nome: 'Grande', preco: 64.9 },
    ],
    adicionais: [calabresa],
    selos: ['Serve 2'],
    disponivel: true,
    visivel: true,
    criadoEm,
  },
  {
    id: 'batata-simples',
    nome: 'Batata Frita',
    descricao: 'Porção de batata frita sequinha e crocante.',
    categoria: 'batatas',
    imagem: foto('1630431341973-02e1b662ec35'),
    tamanhos: [
      { id: '300g', nome: '300 g', preco: 24.9 },
      { id: '500g', nome: '500 g', preco: 34.9 },
    ],
    adicionais: [cheddar, bacon],
    selos: [],
    disponivel: true,
    visivel: true,
    criadoEm,
  },
  {
    id: 'frango-passarinho',
    nome: 'Frango a Passarinho',
    descricao: 'Pedaços de frango temperados e fritos, com alho dourado.',
    categoria: 'porcoes',
    imagem: foto('1626082927389-6cd097cdc6ec'),
    tamanhos: [
      { id: 'meia', nome: 'Meia', preco: 34.9 },
      { id: 'inteira', nome: 'Inteira', preco: 54.9 },
    ],
    adicionais: [{ id: 'alho', nome: 'Alho frito extra', preco: 4 }],
    selos: ['Mais pedido'],
    disponivel: true,
    visivel: true,
    criadoEm,
  },
  {
    id: 'isca-frango',
    nome: 'Isca de Frango Empanada',
    descricao: 'Tiras de frango empanadas, acompanha molho da casa.',
    categoria: 'porcoes',
    imagem: foto('1562967914-608f82629710'),
    tamanhos: [
      { id: 'meia', nome: 'Meia', preco: 29.9 },
      { id: 'inteira', nome: 'Inteira', preco: 46.9 },
    ],
    adicionais: [],
    selos: [],
    disponivel: true,
    visivel: true,
    criadoEm,
  },
  {
    id: 'calabresa-acebolada',
    nome: 'Calabresa Acebolada',
    descricao: 'Calabresa fatiada e acebolada na chapa, com pão.',
    categoria: 'porcoes',
    imagem: null,
    tamanhos: [
      { id: 'meia', nome: 'Meia', preco: 32.9 },
      { id: 'inteira', nome: 'Inteira', preco: 49.9 },
    ],
    adicionais: [],
    selos: [],
    disponivel: true,
    visivel: true,
    criadoEm,
  },
  {
    id: 'frango-assado',
    nome: 'Frango Assado',
    descricao: 'Frango assado na brasa, temperado desde a véspera.',
    categoria: 'frangos',
    imagem: foto('1598103442097-8b74394b95c6'),
    tamanhos: [
      { id: 'meio', nome: 'Meio frango', preco: 28.9 },
      { id: 'inteiro', nome: 'Inteiro', preco: 49.9 },
    ],
    adicionais: [
      { id: 'farofa', nome: 'Farofa', preco: 6 },
      { id: 'maionese', nome: 'Maionese caseira', preco: 7 },
    ],
    selos: ['Mais pedido'],
    disponivel: true,
    visivel: true,
    criadoEm,
  },
  {
    id: 'frango-com-batata',
    nome: 'Frango com Batata',
    descricao: 'Frango assado inteiro + porção de batata frita 500 g.',
    categoria: 'frangos',
    imagem: null,
    tamanhos: [{ id: 'unico', nome: 'Combo', preco: 74.9 }],
    adicionais: [{ id: 'farofa', nome: 'Farofa', preco: 6 }],
    selos: ['Serve 4'],
    disponivel: true,
    visivel: true,
    criadoEm,
  },
  {
    id: 'prato-feito',
    nome: 'Prato Feito',
    descricao: 'Arroz, feijão, salada, batata frita e a mistura do dia.',
    categoria: 'almoco',
    imagem: null,
    tamanhos: [
      { id: 'normal', nome: 'Normal', preco: 24.9 },
      { id: 'grande', nome: 'Marmitex G', preco: 29.9 },
    ],
    adicionais: [{ id: 'ovo', nome: 'Ovo frito', preco: 3 }],
    selos: [],
    disponivel: true,
    visivel: true,
    criadoEm,
  },
  {
    id: 'parmegiana',
    nome: 'Parmegiana de Frango',
    descricao: 'Filé de frango à parmegiana, arroz e batata frita.',
    categoria: 'almoco',
    imagem: null,
    tamanhos: [{ id: 'unico', nome: 'Individual', preco: 32.9 }],
    adicionais: [],
    selos: [],
    disponivel: true,
    visivel: true,
    criadoEm,
  },
  {
    id: 'refrigerante',
    nome: 'Refrigerante',
    descricao: 'Coca-Cola, Guaraná ou Fanta.',
    categoria: 'bebidas',
    imagem: foto('1581636625402-29b2a704ef13'),
    tamanhos: [
      { id: 'lata', nome: 'Lata 350 ml', preco: 6.5 },
      { id: '2l', nome: 'Garrafa 2 L', preco: 14.9 },
    ],
    adicionais: [],
    selos: [],
    disponivel: true,
    visivel: true,
    criadoEm,
  },
  {
    id: 'suco',
    nome: 'Suco Natural',
    descricao: 'Laranja, limão ou maracujá — 500 ml.',
    categoria: 'bebidas',
    imagem: foto('1600271886742-f049cd451bba'),
    tamanhos: [{ id: 'unico', nome: '500 ml', preco: 9.9 }],
    adicionais: [],
    selos: [],
    disponivel: true,
    visivel: true,
    criadoEm,
  },
  {
    id: 'agua',
    nome: 'Água Mineral',
    descricao: 'Com ou sem gás — 500 ml.',
    categoria: 'bebidas',
    imagem: foto('1523362628745-0c100150b504'),
    tamanhos: [{ id: 'unico', nome: '500 ml', preco: 4 }],
    adicionais: [],
    selos: [],
    disponivel: true,
    visivel: true,
    criadoEm,
  },
]

const almocoEJanta = { aberto: true, abre: '11:00', fecha: '23:00' }

export const configInicial: ConfigLoja = {
  nome: 'Sabor & Cia',
  whatsapp: '',
  endereco: '',
  modo: 'automatico',
  horarios: [
    { aberto: true, abre: '11:00', fecha: '16:00' },
    { aberto: false, abre: '11:00', fecha: '23:00' },
    almocoEJanta,
    almocoEJanta,
    almocoEJanta,
    { aberto: true, abre: '11:00', fecha: '00:00' },
    { aberto: true, abre: '11:00', fecha: '00:00' },
  ],
  taxaEntrega: 7,
  freteGratisAcima: 100,
  pedidoMinimo: 20,
  tempoEntrega: '40–60 min',
  aceitaEntrega: true,
  aceitaRetirada: true,
}
