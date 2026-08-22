import { test } from '@japa/runner'
import {
  calculateQuoteEstimate,
  createDigitalSelections,
  digitalSupports,
} from '../../shared/quote-request/branding-estimate.js'

test.group('digital quote estimate', () => {
  test('uses the Figma digital catalogue', ({ assert }) => {
    assert.deepEqual(digitalSupports, {
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
    })
  })

  test('adds selected supports and applies the express surcharge', ({ assert }) => {
    const digital = {
      ...createDigitalSelections(),
      emailSignature: true,
      socialMediaBanners: true,
    }

    const normalEstimate = calculateQuoteEstimate({
      brandingFormula: null,
      digital,
      print: null,
      timeline: 'normal',
      web: null,
    })
    const expressEstimate = calculateQuoteEstimate({
      brandingFormula: null,
      digital,
      print: null,
      timeline: 'express',
      web: null,
    })

    assert.deepEqual(normalEstimate.lines, [
      { label: 'Signature email', detail: '1h', amountCents: 6_400 },
      {
        label: 'Bandeaux réseaux sociaux',
        detail: '2h',
        amountCents: 12_800,
      },
    ])
    assert.equal(normalEstimate.lowCents, 19_200)
    assert.equal(expressEstimate.expressSurchargeCents, 3_840)
    assert.equal(expressEstimate.lowCents, 23_040)
  })
})
