import vine from '@vinejs/vine'

const optionalText = (maxLength: number) =>
  vine.string().trim().maxLength(maxLength).optional()

export const storeQuoteRequestValidator = vine.create({
  fullName: vine.string().trim().minLength(1).maxLength(120),
  email: vine.string().trim().email().maxLength(254),
  phone: optionalText(40),
  companyName: optionalText(160),
  websiteUrl: vine
    .string()
    .trim()
    .url({ require_protocol: true })
    .maxLength(2_000)
    .optional(),
  projectDescription: vine.string().trim().minLength(1).maxLength(5_000),
  desiredTimeline: vine.enum(['flexible', 'normal', 'express']),
  selections: vine.object({
    branding: vine
      .object({
        formula: vine.enum(['refonte', 'mixte', 'creation']),
      })
      .optional(),
    web: vine
      .object({
        features: vine.array(
          vine.enum([
            'blog',
            'event',
            'payment',
            'booking',
            'multilingual',
            'memberArea',
          ]),
        ),
        pages: vine.number().withoutDecimals().range([1, 40]),
        type: vine.enum([
          'showcase',
          'ecommerce',
          'landing',
          'showcaseRedesign',
          'landingRedesign',
        ]),
      })
      .optional(),
    print: vine
      .object({
        flyer: vine.number().withoutDecimals().range([0, 20]),
        poster: vine.number().withoutDecimals().range([0, 20]),
        brochure: vine.number().withoutDecimals().range([0, 20]),
        businessCard: vine.number().withoutDecimals().range([0, 20]),
        rollup: vine.number().withoutDecimals().range([0, 20]),
        banner: vine.number().withoutDecimals().range([0, 20]),
        fullWrap: vine.number().withoutDecimals().range([0, 20]),
        signage: vine.number().withoutDecimals().range([0, 20]),
        letterhead: vine.number().withoutDecimals().range([0, 20]),
        goodies: vine.number().withoutDecimals().range([0, 20]),
      })
      .optional(),
  }),
  estimate: vine.object({
    highCents: vine.number().withoutDecimals().min(0),
    lines: vine.array(
      vine.object({
        amountCents: vine.number().withoutDecimals().min(0),
        detail: vine.string().trim().maxLength(500),
        label: vine.string().trim().maxLength(200),
      }),
    ),
    lowCents: vine.number().withoutDecimals().min(0),
  }),
})
