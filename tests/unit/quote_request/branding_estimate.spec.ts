import { test } from '@japa/runner'

type BrandingFormula = 'refonte' | 'mixte' | 'creation'
type DesiredTimeline = 'flexible' | 'normal' | 'express'

interface EstimatorModule {
  brandingFormulas: Record<
    BrandingFormula,
    { label: string; priceCents: number }
  >
  calculateBrandingEstimate(input: {
    budgetCents: number | null
    formula: BrandingFormula | null
    timeline: DesiredTimeline
  }): {
    expressSurchargeCents: number
    highCents: number
    lines: Array<{ label: string }>
    lowCents: number
  }
}

const estimatorModulePath =
  '../../../inertia/features/quote-request/branding-estimate.js'

async function loadEstimator(): Promise<EstimatorModule> {
  return import(estimatorModulePath)
}

test.group('Branding indicative estimate', () => {
  const expectedFormulas = {
    refonte: { label: 'Formule refonte', priceCents: 180_000 },
    mixte: { label: 'Formule mixte', priceCents: 202_500 },
    creation: { label: 'Formule création', priceCents: 225_000 },
  } as const

  for (const formula of Object.keys(expectedFormulas) as BrandingFormula[]) {
    test(`estimates the ${formula} formula`, async ({ assert }) => {
      const { brandingFormulas, calculateBrandingEstimate } =
        await loadEstimator()
      const definition = expectedFormulas[formula]
      const estimate = calculateBrandingEstimate({
        budgetCents: null,
        formula,
        timeline: 'normal',
      })

      assert.equal(estimate.lowCents, definition.priceCents)
      assert.equal(estimate.highCents, definition.priceCents)
      assert.equal(estimate.lines[0]?.label, definition.label)
      assert.equal(brandingFormulas[formula].priceCents, definition.priceCents)
      assert.equal(estimate.expressSurchargeCents, 0)
    })
  }

  test('applies the 25 percent express surcharge once', async ({ assert }) => {
    const { calculateBrandingEstimate } = await loadEstimator()
    const estimate = calculateBrandingEstimate({
      budgetCents: null,
      formula: 'creation',
      timeline: 'express',
    })

    assert.equal(estimate.expressSurchargeCents, 56_250)
    assert.equal(estimate.lowCents, 281_250)
    assert.equal(estimate.highCents, 281_250)
  })

  test('does not use the indicative budget in the estimate', async ({
    assert,
  }) => {
    const { calculateBrandingEstimate } = await loadEstimator()
    const withoutBudget = calculateBrandingEstimate({
      budgetCents: null,
      formula: 'mixte',
      timeline: 'flexible',
    })
    const withBudget = calculateBrandingEstimate({
      budgetCents: 100_000,
      formula: 'mixte',
      timeline: 'flexible',
    })

    assert.deepEqual(withBudget, withoutBudget)
  })
})
