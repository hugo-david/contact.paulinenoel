import testUtils from '@adonisjs/core/services/test_utils'
import { test } from '@japa/runner'
import QuoteRequest from '#models/quote_request'

test.group('Quote request archive', (group) => {
  group.each.setup(() => testUtils.db().wrapInGlobalTransaction())

  test('persists an immutable estimate snapshot', async ({ assert }) => {
    const selections = {
      branding: {
        formula: 'creation',
      },
    }
    const estimateLines = [
      {
        label: 'Formule création',
        amountCents: 225000,
      },
    ]

    const quoteRequest = await QuoteRequest.create({
      fullName: 'Camille Martin',
      email: 'camille@example.com',
      phone: null,
      companyName: null,
      websiteUrl: null,
      projectDescription: 'Créer une identité de marque.',
      desiredTimeline: 'normal',
      budgetCents: null,
      selections,
      estimateLines,
      estimateLowCents: 225000,
      estimateHighCents: 225000,
      currency: 'EUR',
    })

    const persistedQuoteRequest = await QuoteRequest.findOrFail(quoteRequest.id)

    assert.equal(persistedQuoteRequest.notificationStatus, 'pending')
    assert.deepEqual(persistedQuoteRequest.selections, selections)
    assert.deepEqual(persistedQuoteRequest.estimateLines, estimateLines)
    assert.equal(persistedQuoteRequest.estimateLowCents, 225000)
    assert.equal(persistedQuoteRequest.estimateHighCents, 225000)
    assert.isNotNull(persistedQuoteRequest.lastContactAt)
    assert.isNotNull(persistedQuoteRequest.purgeAfter)
  })
})
