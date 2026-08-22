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
export type PrintSupport =
  | 'flyer'
  | 'poster'
  | 'brochure'
  | 'businessCard'
  | 'rollup'
  | 'banner'
  | 'fullWrap'
  | 'signage'
  | 'letterhead'
  | 'goodies'
export type DigitalSupport =
  | 'emailSignature'
  | 'socialMediaBanners'
  | 'socialMediaPostsTemplate'
  | 'newsletter'
  | 'presentation'

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
  digital?: DigitalSelections
  web?: WebSelections
  print?: PrintSelections
}

export interface WebSelections {
  features: WebFeature[]
  pages: number
  type: WebProjectType
}

export type PrintSelections = Record<PrintSupport, number>
export type DigitalSelections = Record<DigitalSupport, boolean>

interface PrintSupportDefinition {
  duration: string
  label: string
  priceCents: number
}

export const printSupports = {
  flyer: { label: 'Flyer', duration: '1 jour', priceCents: 45_000 },
  poster: { label: 'Affiche', duration: '2 jours', priceCents: 90_000 },
  brochure: {
    label: 'Plaquette • dépliant • chemise (4 pages)',
    duration: '2,5 jours',
    priceCents: 112_500,
  },
  businessCard: {
    label: 'Carte de visite',
    duration: '2h',
    priceCents: 12_800,
  },
  rollup: { label: 'Kakemono', duration: '1 jour', priceCents: 45_000 },
  banner: { label: 'Bâche', duration: '1 jour', priceCents: 45_000 },
  fullWrap: {
    label: 'Covering total',
    duration: '1 jour',
    priceCents: 45_000,
  },
  signage: {
    label: 'Enseigne / panneaux',
    duration: '0,5 jour',
    priceCents: 22_500,
  },
  letterhead: {
    label: 'Lettre en-tête',
    duration: '2h',
    priceCents: 12_800,
  },
  goodies: { label: 'Goodies', duration: '2h', priceCents: 12_800 },
} as const satisfies Record<PrintSupport, PrintSupportDefinition>

export function createPrintSelections(): PrintSelections {
  return Object.fromEntries(
    Object.keys(printSupports).map((support) => [support, 0]),
  ) as PrintSelections
}

interface DigitalSupportDefinition {
  duration: string
  label: string
  priceCents: number
}

export const digitalSupports = {
  emailSignature: {
    label: 'Signature email',
    duration: '1h',
    priceCents: 6_400,
  },
  socialMediaBanners: {
    label: 'Bandeaux réseaux sociaux',
    duration: '2h',
    priceCents: 12_800,
  },
  socialMediaPostsTemplate: {
    label: 'Template 4 posts réseaux sociaux',
    duration: '4h',
    priceCents: 25_600,
  },
  newsletter: {
    label: 'Newsletter',
    duration: '0,5 jour',
    priceCents: 22_500,
  },
  presentation: {
    label: 'Présentation pptx (5 slides)',
    duration: '1 jour',
    priceCents: 45_000,
  },
} as const satisfies Record<DigitalSupport, DigitalSupportDefinition>

export function createDigitalSelections(): DigitalSelections {
  return Object.fromEntries(
    Object.keys(digitalSupports).map((support) => [support, false]),
  ) as DigitalSelections
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
  digital,
  print,
  timeline,
  web,
}: {
  brandingFormula: BrandingFormula | null
  digital: DigitalSelections | null
  print: PrintSelections | null
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

  if (print) {
    for (const [support, quantity] of Object.entries(print) as Array<
      [PrintSupport, number]
    >) {
      if (quantity === 0) continue

      const definition = printSupports[support]
      lines.push({
        amountCents: definition.priceCents * quantity,
        detail: `${quantity} × ${formatEuros(definition.priceCents)}`,
        label: definition.label,
      })
    }
  }

  if (digital) {
    for (const [support, selected] of Object.entries(digital) as Array<
      [DigitalSupport, boolean]
    >) {
      if (!selected) continue

      const definition = digitalSupports[support]
      lines.push({
        amountCents: definition.priceCents,
        detail: definition.duration,
        label: definition.label,
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
