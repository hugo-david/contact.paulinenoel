export type BrandingFormula = 'refonte' | 'mixte' | 'creation'
export type DesiredTimeline = 'flexible' | 'normal' | 'express'

interface BrandingFormulaDefinition {
  description: string
  detail: string
  duration: string
  label: string
  priceCents: number
  popular?: boolean
}

export const brandingFormulas = {
  refonte: {
    label: 'Formule refonte',
    duration: '4 jours',
    description:
      'On part de votre logo existant pour le moderniser. Brief créatif, persona, moodboards, plusieurs pistes de refonte argumentées et charte graphique complète.',
    detail: 'Refonte de logo · 4 jours',
    priceCents: 180_000,
  },
  mixte: {
    label: 'Formule mixte',
    duration: '4,5 jours',
    description:
      'Un logo retravaillé, entre refonte et création. Brief créatif, persona, moodboards, plusieurs pistes (refonte + création) et charte graphique complète.',
    detail: 'Refonte + création · 4,5 jours',
    priceCents: 202_500,
  },
  creation: {
    label: 'Formule création',
    duration: '5 jours',
    description:
      "Création d'un logo entièrement neuf. Brief créatif, persona, moodboards, plusieurs pistes de logo distinctes et charte graphique complète.",
    detail: 'Création de logo · 5 jours',
    priceCents: 225_000,
    popular: true,
  },
} as const satisfies Record<BrandingFormula, BrandingFormulaDefinition>

export interface BrandingEstimateInput {
  budgetCents: number | null
  formula: BrandingFormula | null
  timeline: DesiredTimeline
}

export interface EstimateLine {
  amountCents: number
  detail: string
  label: string
}

export interface BrandingEstimate {
  expressSurchargeCents: number
  highCents: number
  lines: EstimateLine[]
  lowCents: number
}

const EXPRESS_SURCHARGE_RATE = 0.25

export function calculateBrandingEstimate({
  formula,
  timeline,
}: BrandingEstimateInput): BrandingEstimate {
  if (!formula) {
    return {
      expressSurchargeCents: 0,
      highCents: 0,
      lines: [],
      lowCents: 0,
    }
  }

  const selectedFormula = brandingFormulas[formula]
  const expressSurchargeCents =
    timeline === 'express'
      ? Math.round(selectedFormula.priceCents * EXPRESS_SURCHARGE_RATE)
      : 0
  const totalCents = selectedFormula.priceCents + expressSurchargeCents

  return {
    expressSurchargeCents,
    highCents: totalCents,
    lines: [
      {
        amountCents: selectedFormula.priceCents,
        detail: selectedFormula.detail,
        label: selectedFormula.label,
      },
    ],
    lowCents: totalCents,
  }
}

export function formatEuros(cents: number) {
  return `${Math.round(cents / 100)
    .toLocaleString('fr-FR')
    .replaceAll(/\u202f|\u00a0/g, ' ')} €`
}
