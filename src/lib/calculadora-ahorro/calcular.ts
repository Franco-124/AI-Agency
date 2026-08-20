import {
  HORAS_LABORALES_MES,
  PORCENTAJE_REDUCCION_CONSERVADOR,
  PRECIO_IMPLEMENTACION_PAQUETE_2,
} from './config'

export type SavingsInput = {
  salarioPromedioMensual: number
  horasMensualesTareasRepetitivas: number
}

export type SavingsResult = {
  ahorroMensualEstimado: number
  ahorroAnualEstimado: number
}

/**
 * Pure, framework-free estimate — no rounding "up" to make the number look
 * better. Non-positive inputs yield a zero result rather than a negative or
 * NaN figure.
 */
export function calcularAhorroEstimado({
  salarioPromedioMensual,
  horasMensualesTareasRepetitivas,
}: SavingsInput): SavingsResult {
  if (salarioPromedioMensual <= 0 || horasMensualesTareasRepetitivas <= 0) {
    return { ahorroMensualEstimado: 0, ahorroAnualEstimado: 0 }
  }

  const tarifaHoraria = salarioPromedioMensual / HORAS_LABORALES_MES
  const horasAhorradas = horasMensualesTareasRepetitivas * PORCENTAJE_REDUCCION_CONSERVADOR
  const ahorroMensualEstimado = horasAhorradas * tarifaHoraria
  const ahorroAnualEstimado = ahorroMensualEstimado * 12

  return { ahorroMensualEstimado, ahorroAnualEstimado }
}

/**
 * Months for the estimated savings to cover Package 2's one-time
 * implementation price (maintenance excluded). `Math.ceil` on purpose: a
 * partial month is still a month the client is paying for, so it must not
 * be rounded down or averaged away. Returns `null` when there is no
 * positive savings to divide by, rather than `Infinity` or a negative
 * figure.
 */
export function calcularMesesParaPagarse(ahorroMensualEstimado: number): number | null {
  if (ahorroMensualEstimado <= 0) {
    return null
  }

  return Math.ceil(PRECIO_IMPLEMENTACION_PAQUETE_2 / ahorroMensualEstimado)
}

/** No decimals: COP amounts at this scale are never meaningfully sub-peso. */
export function formatCOP(value: number, locale: string): string {
  return new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value)
}
