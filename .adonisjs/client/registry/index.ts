/* eslint-disable prettier/prettier */
import type { AdonisEndpoint } from '@tuyau/core/types'
import type { Registry } from './schema.d.ts'
import type { ApiDefinition } from './tree.d.ts'

const placeholder: any = {}

const routes = {
  'home': {
    methods: ["GET","HEAD"],
    pattern: '/',
    tokens: [{"old":"/","type":0,"val":"/","end":""}],
    types: placeholder as Registry['home']['types'],
  },
  'privacy_policy': {
    methods: ["GET","HEAD"],
    pattern: '/politique-de-confidentialite',
    tokens: [{"old":"/politique-de-confidentialite","type":0,"val":"politique-de-confidentialite","end":""}],
    types: placeholder as Registry['privacy_policy']['types'],
  },
  'quote_requests.store': {
    methods: ["POST"],
    pattern: '/demandes-de-devis',
    tokens: [{"old":"/demandes-de-devis","type":0,"val":"demandes-de-devis","end":""}],
    types: placeholder as Registry['quote_requests.store']['types'],
  },
} as const satisfies Record<string, AdonisEndpoint>

export { routes }

export const registry = {
  routes,
  $tree: {} as ApiDefinition,
}

declare module '@tuyau/core/types' {
  export interface UserRegistry {
    routes: typeof routes
    $tree: ApiDefinition
  }
}
