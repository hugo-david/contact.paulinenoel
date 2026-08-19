import { Head } from '@inertiajs/react'
import { QuoteRequestFlow } from '~/features/quote-request/quote-request-flow'

export default function Home() {
  return (
    <>
      <Head title="Estimation de projet" />
      <QuoteRequestFlow />
    </>
  )
}
