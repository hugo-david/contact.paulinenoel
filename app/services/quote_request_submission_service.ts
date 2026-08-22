import { inject } from '@adonisjs/core'
import { DateTime } from 'luxon'
import QuoteRequest from '#models/quote_request'
// Biome sees a type-only use, but Adonis resolves this constructor at runtime.
// biome-ignore lint/style/useImportType: required by dependency injection
import QuoteRequestNotificationService from '#services/quote_request_notification_service'
import type {
  DesiredTimeline,
  EstimateLine,
  QuoteRequestSelections,
} from '../../shared/quote-request/branding-estimate.js'
import {
  calculateQuoteEstimate,
  getEstimateSnapshotLines,
} from '../../shared/quote-request/branding-estimate.js'

interface SubmitQuoteRequestInput {
  companyName?: string
  desiredTimeline: DesiredTimeline
  email: string
  estimate: {
    highCents: number
    lines: EstimateLine[]
    lowCents: number
  }
  fullName: string
  phone?: string
  projectDescription: string
  selections: QuoteRequestSelections
  websiteUrl?: string
}

export class QuoteRequestNotificationFailedError extends Error {
  constructor() {
    super('The quote request was archived, but its notification failed')
    this.name = 'QuoteRequestNotificationFailedError'
  }
}

export class QuoteRequestEstimateChangedError extends Error {
  constructor() {
    super('The displayed estimate no longer matches the current catalogue')
    this.name = 'QuoteRequestEstimateChangedError'
  }
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message.slice(0, 2_000)
  return 'Unknown notification error'
}

@inject()
export default class QuoteRequestSubmissionService {
  constructor(private notificationService: QuoteRequestNotificationService) {}

  async submit(input: SubmitQuoteRequestInput) {
    const hasDigitalSelection =
      input.selections.digital !== undefined &&
      Object.values(input.selections.digital).some(Boolean)
    const hasPrintSelection =
      input.selections.print !== undefined &&
      Object.values(input.selections.print).some((quantity) => quantity > 0)

    if (
      !input.selections.branding &&
      !input.selections.web &&
      !hasDigitalSelection &&
      !hasPrintSelection
    ) {
      throw new QuoteRequestEstimateChangedError()
    }

    const estimate = calculateQuoteEstimate({
      brandingFormula: input.selections.branding?.formula ?? null,
      digital: input.selections.digital ?? null,
      print: input.selections.print ?? null,
      timeline: input.desiredTimeline,
      web: input.selections.web ?? null,
    })
    const estimateLines = getEstimateSnapshotLines(estimate)
    const presentedEstimate = input.estimate
    if (
      presentedEstimate.lowCents !== estimate.lowCents ||
      presentedEstimate.highCents !== estimate.highCents ||
      JSON.stringify(presentedEstimate.lines) !== JSON.stringify(estimateLines)
    ) {
      throw new QuoteRequestEstimateChangedError()
    }
    const lastContactAt = DateTime.utc()
    const quoteRequest = await QuoteRequest.create({
      companyName: input.companyName ?? null,
      currency: 'EUR',
      desiredTimeline: input.desiredTimeline,
      email: input.email,
      estimateHighCents: estimate.highCents,
      estimateLines,
      estimateLowCents: estimate.lowCents,
      fullName: input.fullName,
      lastContactAt,
      notificationStatus: 'pending',
      phone: input.phone ?? null,
      projectDescription: input.projectDescription,
      purgeAfter: lastContactAt.plus({ years: 3 }),
      selections: input.selections,
      websiteUrl: input.websiteUrl ?? null,
    })

    quoteRequest.notificationAttemptedAt = DateTime.utc()
    await quoteRequest.save()

    try {
      await this.notificationService.send(quoteRequest)
    } catch (error) {
      quoteRequest.notificationStatus = 'failed'
      quoteRequest.notificationError = getErrorMessage(error)
      await quoteRequest.save()
      throw new QuoteRequestNotificationFailedError()
    }

    quoteRequest.notificationStatus = 'sent'
    quoteRequest.notificationSentAt = DateTime.utc()
    quoteRequest.notificationError = null
    await quoteRequest.save()

    return quoteRequest
  }
}
