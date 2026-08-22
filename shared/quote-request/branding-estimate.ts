export type BrandingFormula = 'refonte' | 'mixte' | 'creation'
export type DesiredTimeline = 'flexible' | 'normal' | 'express'
export type WebProjectType =
  | 'showcase'
  | 'ecommerce'
  | 'landing'
  | 'showcaseRedesign'
  | 'landingRedesign'
export type WebFeature =
  | 'blog'
  | 'event'
  | 'payment'
  | 'booking'
  | 'multilingual'
  | 'memberArea'

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
    description: 'On part de votre logo existant pour le moderniser.',
    detail: 'Refonte de logo · 4 jours',
    priceCents: 180_000,
  },
  mixte: {
    label: 'Formule mixte',
    duration: '4,5 jours',
    description:
      'Vous recevez des propositions de refonte ainsi que des pistes de logos nouveaux.',
    detail: 'Refonte + création · 4,5 jours',
    priceCents: 202_500,
  },
  creation: {
    label: 'Formule création',
    duration: '5 jours',
    description: 'Création de plusieurs pistes de logos nouvelles.',
    detail: 'Création de logo · 5 jours',
    priceCents: 225_000,
    popular: true,
  },
} as const satisfies Record<BrandingFormula, BrandingFormulaDefinition>

export interface BrandingEstimateInput {
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

export interface QuoteRequestSelections {
  branding?: {
    formula: BrandingFormula
  }
  web?: WebSelections
}

export interface WebSelections {
  features: WebFeature[]
  pages: number
  type: WebProjectType
}

interface WebProjectDefinition {
  description: string
  designDays: number
  developmentDays: number
  includedPages: number
  label: string
  pagesRelevant: boolean
  priceCents: number
}

export const webProjects = {
  showcase: {
    label: 'Site vitrine',
    description:
      '4 pages stratégiques · personas · design (UI) · responsive · intégration',
    designDays: 6,
    developmentDays: 5,
    includedPages: 4,
    pagesRelevant: true,
    priceCents: 495_000,
  },
  ecommerce: {
    label: 'Site e-commerce',
    description:
      '4 pages stratégiques · personas · design (UI) · responsive · intégration',
    designDays: 6,
    developmentDays: 9,
    includedPages: 4,
    pagesRelevant: true,
    priceCents: 675_000,
  },
  landing: {
    label: 'Landing page',
    description: 'Personas · design (UI) · responsive · intégration',
    designDays: 2,
    developmentDays: 2,
    includedPages: 1,
    pagesRelevant: false,
    priceCents: 180_000,
  },
  showcaseRedesign: {
    label: 'Refonte site vitrine',
    description:
      'Audit basique · personas · 3 pages stratégiques · design (UI) · responsive · intégration',
    designDays: 3.5,
    developmentDays: 4,
    includedPages: 3,
    pagesRelevant: true,
    priceCents: 337_500,
  },
  landingRedesign: {
    label: 'Refonte landing page',
    description:
      'Audit basique · personas · design (UI) · responsive · intégration',
    designDays: 2,
    developmentDays: 2,
    includedPages: 1,
    pagesRelevant: false,
    priceCents: 180_000,
  },
} as const satisfies Record<WebProjectType, WebProjectDefinition>

export const webFeatures = {
  blog: 'Blog / actualités',
  event: 'Événement',
  payment: 'Paiement en ligne',
  booking: 'Réservation / RDV',
  multilingual: 'Multilingue',
  memberArea: 'Espace membre',
} as const satisfies Record<WebFeature, string>

const EXTRA_WEB_PAGE_CENTS = 45_000

const EXPRESS_SURCHARGE_RATE = 0.2

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

export function calculateQuoteEstimate({
  brandingFormula,
  timeline,
  web,
}: {
  brandingFormula: BrandingFormula | null
  timeline: DesiredTimeline
  web: WebSelections | null
}): BrandingEstimate {
  const brandingEstimate = calculateBrandingEstimate({
    formula: brandingFormula,
    timeline: 'normal',
  })
  const lines = [...brandingEstimate.lines]

  if (web) {
    const project = webProjects[web.type]
    lines.push(
      {
        amountCents: project.designDays * 45_000,
        detail: `${project.designDays.toLocaleString('fr-FR')} j × 450 € — conception UX/UI`,
        label: `${project.label} · design`,
      },
      {
        amountCents: project.developmentDays * 45_000,
        detail: `${project.developmentDays.toLocaleString('fr-FR')} j × 450 € — intégration et mise en ligne`,
        label: `${project.label} · développement`,
      },
    )

    if (project.pagesRelevant && web.pages > project.includedPages) {
      const extraPages = web.pages - project.includedPages
      lines.push({
        amountCents: extraPages * EXTRA_WEB_PAGE_CENTS,
        detail: `${extraPages} page${extraPages > 1 ? 's' : ''} · design et intégration`,
        label: 'Pages supplémentaires',
      })
    }

    for (const feature of web.features) {
      lines.push({
        amountCents: 0,
        detail: 'Chiffré sur-mesure avec le développeur',
        label: webFeatures[feature],
      })
    }
  }

  const subtotal = lines.reduce((total, line) => total + line.amountCents, 0)
  const expressSurchargeCents =
    timeline === 'express' ? Math.round(subtotal * EXPRESS_SURCHARGE_RATE) : 0
  const totalCents = subtotal + expressSurchargeCents

  return {
    expressSurchargeCents,
    highCents: totalCents,
    lines,
    lowCents: totalCents,
  }
}

export function getEstimateSnapshotLines(
  estimate: BrandingEstimate,
): EstimateLine[] {
  if (estimate.expressSurchargeCents === 0) return estimate.lines

  return [
    ...estimate.lines,
    {
      amountCents: estimate.expressSurchargeCents,
      detail: '20 % du montant des prestations',
      label: 'Majoration express (+20 %)',
    },
  ]
}

export function formatEuros(cents: number) {
  return `${Math.round(cents / 100)
    .toLocaleString('fr-FR')
    .replaceAll(/\u202f|\u00a0/g, ' ')} €`
}
