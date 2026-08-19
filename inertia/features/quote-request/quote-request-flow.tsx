import type { ReactNode, RefObject } from 'react'
import { useEffect, useRef, useState } from 'react'
import { Button } from '~/components/ui'
import { cn } from '~/utils/cn'
import type { BrandingFormula, DesiredTimeline } from './branding-estimate'
import {
  brandingFormulas,
  calculateBrandingEstimate,
  formatEuros,
} from './branding-estimate'
import './quote-request-flow.css'

type Step = 'intro' | 'domains' | 'branding' | 'timeline' | 'summary'

const workflowSteps: Step[] = ['domains', 'branding', 'timeline', 'summary']

const graphicCharterContents = [
  ['La vision', 'Mission, ton et positionnement de la marque'],
  ['Les cibles & personas', "À qui s'adresse la marque"],
  ['Les logos', 'Logo principal et ses déclinaisons'],
  ['Les couleurs', 'Palette principale et secondaire'],
  ['Les typographies', 'Titres et textes courants'],
  ['Quelques assets', 'Pictos, formes et patterns'],
  ['Quelques visuels', 'Direction photo et illustrations'],
  ['Quelques applications', 'Carte, signature, réseaux sociaux…'],
] as const

const timelines: Array<{
  description: string
  label: string
  value: DesiredTimeline
}> = [
  {
    value: 'flexible',
    label: 'Je suis flexible',
    description: "On cale ensemble, pas d'urgence",
  },
  {
    value: 'normal',
    label: '10 jours à 1 mois',
    description: 'Sans développement',
  },
  {
    value: 'express',
    label: 'Express — 1 semaine',
    description: 'Priorisation du planning · +25 %',
  },
]

function BrandingIcon() {
  return (
    <svg aria-hidden="true" className="size-8" fill="none" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" />
    </svg>
  )
}

function WebIcon() {
  return (
    <svg aria-hidden="true" className="size-8" fill="none" viewBox="0 0 24 24">
      <rect height="14" rx="2" width="20" x="2" y="4" />
      <path d="M2 9h20M6 21h12" />
    </svg>
  )
}

function PrintIcon() {
  return (
    <svg aria-hidden="true" className="size-8" fill="none" viewBox="0 0 24 24">
      <path d="M6 9V3h12v6M6 18h12v3H6z" />
      <rect height="9" rx="1.5" width="18" x="3" y="9" />
    </svg>
  )
}

function DigitalIcon() {
  return (
    <svg aria-hidden="true" className="size-8" fill="none" viewBox="0 0 24 24">
      <rect height="12" rx="2" width="18" x="3" y="5" />
      <path d="M3 9h18M7 13h4" />
    </svg>
  )
}

interface DomainCardProps {
  checked?: boolean
  description: string
  disabled?: boolean
  icon: ReactNode
  label: string
  onChange?: (checked: boolean) => void
}

function DomainCard({
  checked = false,
  description,
  disabled = false,
  icon,
  label,
  onChange,
}: DomainCardProps) {
  return (
    <label
      className={cn(
        'relative min-h-40 rounded-[1.125rem] border border-[#1e2324] bg-white p-5 text-start',
        'has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-3',
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
      )}
    >
      <input
        checked={checked}
        className="sr-only"
        disabled={disabled}
        onChange={(event) => onChange?.(event.target.checked)}
        type="checkbox"
      />
      <span className="block stroke-[#1f2a28] stroke-[1.6]">{icon}</span>
      <span className="mt-3.5 block font-heading text-[1.0625rem] font-bold">
        {label}
      </span>
      <span className="mt-1 block text-[0.84375rem] leading-[1.4] text-[#7a7e79]">
        {description}
      </span>
      {disabled && (
        <span className="mt-3 inline-block rounded-full bg-[#e7e8f2] px-2.5 py-1 text-xs font-semibold text-[#454b57]">
          Prochainement
        </span>
      )}
      {checked && (
        <>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -inset-0.5 rounded-[1.125rem] border-[2.5px] border-[#f0606f]"
          />
          <span
            aria-hidden="true"
            className="absolute end-3.5 top-3.5 flex size-6 items-center justify-center rounded-full bg-[#f0606f] text-sm text-white"
          >
            ✓
          </span>
        </>
      )}
    </label>
  )
}

interface StepHeadingProps {
  eyebrow?: string
  heading: string
  headingId: string
  headingRef: RefObject<HTMLHeadingElement | null>
  intro?: ReactNode
}

function StepHeading({
  eyebrow,
  heading,
  headingId,
  headingRef,
  intro,
}: StepHeadingProps) {
  return (
    <div>
      {eyebrow && (
        <p className="mb-1.5 text-[0.8125rem] font-semibold tracking-[0.04em] text-[#f0606f] uppercase">
          {eyebrow}
        </p>
      )}
      <h1
        className="font-heading text-3xl leading-tight font-bold tracking-[-0.025em]"
        id={headingId}
        ref={headingRef}
        tabIndex={-1}
      >
        {heading}
      </h1>
      {intro && <div className="mt-2 text-base text-[#6e726e]">{intro}</div>}
    </div>
  )
}

export function QuoteRequestFlow() {
  const [step, setStep] = useState<Step>('intro')
  const [brandingSelected, setBrandingSelected] = useState(false)
  const [formula, setFormula] = useState<BrandingFormula | null>(null)
  const [timeline, setTimeline] = useState<DesiredTimeline>('normal')
  const [budgetEuros, setBudgetEuros] = useState(0)
  const stepHeadingRef = useRef<HTMLHeadingElement>(null)
  const previousStepRef = useRef<Step>('intro')

  const estimate = calculateBrandingEstimate({
    budgetCents: budgetEuros > 0 ? budgetEuros * 100 : null,
    formula,
    timeline,
  })
  const workflowStepIndex = workflowSteps.indexOf(step)
  const showCounter = workflowStepIndex >= 0
  const showLiveEstimate =
    estimate.lowCents > 0 && step !== 'intro' && step !== 'summary'

  useEffect(() => {
    if (previousStepRef.current !== step) {
      stepHeadingRef.current?.focus({ preventScroll: true })
      previousStepRef.current = step
    }
  }, [step])

  const moveToStep = (nextStep: Step) => {
    setStep(nextStep)
    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' })
  }

  const canContinue =
    step === 'domains'
      ? brandingSelected
      : step === 'branding'
        ? formula !== null
        : true

  const next = () => {
    if (!canContinue) return

    const nextStep: Partial<Record<Step, Step>> = {
      intro: 'domains',
      domains: 'branding',
      branding: 'timeline',
      timeline: 'summary',
    }
    const target = nextStep[step]
    if (target) moveToStep(target)
  }

  const previous = () => {
    const previousStep: Partial<Record<Step, Step>> = {
      domains: 'intro',
      branding: 'domains',
      timeline: 'branding',
      summary: 'timeline',
    }
    const target = previousStep[step]
    if (target) moveToStep(target)
  }

  const budgetLabel =
    budgetEuros === 0
      ? 'Non précisé'
      : budgetEuros >= 10_000
        ? '10 000 € +'
        : formatEuros(budgetEuros * 100)

  return (
    <div className="min-h-dvh bg-[#f0f4ff] text-[#1f2a28]">
      <header className="sticky top-0 z-20 border-b border-[#d4e0f5] bg-[#f0f4ff]/90 backdrop-blur-[10px]">
        <div className="mx-auto flex max-w-[47.5rem] items-center gap-4 px-4 py-4 sm:px-6">
          <span className="font-heading text-[1.375rem] font-bold tracking-[-0.01em]">
            Pauline Noël
          </span>
          <span className="flex-1" />
          {showLiveEstimate && (
            <output
              aria-live="polite"
              className="hidden items-center gap-2 rounded-full bg-[#1f2a28] px-3.5 py-2 text-[0.8125rem] font-semibold text-white sm:flex"
            >
              <span
                aria-hidden="true"
                className="size-[0.4375rem] rounded-full bg-[#f0606f]"
              />
              Estimation&nbsp;: {formatEuros(estimate.lowCents)}
            </output>
          )}
          {showCounter && (
            <span className="whitespace-nowrap text-[0.78125rem] font-semibold text-[#7a7e79]">
              Étape {workflowStepIndex + 1} / {workflowSteps.length}
            </span>
          )}
        </div>
        <div aria-hidden="true" className="h-[3px] bg-white">
          <div
            className="h-full bg-[#f0606f] transition-[width] duration-300 motion-reduce:transition-none"
            style={{
              width:
                step === 'intro'
                  ? '0%'
                  : `${((workflowStepIndex + 1) / workflowSteps.length) * 100}%`,
            }}
          />
        </div>
      </header>

      <div className="mx-auto w-full max-w-[47.5rem] px-4 pt-10 pb-36 sm:px-6">
        {step === 'intro' && (
          <section aria-labelledby="intro-heading">
            <p className="mb-[1.125rem] text-[0.8125rem] font-semibold tracking-[0.04em] text-[#f0606f] uppercase">
              Estimation de projet
            </p>
            <h1
              className="max-w-[22ch] font-heading text-[clamp(2.5rem,8vw,2.875rem)] leading-[1.04] font-bold tracking-[-0.03em]"
              id="intro-heading"
              ref={stepHeadingRef}
              tabIndex={-1}
            >
              Donnons un{' '}
              <span className="rounded-sm bg-[#f0606f] px-[0.12em] text-white">
                budget
              </span>
              <br />à votre idée.
            </h1>
            <p className="mt-[1.125rem] max-w-[46ch] text-lg leading-normal text-[#5c615d]">
              En 2 minutes, répondez à quelques questions sur votre projet et
              obtenez une fourchette de prix détaillée, au plus juste. Sans
              engagement.
            </p>
            <ul className="mt-[1.875rem] flex max-w-[27.5rem] flex-col gap-3 text-[0.9375rem] text-[#3a403c]">
              {[
                'Branding, sites web, supports imprimés & digitaux',
                'Une fourchette claire, détaillée ligne par ligne',
                'Et, si vous le souhaitez, un devis détaillé sous 48h',
              ].map((benefit) => (
                <li className="flex items-start gap-3" key={benefit}>
                  <span aria-hidden="true" className="text-[#f0606f]">
                    ✓
                  </span>
                  {benefit}
                </li>
              ))}
            </ul>
          </section>
        )}

        {step === 'domains' && (
          <section aria-labelledby="domains-heading">
            <StepHeading
              heading="De quoi avez-vous besoin ?"
              headingId="domains-heading"
              headingRef={stepHeadingRef}
              intro={
                <p id="domains-help">
                  Choisissez un ou plusieurs pôles. On ne vous posera que les
                  questions utiles.
                </p>
              }
            />
            <fieldset
              aria-describedby="domains-help"
              className="mt-7 grid grid-cols-1 gap-3.5 sm:grid-cols-2"
            >
              <legend className="sr-only">Pôles de prestations</legend>
              <DomainCard
                checked={brandingSelected}
                description="Logo, charte graphique, refonte"
                icon={<BrandingIcon />}
                label="Identité & branding"
                onChange={setBrandingSelected}
              />
              <DomainCard
                description="Vitrine, e-commerce, landing, refonte"
                disabled
                icon={<WebIcon />}
                label="Site internet · design UX/UI"
              />
              <DomainCard
                description="Flyer, affiche, carte de visite, covering…"
                disabled
                icon={<PrintIcon />}
                label="Supports de com. imprimés"
              />
              <DomainCard
                description="Newsletter, posts réseaux sociaux, signature, slides"
                disabled
                icon={<DigitalIcon />}
                label="Supports de com. digitaux"
              />
            </fieldset>
          </section>
        )}

        {step === 'branding' && (
          <section aria-labelledby="branding-heading">
            <StepHeading
              eyebrow="Identité & branding"
              heading="Quelle formule ?"
              headingId="branding-heading"
              headingRef={stepHeadingRef}
              intro={
                <>
                  <p>
                    Chaque formule comprend un{' '}
                    <strong className="font-semibold text-[#3a403c]">
                      brief créatif
                    </strong>
                    , un{' '}
                    <strong className="font-semibold text-[#3a403c]">
                      persona
                    </strong>
                    , des{' '}
                    <strong className="font-semibold text-[#3a403c]">
                      moodboards
                    </strong>
                    , plusieurs pistes de logo et la charte graphique.
                  </p>
                  <p className="mt-2 text-sm text-[#7a7e79]">
                    Valise graphique (exports des éléments) et cession des
                    droits incluses. Base&nbsp;: 450&nbsp;€ / jour.
                  </p>
                </>
              }
            />
            <fieldset className="mt-[1.375rem] flex flex-col gap-[0.8125rem]">
              <legend className="sr-only">
                Formule d’identité et branding
              </legend>
              {(
                Object.entries(brandingFormulas) as Array<
                  [BrandingFormula, (typeof brandingFormulas)[BrandingFormula]]
                >
              ).map(([value, definition]) => (
                <label
                  className={cn(
                    'relative cursor-pointer rounded-[1.125rem] border border-[#1e2324] bg-white px-5 py-[1.125rem]',
                    'has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-3 sm:px-[1.375rem] sm:py-5',
                  )}
                  key={value}
                >
                  <input
                    checked={formula === value}
                    className="sr-only"
                    name="branding-formula"
                    onChange={() => setFormula(value)}
                    type="radio"
                    value={value}
                  />
                  <span className="flex items-start gap-4">
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="font-heading text-[1.0625rem] font-bold">
                          {definition.label}
                        </span>
                        {'popular' in definition && definition.popular && (
                          <span className="rounded-full bg-[#1f2a28] px-2 py-0.5 text-[0.6875rem] font-bold text-white">
                            POPULAIRE
                          </span>
                        )}
                        <span className="text-xs text-[#7a7e79]">
                          {definition.duration}
                        </span>
                      </span>
                      <span className="mt-1 block text-[0.84375rem] leading-[1.45] text-[#7a7e79]">
                        {definition.description}
                      </span>
                    </span>
                    <span className="shrink-0 text-[0.9375rem] font-bold text-[#f0606f]">
                      {formatEuros(definition.priceCents)}
                    </span>
                  </span>
                  {formula === value && (
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute -inset-0.5 rounded-[1.125rem] border-[2.5px] border-[#f0606f]"
                    />
                  )}
                </label>
              ))}
            </fieldset>

            <aside className="relative mt-7 overflow-hidden rounded-[1.25rem] bg-[#1f2a28] px-5 py-6 text-white sm:px-[1.625rem]">
              <span
                aria-hidden="true"
                className="absolute -end-10 -top-10 size-[9.375rem] rounded-full bg-[#f0606f]/15"
              />
              <p className="relative inline-block rounded-full bg-[#ff929d] px-3.5 py-1.5 text-xs font-bold text-[#1f2a28]">
                Inclus dans chaque formule
              </p>
              <h2 className="relative mt-2 font-heading text-[1.3125rem] font-bold tracking-[-0.02em]">
                Ce que contient votre charte graphique
              </h2>
              <p className="relative mt-1.5 max-w-[48ch] text-sm leading-normal text-[#b9beb9]">
                Un véritable guide de marque, votre « bible » à consulter à
                chaque nouvelle création.
              </p>
              <ol className="relative mt-5 grid grid-cols-1 gap-x-[1.375rem] gap-y-3.5 sm:grid-cols-2">
                {graphicCharterContents.map(([label, description], index) => (
                  <li className="flex items-start gap-3" key={label}>
                    <span className="w-[1.375rem] shrink-0 text-xs font-bold text-[#f0606f]">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span>
                      <span className="block text-[0.90625rem] font-semibold">
                        {label}
                      </span>
                      <span className="mt-px block text-[0.78125rem] leading-[1.4] text-[#9da29d]">
                        {description}
                      </span>
                    </span>
                  </li>
                ))}
              </ol>
            </aside>
          </section>
        )}

        {step === 'timeline' && (
          <section aria-labelledby="timeline-heading">
            <StepHeading
              eyebrow="Dernière étape"
              heading="Pour quand ?"
              headingId="timeline-heading"
              headingRef={stepHeadingRef}
              intro={<p>Le délai influe sur l’organisation du projet.</p>}
            />
            <fieldset className="mt-6 flex flex-col gap-3">
              <legend className="sr-only">Délai souhaité</legend>
              {timelines.map((option) => (
                <label
                  className="relative cursor-pointer rounded-2xl border border-[#1e2324] bg-white px-5 py-[1.125rem] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-3"
                  key={option.value}
                >
                  <input
                    checked={timeline === option.value}
                    className="sr-only"
                    name="timeline"
                    onChange={() => setTimeline(option.value)}
                    type="radio"
                    value={option.value}
                  />
                  <span className="block font-heading text-base font-bold">
                    {option.label}
                  </span>
                  <span className="mt-0.5 block text-[0.84375rem] text-[#7a7e79]">
                    {option.description}
                  </span>
                  {timeline === option.value && (
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute -inset-0.5 rounded-2xl border-[2.5px] border-[#f0606f]"
                    />
                  )}
                </label>
              ))}
            </fieldset>
            <div className="mt-[1.625rem] border-t border-dotted border-[#1e2324] pt-[1.375rem]">
              <label
                className="mb-1.5 flex items-baseline justify-between gap-4 text-[0.9375rem] font-semibold"
                htmlFor="budget"
              >
                <span>
                  Budget indicatif{' '}
                  <span className="font-normal text-[#7a7e79]">
                    (optionnel)
                  </span>
                </span>
                <output className="font-bold text-[#f0606f]">
                  {budgetLabel}
                </output>
              </label>
              <input
                className="h-11 w-full accent-[#f0606f]"
                id="budget"
                max="10000"
                min="0"
                onChange={(event) =>
                  setBudgetEuros(Number.parseInt(event.target.value, 10))
                }
                step="250"
                type="range"
                value={budgetEuros}
              />
              <div
                aria-hidden="true"
                className="flex justify-between text-xs text-[#7a7e79]"
              >
                <span>Non précisé</span>
                <span>10 000 € +</span>
              </div>
              <p className="mt-3 text-[0.8125rem] leading-normal text-[#6e726e]">
                Le budget sert uniquement à qualifier votre demande et ne
                modifie pas l’estimation.
              </p>
            </div>
          </section>
        )}

        {step === 'summary' && (
          <section aria-labelledby="summary-heading">
            <div className="relative overflow-hidden rounded-[1.625rem] bg-[#1f2a28] px-6 py-8 text-white sm:px-8">
              <span
                aria-hidden="true"
                className="absolute -end-[1.875rem] -top-[1.875rem] size-40 rounded-full bg-[#f0606f]/20"
              />
              <p className="relative text-[0.8125rem] font-semibold tracking-[0.05em] text-[#f0606f] uppercase">
                Votre estimation
              </p>
              <h1
                className="quote-price-pop relative mt-2.5 font-heading text-[clamp(2.5rem,10vw,3.25rem)] font-bold tracking-[-0.03em]"
                id="summary-heading"
                ref={stepHeadingRef}
                tabIndex={-1}
              >
                {formatEuros(estimate.lowCents)}
              </h1>
              <p className="relative mt-1.5 max-w-[46ch] text-[0.90625rem] leading-normal text-[#b9beb9]">
                Design facturé sur une base de 450 € / jour. Hors frais
                externes, notamment l’impression et les banques d’images.
              </p>
            </div>

            <div className="mt-6 rounded-[1.25rem] border border-[#1e2324] bg-white px-[1.375rem] py-2">
              {estimate.lines.map((line) => (
                <div
                  className="flex items-start gap-3.5 border-b border-[#eeebe3] py-[0.9375rem]"
                  key={line.label}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-[0.96875rem] font-semibold">
                      {line.label}
                    </p>
                    <p className="mt-0.5 text-[0.8125rem] text-[#7a7e79]">
                      {line.detail}
                    </p>
                  </div>
                  <p className="shrink-0 text-[0.96875rem] font-bold">
                    {formatEuros(line.amountCents)}
                  </p>
                </div>
              ))}
              {estimate.expressSurchargeCents > 0 && (
                <div className="flex justify-between gap-3 border-b border-[#eeebe3] py-[0.9375rem] text-[0.96875rem] font-bold text-[#f0606f]">
                  <p>Majoration express (+25 %)</p>
                  <p>{formatEuros(estimate.expressSurchargeCents)}</p>
                </div>
              )}
              <div className="flex items-center justify-between gap-3 py-4 text-lg font-bold">
                <p>Total estimé</p>
                <p>{formatEuros(estimate.lowCents)}</p>
              </div>
            </div>

            <aside className="mt-[1.125rem] flex items-start gap-2.5 rounded-[0.875rem] bg-[#e7e8f2] px-[1.0625rem] py-[0.9375rem]">
              <span aria-hidden="true">💡</span>
              <p className="text-[0.84375rem] leading-normal text-[#454b57]">
                Il s’agit d’une estimation indicative, à peaufiner ensemble lors
                d’un échange. Elle ne constitue pas un devis contractuel.
              </p>
            </aside>
          </section>
        )}
      </div>

      <footer className="fixed inset-x-0 bottom-0 z-20 border-t border-[#d4e0f5] bg-[#f0f4ff]/90 backdrop-blur-[10px]">
        <div className="mx-auto flex max-w-[47.5rem] items-center gap-3.5 px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6">
          {step !== 'intro' && (
            <Button
              className="border-[#1e2324] bg-transparent px-[1.375rem] text-[#1f2a28] opacity-100"
              onClick={previous}
              variant="secondary"
            >
              ← Retour
            </Button>
          )}
          <span className="flex-1" />
          {step !== 'summary' && (
            <Button
              className="px-[1.875rem] active:scale-[0.96] motion-reduce:transform-none"
              disabled={!canContinue}
              onClick={next}
            >
              {step === 'intro' ? 'Commencer' : 'Continuer'}
            </Button>
          )}
        </div>
      </footer>
    </div>
  )
}
