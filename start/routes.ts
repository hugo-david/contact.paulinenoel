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

router.on('/').renderInertia('home', {}).as('home')

router.group(() => {}).use(middleware.guest())

router.group(() => {}).use(middleware.auth())
