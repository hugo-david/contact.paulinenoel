import { column } from '@adonisjs/lucid/orm'
import { QuoteRequestSchema } from '#database/schema'
import type {
  DesiredTimeline,
  EstimateLine,
  QuoteRequestSelections,
} from '../../shared/quote-request/branding-estimate.js'

function prepareJson(value: unknown) {
  return JSON.stringify(value)
}

export default class QuoteRequest extends QuoteRequestSchema {
  @column({ prepare: prepareJson })
  declare selections: QuoteRequestSelections

  @column({ prepare: prepareJson })
  declare estimateLines: EstimateLine[]

  declare desiredTimeline: DesiredTimeline
}
