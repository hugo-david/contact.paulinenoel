/* eslint-disable prettier/prettier */
/// <reference path="../manifest.d.ts" />

import type { ExtractBody, ExtractErrorResponse, ExtractQuery, ExtractQueryForGet, ExtractResponse } from '@tuyau/core/types'
import type { InferInput, SimpleError } from '@vinejs/vine/types'

export type ParamValue = string | number | bigint | boolean

export interface Registry {
  'home': {
    methods: ["GET","HEAD"]
    pattern: '/'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'privacy_policy': {
    methods: ["GET","HEAD"]
    pattern: '/politique-de-confidentialite'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: unknown
      errorResponse: unknown
    }
  }
  'quote_requests.store': {
    methods: ["POST"]
    pattern: '/demandes-de-devis'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/quote_request').storeQuoteRequestValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/quote_request').storeQuoteRequestValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/quote_requests_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/quote_requests_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
}
