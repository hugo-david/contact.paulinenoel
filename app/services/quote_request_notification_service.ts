import mail from '@adonisjs/mail/services/main'
import QuoteRequestNotification from '#mails/quote_request_notification'
import type QuoteRequest from '#models/quote_request'

export default class QuoteRequestNotificationService {
  async send(quoteRequest: QuoteRequest) {
    await mail.send(new QuoteRequestNotification(quoteRequest))
  }
}
