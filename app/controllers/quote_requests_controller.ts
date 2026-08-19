import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
// Biome sees a type-only use, but Adonis resolves this constructor at runtime.
// biome-ignore lint/style/useImportType: required by dependency injection
import QuoteRequestSubmissionService, {
  QuoteRequestEstimateChangedError,
  QuoteRequestNotificationFailedError,
} from '#services/quote_request_submission_service'
import { storeQuoteRequestValidator } from '#validators/quote_request'

@inject()
export default class QuoteRequestsController {
  constructor(private submissionService: QuoteRequestSubmissionService) {}

  async store({ request, response }: HttpContext) {
    const payload = await request.validateUsing(storeQuoteRequestValidator)

    try {
      await this.submissionService.submit(payload)
      return response.created({ status: 'sent' })
    } catch (error) {
      if (error instanceof QuoteRequestEstimateChangedError) {
        return response.status(409).send({
          message:
            'Les tarifs ont évolué depuis l’affichage de votre estimation. Actualisez la page pour vérifier le nouveau montant avant l’envoi.',
          status: 'estimate_changed',
        })
      }
      if (error instanceof QuoteRequestNotificationFailedError) {
        return response.status(502).send({
          message:
            "Votre demande est bien enregistrée, mais l'envoi a échoué. Vous pouvez réessayer sans ressaisir vos informations.",
          status: 'failed',
        })
      }

      throw error
    }
  }
}
