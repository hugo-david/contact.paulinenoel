import { Head, Link } from '@inertiajs/react'

export default function PrivacyPolicy() {
  return (
    <div className="min-h-dvh bg-[#f0f4ff] text-[#1f2a28]">
      <Head title="Politique de confidentialité" />
      <header className="border-b border-[#d4e0f5]">
        <div className="mx-auto flex max-w-[47.5rem] items-center justify-between gap-4 px-4 py-5 sm:px-6">
          <span className="font-heading text-[1.375rem] font-bold tracking-[-0.01em]">
            Pauline Noël
          </span>
          <Link
            className="font-semibold text-[#f0606f] underline decoration-2 underline-offset-4"
            href="/"
          >
            Retour à l’estimation
          </Link>
        </div>
      </header>

      <article className="mx-auto max-w-[47.5rem] px-4 py-12 sm:px-6 sm:py-16">
        <p className="text-[0.8125rem] font-semibold tracking-[0.05em] text-[#f0606f] uppercase">
          Vos données
        </p>
        <h1 className="mt-2 max-w-[18ch] font-heading text-4xl leading-tight font-bold tracking-[-0.03em] sm:text-5xl">
          Politique de confidentialité
        </h1>
        <p className="mt-5 max-w-[62ch] text-lg leading-relaxed text-[#5f6561]">
          Cette page explique comment Pauline Noël utilise les informations que
          vous transmettez lors d’une demande de devis.
        </p>

        <div className="mt-12 grid gap-10 text-base leading-relaxed sm:mt-16 sm:grid-cols-2 sm:gap-x-12">
          <section>
            <h2 className="font-heading text-2xl font-bold">
              Données collectées
            </h2>
            <p className="mt-3 text-[#5f6561]">
              Le formulaire recueille votre nom, votre e-mail et la description
              de votre projet. Vous pouvez aussi indiquer un téléphone, une
              entreprise, un site web et un délai souhaité. Vos choix de
              prestations et l’estimation affichée sont également enregistrés.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold">Pourquoi</h2>
            <p className="mt-3 text-[#5f6561]">
              Ces données servent uniquement à qualifier votre projet,
              transmettre votre demande à Pauline Noël, préparer une réponse
              personnalisée et conserver une archive fiable de l’échange.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold">
              Durée de conservation
            </h2>
            <p className="mt-3 text-[#5f6561]">
              Chaque demande est conservée pendant trois ans à compter du
              dernier contact avec vous, puis supprimée.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-2xl font-bold">Vos droits</h2>
            <p className="mt-3 text-[#5f6561]">
              Vous pouvez demander l’accès, la rectification ou l’effacement de
              vos données, ainsi que la limitation ou l’opposition à leur
              traitement lorsque ces droits s’appliquent. Pour exercer vos
              droits, écrivez à{' '}
              <a
                className="font-semibold text-[#f0606f] underline decoration-2 underline-offset-4"
                href="mailto:paulinenoel99@gmail.com"
              >
                paulinenoel99@gmail.com
              </a>
              .
            </p>
          </section>
        </div>
      </article>
    </div>
  )
}
