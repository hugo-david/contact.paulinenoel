/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const QuoteRequestsController = () =>
  import('#controllers/quote_requests_controller')

router.on('/').renderInertia('home', {}).as('home')
router
  .on('/politique-de-confidentialite')
  .renderInertia('privacy_policy', {})
  .as('privacy_policy')
router
  .post('/demandes-de-devis', [QuoteRequestsController, 'store'])
  .as('quote_requests.store')

router.group(() => {}).use(middleware.guest())

router.group(() => {}).use(middleware.auth())
