import { defineConfig, transports } from '@adonisjs/mail'
import env from '#start/env'

const smtpUsername = env.get('SMTP_USERNAME')
const smtpPassword = env.get('SMTP_PASSWORD')

export default defineConfig({
  default: 'smtp',
  from: {
    address: env.get('MAIL_FROM_ADDRESS', 'paulinenoel99@gmail.com'),
    name: env.get('MAIL_FROM_NAME', 'Pauline Noël'),
  },
  mailers: {
    smtp: transports.smtp({
      host: env.get('SMTP_HOST', 'localhost'),
      port: env.get('SMTP_PORT', 1025),
      secure: env.get('SMTP_SECURE', false),
      auth:
        smtpUsername && smtpPassword
          ? { type: 'login', user: smtpUsername, pass: smtpPassword }
          : undefined,
    }),
  },
})
