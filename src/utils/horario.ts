import { useEffect, useState } from 'react'
import { useConfig } from '../services/db'
import type { ConfigLoja } from '../types'

export const NOMES_DIAS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

export interface StatusLoja {
  aberta: boolean
  texto: string
  detalhe: string
}

function minutos(hhmm: string) {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

/** Diz se a loja está aberta agora. Horário que fecha "antes" de abrir (ex.: 18:00–02:00) atravessa a meia-noite. */
export function calcularStatus(config: ConfigLoja, data = new Date()): StatusLoja {
  if (config.modo === 'aberto') {
    return { aberta: true, texto: 'Aberto agora', detalhe: 'Aceitando pedidos' }
  }
  if (config.modo === 'fechado') {
    return { aberta: false, texto: 'Fechado agora', detalhe: 'Pedidos pausados pelo restaurante' }
  }

  const dia = data.getDay()
  const agora = data.getHours() * 60 + data.getMinutes()

  const hoje = config.horarios[dia]
  if (hoje.aberto) {
    const abre = minutos(hoje.abre)
    let fecha = minutos(hoje.fecha)
    if (fecha <= abre) fecha += 24 * 60
    if (agora >= abre && agora < fecha) {
      return { aberta: true, texto: 'Aberto agora', detalhe: `Fecha às ${hoje.fecha}` }
    }
  }

  const ontem = config.horarios[(dia + 6) % 7]
  if (ontem.aberto && minutos(ontem.fecha) <= minutos(ontem.abre) && agora < minutos(ontem.fecha)) {
    return { aberta: true, texto: 'Aberto agora', detalhe: `Fecha às ${ontem.fecha}` }
  }

  for (let i = 0; i < 7; i++) {
    const indice = (dia + i) % 7
    const horario = config.horarios[indice]
    if (!horario.aberto || (i === 0 && minutos(horario.abre) <= agora)) continue
    const quando = i === 0 ? 'hoje' : i === 1 ? 'amanhã' : NOMES_DIAS[indice].toLowerCase()
    return { aberta: false, texto: 'Fechado agora', detalhe: `Abre ${quando} às ${horario.abre}` }
  }

  return { aberta: false, texto: 'Fechado agora', detalhe: 'Sem horário de funcionamento' }
}

/** Status da loja, recalculado a cada 30 s e sempre que a configuração muda. */
export function useStatusLoja() {
  const config = useConfig()
  const [agora, setAgora] = useState(() => new Date())

  useEffect(() => {
    const intervalo = setInterval(() => setAgora(new Date()), 30_000)
    return () => clearInterval(intervalo)
  }, [])

  return calcularStatus(config, agora)
}
