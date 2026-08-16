import { column } from '@adonisjs/lucid/orm'
import { QuoteRequestSchema } from '#database/schema'

function prepareJson(value: unknown) {
  return JSON.stringify(value)
}

export default class QuoteRequest extends QuoteRequestSchema {
  @column({ prepare: prepareJson })
  declare selections: Record<string, unknown>

  @column({ prepare: prepareJson })
  declare estimateLines: Array<Record<string, unknown>>
}
