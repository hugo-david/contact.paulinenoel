import { BaseMail } from '@adonisjs/mail'
import type QuoteRequest from '#models/quote_request'
import env from '#start/env'

export default class QuoteRequestNotification extends BaseMail {
  subject: string

  constructor(public quoteRequest: QuoteRequest) {
    super()
    this.subject = `Nouvelle demande de devis de ${quoteRequest.fullName}`
  }

  prepare() {
    this.message
      .to(env.get('QUOTE_REQUEST_RECIPIENT', 'paulinenoel99@gmail.com'))
      .replyTo(this.quoteRequest.email)
      .htmlView('emails/quote_request_notification', {
        quoteRequest: this.quoteRequest,
      })
      .textView('emails/quote_request_notification_text', {
        quoteRequest: this.quoteRequest,
      })
  }
}
