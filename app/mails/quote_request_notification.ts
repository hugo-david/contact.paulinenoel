import { fileURLToPath } from 'node:url'
import { BaseMail } from '@adonisjs/mail'
import type QuoteRequest from '#models/quote_request'
import env from '#start/env'
import type {
  DigitalSupport,
  PrintSupport,
  QuoteRequestSelections,
} from '../../shared/quote-request/branding-estimate.js'
import {
  brandingFormulas,
  digitalSupports,
  formatEuros,
  printSupports,
  webFeatures,
  webProjects,
} from '../../shared/quote-request/branding-estimate.js'

const logoCid = 'pauline-noel-logo'
const logoPath = fileURLToPath(
  new URL('../../public/images/pauline-noel-logo.png', import.meta.url),
)

interface NotificationSelectionRow {
  label: string
  value: string
}

interface NotificationSelectionSection {
  rows: NotificationSelectionRow[]
  title: string
}

function pluralizePages(pages: number) {
  return `${pages} page${pages > 1 ? 's' : ''}`
}

function pluralizeUnits(quantity: number) {
  return `${quantity} exemplaire${quantity > 1 ? 's' : ''}`
}

function getSelectionSections(
  selections: QuoteRequestSelections,
): NotificationSelectionSection[] {
  const sections: NotificationSelectionSection[] = []

  if (selections.branding) {
    const formula = brandingFormulas[selections.branding.formula]
    sections.push({
      title: 'Identité & branding',
      rows: [
        {
          label: 'Formule',
          value: `${formula.label} — ${formula.detail}`,
        },
      ],
    })
  }

  if (selections.web) {
    const project = webProjects[selections.web.type]
    const rows: NotificationSelectionRow[] = [
      { label: 'Projet', value: project.label },
    ]

    if (project.pagesRelevant) {
      rows.push({
        label: 'Pages',
        value: pluralizePages(selections.web.pages),
      })
    }

    if (selections.web.features.length > 0) {
      rows.push({
        label: 'Fonctionnalités',
        value: selections.web.features
          .map((feature) => webFeatures[feature])
          .join(', '),
      })
    }

    sections.push({ title: 'Site web', rows })
  }

  if (selections.print) {
    const rows = (
      Object.entries(selections.print) as Array<[PrintSupport, number]>
    )
      .filter(([, quantity]) => quantity > 0)
      .map(([support, quantity]) => ({
        label: printSupports[support].label,
        value: pluralizeUnits(quantity),
      }))

    if (rows.length > 0) sections.push({ title: 'Imprimé', rows })
  }

  if (selections.digital) {
    const rows = (
      Object.entries(selections.digital) as Array<[DigitalSupport, boolean]>
    )
      .filter(([, selected]) => selected)
      .map(([support]) => ({
        label: digitalSupports[support].label,
        value: digitalSupports[support].duration,
      }))

    if (rows.length > 0) sections.push({ title: 'Digital', rows })
  }

  return sections
}

export default class QuoteRequestNotification extends BaseMail {
  subject: string

  constructor(public quoteRequest: QuoteRequest) {
    super()
    this.subject = `Nouvelle demande de devis de ${quoteRequest.fullName}`
  }

  prepare() {
    const selectionSections = getSelectionSections(this.quoteRequest.selections)
    const estimateLines = this.quoteRequest.estimateLines.map((line) => ({
      ...line,
      amount: formatEuros(line.amountCents),
    }))
    const total = formatEuros(this.quoteRequest.estimateLowCents)
    const maximumTotal = formatEuros(this.quoteRequest.estimateHighCents)

    this.message
      .to(env.get('QUOTE_REQUEST_RECIPIENT', 'paulinenoel99@gmail.com'))
      .replyTo(this.quoteRequest.email)
      .embed(logoPath, logoCid, {
        contentType: 'image/png',
        filename: 'pauline-noel-logo.png',
      })
      .htmlView('emails/quote_request_notification', {
        estimateLines,
        logoCid,
        maximumTotal,
        quoteRequest: this.quoteRequest,
        selectionSections,
        total,
      })
      .textView('emails/quote_request_notification_text', {
        estimateLines,
        maximumTotal,
        quoteRequest: this.quoteRequest,
        selectionSections,
        total,
      })
  }
}
