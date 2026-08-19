/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  home: typeof routes['home']
  privacyPolicy: typeof routes['privacy_policy']
  quoteRequests: {
    store: typeof routes['quote_requests.store']
  }
}
