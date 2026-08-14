/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import { middleware } from "#start/kernel";
import router from "@adonisjs/core/services/router";

router.on("/").renderInertia("home", {}).as("home");

router.group(() => {}).use(middleware.guest());

router.group(() => {}).use(middleware.auth());
