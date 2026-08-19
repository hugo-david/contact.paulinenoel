import { test } from '@japa/runner'

test('keeps the branding answers when navigating back', async ({ visit }) => {
  const page = await visit('/')

  await page.getByRole('button', { name: 'Commencer' }).click()
  const brandingDomain = page.getByRole('checkbox', {
    name: /Identité & branding/,
  })
  await brandingDomain.focus()
  await page.keyboard.press('Space')
  await page.getByRole('button', { name: 'Continuer' }).click()
  const creationFormula = page.getByRole('radio', {
    name: /Formule création/,
  })
  await creationFormula.focus()
  await page.keyboard.press('Space')
  await page.getByRole('button', { name: 'Continuer' }).click()
  await page.getByRole('button', { name: '← Retour' }).click()

  await page.assertChecked('input[value="creation"]')
  await page.assertTextContains('body', '2 250 €')
})

test('shows the express surcharge in the summary', async ({ visit }) => {
  const page = await visit('/')

  await page.getByRole('button', { name: 'Commencer' }).click()
  await page.getByText('Identité & branding', { exact: true }).click()
  await page.getByRole('button', { name: 'Continuer' }).click()
  await page.getByText('Formule création', { exact: true }).click()
  await page.getByRole('button', { name: 'Continuer' }).click()
  await page.getByText('Express — 1 semaine', { exact: true }).click()
  await page.getByRole('button', { name: 'Continuer' }).click()

  await page.assertTextContains('body', 'Majoration express (+25 %)')
  await page.assertTextContains('body', '563 €')
  await page.assertTextContains('body', '2 813 €')
})
