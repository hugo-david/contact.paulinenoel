import type { SchemaRules } from '@adonisjs/lucid/types/schema_generator'

const dateTimeColumn = {
  tsType: 'DateTime',
  imports: [{ source: 'luxon', typeImports: ['DateTime'] }],
  decorators: [{ name: '@column.dateTime' }],
}

export default {
  types: {
    DateTime: dateTimeColumn,
    json: {
      tsType: 'unknown',
      imports: [],
      decorators: [{ name: '@column' }],
    },
    jsonb: {
      tsType: 'unknown',
      imports: [],
      decorators: [{ name: '@column' }],
    },
  },
  columns: {
    created_at: {
      ...dateTimeColumn,
      decorators: [{ name: '@column.dateTime', args: { autoCreate: true } }],
    },
    updated_at: {
      ...dateTimeColumn,
      decorators: [
        {
          name: '@column.dateTime',
          args: { autoCreate: true, autoUpdate: true },
        },
      ],
    },
  },
} satisfies SchemaRules
