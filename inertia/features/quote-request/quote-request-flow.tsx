import axios from 'axios'
import type { FormEvent, ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'
import brandingDomainIcon from '~/assets/images/domain-branding.svg'
import digitalDomainIcon from '~/assets/images/domain-digital.svg'
import printDomainIcon from '~/assets/images/domain-print.svg'
import webDomainIcon from '~/assets/images/domain-web.svg'
import estimationDot from '~/assets/images/estimation-dot.svg'
import paulineNoelLogo from '~/assets/images/pauline-noel-logo.svg'
import { Button, Textarea, TextInput } from '~/components/ui'
import { cn } from '~/utils/cn'
import type {
  BrandingFormula,
  DesiredTimeline,
  EstimateLine,
  PrintSelections,
  PrintSupport,
  WebFeature,
  WebProjectType,
  WebSelections,
} from './branding-estimate'
import {
  brandingFormulas,
  calculateQuoteEstimate,
  createPrintSelections,
  formatEuros,
  getEstimateSnapshotLines,
  printSupports,
  webFeatures,
  webProjects,
} from './branding-estimate'
import './quote-request-flow.css'

type Step =
  | 'intro'
  | 'domains'
  | 'branding'
  | 'web'
  | 'print'
  | 'timeline'
  | 'summary'
  | 'contact'

interface ContactDetails {
  companyName: string
  email: string
  fullName: string
  phone: string
  projectDescription: string
  websiteUrl: string
}

type ContactField = keyof ContactDetails
type SubmissionStatus = 'idle' | 'submitting' | 'failed' | 'sent'

const initialContactDetails: ContactDetails = {
  companyName: '',
  email: '',
  fullName: '',
  phone: '',
  projectDescription: '',
  websiteUrl: '',
}

const quoteRequestDraftStorageKey = 'pauline-noel:quote-request-draft:v1'

interface QuoteRequestDraft {
  brandingSelected: boolean
  contactDetails: ContactDetails
  formula: BrandingFormula | null
  step: Step
  timeline: DesiredTimeline | null
  printSelected?: boolean
  printSelections?: PrintSelections
  webSelected: boolean
  webSelections: WebSelections | null
}

const initialWebSelections: WebSelections = {
  features: [],
  pages: 4,
  type: 'showcase',
}

const webFeatureEntries = Object.entries(webFeatures) as Array<
  [WebFeature, string]
>

const printSupportEntries = Object.entries(printSupports) as Array<
  [PrintSupport, (typeof printSupports)[PrintSupport]]
>

function formatEstimateLine(line: EstimateLine) {
  return line.amountCents === 0 ? 'sur-mesure' : formatEuros(line.amountCents)
}

const introBenefits = [
  'Branding, sites web, supports imprimés & digitaux',
  'Une fourchette claire, détaillée ligne par ligne',
  'un devis détaillé sous 48h',
] as const

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
  emphasis?: string
  label: string
  value: DesiredTimeline
}> = [
  {
    value: 'flexible',
    label: 'Je suis flexible',
    description: 'On fixe ensemble, pas d’urgence',
  },
  {
    value: 'normal',
    label: '10 jours à 1 mois',
    description: '',
  },
  {
    value: 'express',
    label: 'Express',
    emphasis: '-10 jours',
    description: 'Hors site internet • priorisation du planning + 20 %',
  },
]

function isBrandingFormula(value: unknown): value is BrandingFormula {
  return value === 'refonte' || value === 'mixte' || value === 'creation'
}

function isContactDetails(value: unknown): value is ContactDetails {
  if (typeof value !== 'object' || value === null) return false

  return Object.keys(initialContactDetails).every(
    (field) => typeof (value as Record<string, unknown>)[field] === 'string',
  )
}

function isDesiredTimeline(value: unknown): value is DesiredTimeline {
  return value === 'flexible' || value === 'normal' || value === 'express'
}

function isWebProjectType(value: unknown): value is WebProjectType {
  return Object.hasOwn(webProjects, value as WebProjectType)
}

function isWebFeature(value: unknown): value is WebFeature {
  return Object.hasOwn(webFeatures, value as WebFeature)
}

function isWebSelections(value: unknown): value is WebSelections {
  if (typeof value !== 'object' || value === null) return false

  const selections = value as Record<string, unknown>
  return (
    Array.isArray(selections.features) &&
    selections.features.every(isWebFeature) &&
    typeof selections.pages === 'number' &&
    Number.isInteger(selections.pages) &&
    selections.pages >= 1 &&
    selections.pages <= 40 &&
    isWebProjectType(selections.type)
  )
}

function isPrintSelections(value: unknown): value is PrintSelections {
  if (typeof value !== 'object' || value === null) return false

  const selections = value as Record<string, unknown>
  return Object.keys(printSupports).every(
    (support) =>
      typeof selections[support] === 'number' &&
      Number.isInteger(selections[support]) &&
      selections[support] >= 0 &&
      selections[support] <= 20,
  )
}

function isQuoteRequestDraft(value: unknown): value is QuoteRequestDraft {
  if (typeof value !== 'object' || value === null) return false

  const draft = value as Record<string, unknown>
  const isStep = [
    'intro',
    'domains',
    'branding',
    'web',
    'print',
    'timeline',
    'summary',
    'contact',
  ].includes(draft.step as string)

  return (
    typeof draft.brandingSelected === 'boolean' &&
    isContactDetails(draft.contactDetails) &&
    (draft.formula === null || isBrandingFormula(draft.formula)) &&
    isStep &&
    (draft.timeline === null || isDesiredTimeline(draft.timeline)) &&
    typeof draft.webSelected === 'boolean' &&
    (draft.webSelections === null || isWebSelections(draft.webSelections)) &&
    (draft.printSelected === undefined ||
      typeof draft.printSelected === 'boolean') &&
    (draft.printSelections === undefined || isPrintSelections(draft.printSelections))
  )
}

function removeQuoteRequestDraft() {
  try {
    window.localStorage.removeItem(quoteRequestDraftStorageKey)
  } catch {
    // Le parcours doit rester utilisable si le navigateur bloque localStorage.
  }
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
        'relative flex min-h-[13.8125rem] flex-col items-center justify-center gap-[1.1875rem] rounded-[1.125rem] border border-[#cfcfcf] bg-white px-5 py-[1.3125rem] text-center sm:px-[4.1875rem]',
        'has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-3',
        disabled ? 'cursor-not-allowed' : 'cursor-pointer',
      )}
    >
      <input
        checked={checked}
        className="sr-only"
        disabled={disabled}
        onChange={(event) => onChange?.(event.target.checked)}
        type="checkbox"
      />
      <span className="flex h-[2.4rem] items-center justify-center">
        {icon}
      </span>
      <span>
        <span className="block font-heading text-[1.1875rem] leading-normal font-bold">
          {label}
        </span>
        <span className="mt-1 block text-[0.84375rem] leading-[1.45]">
          {description}
        </span>
      </span>
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

export function QuoteRequestFlow() {
  const [step, setStep] = useState<Step>('intro')
  const [brandingSelected, setBrandingSelected] = useState(false)
  const [formula, setFormula] = useState<BrandingFormula | null>(null)
  const [webSelected, setWebSelected] = useState(false)
  const [webSelections, setWebSelections] = useState<WebSelections | null>(null)
  const [printSelected, setPrintSelected] = useState(false)
  const [printSelections, setPrintSelections] = useState<PrintSelections>(
    createPrintSelections,
  )
  const [timeline, setTimeline] = useState<DesiredTimeline | null>(null)
  const [contactDetails, setContactDetails] = useState<ContactDetails>(
    initialContactDetails,
  )
  const [contactErrors, setContactErrors] = useState<
    Partial<Record<ContactField, string>>
  >({})
  const [submissionStatus, setSubmissionStatus] =
    useState<SubmissionStatus>('idle')
  const [submissionError, setSubmissionError] = useState('')
  const [isDraftRestored, setIsDraftRestored] = useState(false)
  const stepHeadingRef = useRef<HTMLHeadingElement>(null)
  const previousStepRef = useRef<Step>('intro')

  const estimate = calculateQuoteEstimate({
    brandingFormula: brandingSelected ? formula : null,
    print: printSelected ? printSelections : null,
    timeline: timeline ?? 'normal',
    web: webSelected ? webSelections : null,
  })
  const workflowSteps: Step[] = [
    'domains',
    ...(brandingSelected ? (['branding'] as const) : []),
    ...(webSelected ? (['web'] as const) : []),
    ...(printSelected ? (['print'] as const) : []),
    'timeline',
    'summary',
    'contact',
  ]
  const workflowStepIndex = workflowSteps.indexOf(step)
  const isBranding = step === 'branding'
  const isContact = step === 'contact'
  const isDomains = step === 'domains'
  const isIntro = step === 'intro'
  const isSummary = step === 'summary'
  const isTimeline = step === 'timeline'
  const isWeb = step === 'web'
  const isPrint = step === 'print'
  const showCounter = workflowStepIndex >= 0
  const showLiveEstimate =
    estimate.lowCents > 0 && step !== 'intro' && step !== 'summary'

  useEffect(() => {
    try {
      const savedDraft = window.localStorage.getItem(
        quoteRequestDraftStorageKey,
      )
      if (!savedDraft) return

      const parsedDraft: unknown = JSON.parse(savedDraft)
      if (!isQuoteRequestDraft(parsedDraft)) {
        removeQuoteRequestDraft()
        return
      }

      setBrandingSelected(parsedDraft.brandingSelected)
      setContactDetails(parsedDraft.contactDetails)
      setFormula(parsedDraft.formula)
      setStep(parsedDraft.step)
      setTimeline(parsedDraft.timeline)
      setWebSelected(parsedDraft.webSelected)
      setWebSelections(parsedDraft.webSelections)
      setPrintSelected(parsedDraft.printSelected ?? false)
      setPrintSelections(parsedDraft.printSelections ?? createPrintSelections())
    } catch {
      removeQuoteRequestDraft()
    } finally {
      setIsDraftRestored(true)
    }
  }, [])

  useEffect(() => {
    if (!isDraftRestored || submissionStatus === 'sent') return

    const hasDraft =
      step !== 'intro' ||
      brandingSelected ||
      formula !== null ||
      webSelected ||
      webSelections !== null ||
      printSelected ||
      Object.values(printSelections).some(Boolean) ||
      timeline !== null ||
      Object.values(contactDetails).some(Boolean)

    if (!hasDraft) {
      removeQuoteRequestDraft()
      return
    }

    const draft: QuoteRequestDraft = {
      brandingSelected,
      contactDetails,
      formula,
      step,
      timeline,
      webSelected,
      webSelections,
      printSelected,
      printSelections,
    }

    try {
      window.localStorage.setItem(
        quoteRequestDraftStorageKey,
        JSON.stringify(draft),
      )
    } catch {
      // Le parcours doit rester utilisable si le navigateur bloque localStorage.
    }
  }, [
    brandingSelected,
    contactDetails,
    formula,
    isDraftRestored,
    step,
    submissionStatus,
    timeline,
    webSelected,
    webSelections,
    printSelected,
    printSelections,
  ])

  useEffect(() => {
    if (submissionStatus === 'sent') removeQuoteRequestDraft()
  }, [submissionStatus])

  useEffect(() => {
    if (previousStepRef.current !== step) {
      stepHeadingRef.current?.focus({ preventScroll: true })
      previousStepRef.current = step
    }
  }, [step])

  useEffect(() => {
    if (submissionStatus === 'sent') {
      stepHeadingRef.current?.focus({ preventScroll: true })
    }
  }, [submissionStatus])

  const moveToStep = (nextStep: Step) => {
    setStep(nextStep)
    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' })
  }

  const canContinue =
    step === 'domains'
      ? brandingSelected || webSelected || printSelected
      : step === 'branding'
        ? formula !== null
        : step === 'web'
          ? webSelections !== null
          : step === 'print'
            ? Object.values(printSelections).some((quantity) => quantity > 0)
          : step === 'timeline'
            ? timeline !== null
            : true

  const next = () => {
    if (!canContinue) return

    const sequence: Step[] = ['intro', ...workflowSteps]
    const target = sequence[sequence.indexOf(step) + 1]
    if (target) moveToStep(target)
  }

  const previous = () => {
    const sequence: Step[] = ['intro', ...workflowSteps]
    const target = sequence[sequence.indexOf(step) - 1]
    if (target) moveToStep(target)
  }

  const updateContactDetails = (field: ContactField, value: string) => {
    setContactDetails((current) => ({ ...current, [field]: value }))
    setContactErrors((current) => ({ ...current, [field]: undefined }))
    setSubmissionStatus('idle')
    setSubmissionError('')
  }

  const updateWebSelection = <Key extends keyof WebSelections>(
    key: Key,
    value: WebSelections[Key],
  ) => {
    setWebSelections((current) => ({
      ...(current ?? initialWebSelections),
      [key]: value,
    }))
  }

  const selectWebProject = (type: WebProjectType) => {
    const project = webProjects[type]
    setWebSelections((current) => ({
      ...(current ?? initialWebSelections),
      pages: project.includedPages,
      type,
    }))
  }

  const toggleWebFeature = (feature: WebFeature) => {
    setWebSelections((current) => {
      const selections = current ?? initialWebSelections
      const isSelected = selections.features.includes(feature)

      return {
        ...selections,
        features: isSelected
          ? selections.features.filter((value) => value !== feature)
          : [...selections.features, feature],
      }
    })
  }

  const updatePrintQuantity = (support: PrintSupport, quantity: number) => {
    setPrintSelections((current) => ({
      ...current,
      [support]: Math.max(0, Math.min(20, quantity)),
    }))
  }

  const validateContactDetails = () => {
    const errors: Partial<Record<ContactField, string>> = {}

    if (!contactDetails.fullName.trim()) {
      errors.fullName = 'Indiquez votre nom.'
    }
    if (!/^\S+@\S+\.\S+$/.test(contactDetails.email.trim())) {
      errors.email = 'Indiquez un e-mail valide.'
    }
    if (!contactDetails.projectDescription.trim()) {
      errors.projectDescription = 'Décrivez votre projet en quelques mots.'
    }
    if (contactDetails.websiteUrl.trim()) {
      try {
        const websiteUrl = new URL(contactDetails.websiteUrl)
        if (!['http:', 'https:'].includes(websiteUrl.protocol)) {
          errors.websiteUrl =
            'Indiquez une adresse commençant par http:// ou https://.'
        }
      } catch {
        errors.websiteUrl = 'Indiquez une adresse web valide.'
      }
    }

    setContactErrors(errors)
    const firstInvalidField = Object.keys(errors)[0]
    if (firstInvalidField) {
      requestAnimationFrame(() => {
        document
          .querySelector<HTMLElement>(`[name="${firstInvalidField}"]`)
          ?.focus()
      })
      return false
    }

    return true
  }

  const submitQuoteRequest = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (
      submissionStatus === 'submitting' ||
      !timeline ||
      (!brandingSelected && !webSelected && !printSelected)
    ) {
      return
    }
    if (!validateContactDetails()) return

    setSubmissionStatus('submitting')
    setSubmissionError('')

    try {
      await axios.post('/demandes-de-devis', {
        ...contactDetails,
        desiredTimeline: timeline,
        estimate: {
          highCents: estimate.highCents,
          lines: getEstimateSnapshotLines(estimate),
          lowCents: estimate.lowCents,
        },
        selections: {
          ...(brandingSelected && formula ? { branding: { formula } } : {}),
          ...(webSelected && webSelections ? { web: webSelections } : {}),
          ...(printSelected ? { print: printSelections } : {}),
        },
      })
      setSubmissionStatus('sent')
      window.scrollTo({ top: 0, behavior: 'auto' })
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 422) {
        const validationErrors = error.response.data?.errors
        if (Array.isArray(validationErrors)) {
          const errors = Object.fromEntries(
            validationErrors.map(
              (validationError: { field: ContactField; message: string }) => [
                validationError.field,
                validationError.message,
              ],
            ),
          )
          setContactErrors(errors)
          const firstInvalidField = validationErrors[0]?.field
          if (typeof firstInvalidField === 'string') {
            requestAnimationFrame(() => {
              document
                .querySelector<HTMLElement>(`[name="${firstInvalidField}"]`)
                ?.focus()
            })
          }
        }
        setSubmissionStatus('idle')
        return
      }

      const message = axios.isAxiosError(error)
        ? error.response?.data?.message
        : null
      setSubmissionError(
        typeof message === 'string'
          ? message
          : "Votre demande n'a pas pu être envoyée. Vérifiez votre connexion et réessayez.",
      )
      setSubmissionStatus('failed')
    }
  }

  const resetFlow = () => {
    removeQuoteRequestDraft()
    setStep('intro')
    setBrandingSelected(false)
    setFormula(null)
    setWebSelected(false)
    setWebSelections(null)
    setPrintSelected(false)
    setPrintSelections(createPrintSelections())
    setTimeline(null)
    setContactDetails(initialContactDetails)
    setContactErrors({})
    setSubmissionStatus('idle')
    setSubmissionError('')
    window.scrollTo({ top: 0, behavior: 'auto' })
  }

  if (submissionStatus === 'sent') {
    const firstName = contactDetails.fullName.trim().split(/\s+/)[0]

    return (
      <div className="min-h-dvh bg-[#f0f4ff] text-[#1f2a28]">
        <header className="border-b-[3px] border-[#f0606f]">
          <div className="mx-auto max-w-[47.5rem] px-4 py-5 sm:px-6">
            <span className="font-heading text-[1.375rem] font-bold tracking-[-0.01em]">
              Pauline Noël
            </span>
          </div>
        </header>
        <section
          aria-labelledby="confirmation-heading"
          className="mx-auto flex max-w-[47.5rem] flex-col items-center px-4 pt-16 text-center sm:px-6 sm:pt-20"
        >
          <span
            aria-hidden="true"
            className="flex size-[4.625rem] items-center justify-center rounded-full bg-[#f0606f] text-[2.25rem] text-white"
          >
            ✓
          </span>
          <h1
            className="mt-7 font-heading text-[2rem] font-bold tracking-[-0.03em]"
            id="confirmation-heading"
            ref={stepHeadingRef}
            tabIndex={-1}
          >
            C’est noté !
          </h1>
          <p className="mt-3 max-w-[38ch] text-lg leading-normal text-[#5f6561]">
            Merci {firstName}. J’ai bien reçu votre demande, je reviens vers
            vous sous 48h avec un devis personnalisé.
          </p>
          <div className="mt-7 rounded-[1rem] border border-[#1e2324] bg-white px-9 py-5">
            <p className="text-[0.75rem] font-semibold tracking-[0.05em] text-[#7a7e79] uppercase">
              Estimation
            </p>
            <p className="mt-1 font-heading text-[1.875rem] font-bold">
              {formatEuros(estimate.lowCents)}
            </p>
          </div>
          <button
            className="mt-7 min-h-11 font-semibold text-[#f0606f] underline decoration-2 underline-offset-4"
            onClick={resetFlow}
            type="button"
          >
            Faire une nouvelle estimation
          </button>
        </section>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-[#f0f4ff] text-[#1f2a28]">
      {isIntro ? (
        <header className="sticky top-0 z-20 border-b border-[#d4e0f5] bg-[#f0f4ff] backdrop-blur-[5px]">
          <div className="mx-auto flex max-w-[67.5rem] flex-col gap-[1.375rem] px-5 pt-[1.375rem] sm:px-8 lg:px-12 xl:px-0">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-[1.125rem]">
                <img
                  alt=""
                  className="h-[1.9375rem] w-[2.006rem]"
                  height="31"
                  src={paulineNoelLogo}
                  width="32"
                />
                <span className="font-heading text-[clamp(1.375rem,2vw,1.6875rem)] font-semibold tracking-[-0.046em]">
                  Pauline Noël
                </span>
              </div>
              <span aria-hidden="true" className="w-16" />
            </div>
            <div aria-hidden="true" className="h-[3px] bg-white">
              <div className="h-full w-2/5 bg-[#f0606f]" />
            </div>
          </div>
        </header>
      ) : isDomains ? (
        <header className="sticky top-0 z-20 border-b border-[#d4e0f5] bg-[#f0f4ff] backdrop-blur-[5px]">
          <div className="mx-auto flex max-w-[67.5rem] flex-col gap-[1.375rem] px-5 pt-[1.375rem] sm:px-8 lg:px-12 xl:px-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-[1.125rem]">
                <img
                  alt=""
                  className="h-[1.9375rem] w-[2.006rem]"
                  height="31"
                  src={paulineNoelLogo}
                  width="32"
                />
                <span className="font-heading text-[clamp(1.375rem,2vw,1.6875rem)] font-bold tracking-[-0.046em]">
                  Pauline Noël
                </span>
              </div>
              <span className="font-meta text-[0.78125rem] font-semibold text-[#1e2324]">
                Étape 1 / {workflowSteps.length}
              </span>
            </div>
            <div aria-hidden="true" className="h-[3px] bg-white">
              <div className="h-full w-2/5 bg-[#f0606f]" />
            </div>
          </div>
        </header>
      ) : isBranding || isWeb || isPrint ? (
        <header className="sticky top-0 z-20 border-b border-[#d4e0f5] bg-[#f0f4ff] backdrop-blur-[5px]">
          <div className="mx-auto flex max-w-[67.5rem] flex-col gap-[1.375rem] px-5 pt-[1.375rem] sm:px-8 lg:px-12 xl:px-0">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-[1.125rem]">
                <img
                  alt=""
                  className="h-[1.9375rem] w-[2.006rem]"
                  height="31"
                  src={paulineNoelLogo}
                  width="32"
                />
                <span className="font-heading text-[clamp(1.375rem,2vw,1.6875rem)] font-bold tracking-[-0.046em]">
                  Pauline Noël
                </span>
              </div>
              <div className="flex items-center gap-[0.9375rem]">
                {showLiveEstimate && (
                  <output
                    aria-live="polite"
                    className="hidden h-[2.6875rem] items-center gap-[0.3125rem] rounded-full bg-[#1e2324] px-[1.875rem] py-[0.875rem] text-[0.9375rem] font-bold whitespace-nowrap text-white sm:flex"
                  >
                    <img
                      alt=""
                      className="size-1.5"
                      height="6"
                      src={estimationDot}
                      width="6"
                    />
                    Estimation&nbsp;: {formatEuros(estimate.lowCents)}
                  </output>
                )}
                <span className="font-meta text-[0.78125rem] font-semibold whitespace-nowrap text-[#1e2324]">
                  Étape {workflowStepIndex + 1} / {workflowSteps.length}
                </span>
              </div>
            </div>
            <div aria-hidden="true" className="h-[3px] bg-white">
              <div className="h-full w-2/5 bg-[#f0606f]" />
            </div>
          </div>
        </header>
      ) : isTimeline ? (
        <header className="sticky top-0 z-20 border-b border-[#d4e0f5] bg-[#f0f4ff] backdrop-blur-[5px]">
          <div className="mx-auto flex max-w-[67.5rem] flex-col gap-[1.375rem] px-5 pt-[1.375rem] sm:px-8 lg:px-12 xl:px-0">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-[1.125rem]">
                <img
                  alt=""
                  className="h-[1.9375rem] w-[2.006rem]"
                  height="31"
                  src={paulineNoelLogo}
                  width="32"
                />
                <span className="font-heading text-[clamp(1.375rem,2vw,1.6875rem)] font-bold tracking-[-0.046em]">
                  Pauline Noël
                </span>
              </div>
              <div className="flex items-center gap-[0.9375rem]">
                <output
                  aria-live="polite"
                  className="hidden h-[2.6875rem] items-center gap-[0.3125rem] rounded-full bg-[#1e2324] px-[1.875rem] py-[0.875rem] text-[0.9375rem] font-bold whitespace-nowrap text-white sm:flex"
                >
                  <img
                    alt=""
                    className="size-1.5"
                    height="6"
                    src={estimationDot}
                    width="6"
                  />
                  Estimation&nbsp;: {formatEuros(estimate.lowCents)}
                </output>
                <span className="font-meta text-[0.78125rem] font-semibold whitespace-nowrap text-[#1e2324]">
                  Étape {workflowStepIndex + 1} / {workflowSteps.length}
                </span>
              </div>
            </div>
            <div aria-hidden="true" className="h-[3px] bg-white">
              <div className="h-full w-2/5 bg-[#f0606f]" />
            </div>
          </div>
        </header>
      ) : isSummary ? (
        <header className="sticky top-0 z-20 border-b border-[#d4e0f5] bg-[#f0f4ff] backdrop-blur-[5px]">
          <div className="mx-auto flex max-w-[67.5rem] flex-col gap-[1.375rem] px-5 pt-[1.375rem] sm:px-8 lg:px-12 xl:px-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-[1.125rem]">
                <img
                  alt=""
                  className="h-[1.9375rem] w-[2.006rem]"
                  height="31"
                  src={paulineNoelLogo}
                  width="32"
                />
                <span className="font-heading text-[clamp(1.375rem,2vw,1.6875rem)] font-bold tracking-[-0.046em]">
                  Pauline Noël
                </span>
              </div>
              <span className="font-meta text-[0.78125rem] font-semibold text-[#1e2324]">
                Estimation
              </span>
            </div>
            <div aria-hidden="true" className="h-[3px] bg-white">
              <div className="h-full w-2/5 bg-[#f0606f]" />
            </div>
          </div>
        </header>
      ) : isContact ? (
        <header className="sticky top-0 z-20 border-b border-[#d4e0f5] bg-[#f0f4ff] backdrop-blur-[5px]">
          <div className="mx-auto flex max-w-[67.5rem] flex-col gap-[1.375rem] px-5 pt-[1.375rem] sm:px-8 lg:px-12 xl:px-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-[1.125rem]">
                <img
                  alt=""
                  className="h-[1.9375rem] w-[2.006rem]"
                  height="31"
                  src={paulineNoelLogo}
                  width="32"
                />
                <span className="font-heading text-[clamp(1.375rem,2vw,1.6875rem)] font-bold tracking-[-0.046em]">
                  Pauline Noël
                </span>
              </div>
              <span className="font-meta text-[0.78125rem] font-semibold text-[#1e2324]">
                Vos coordonnées
              </span>
            </div>
            <div aria-hidden="true" className="h-[3px] bg-white">
              <div className="h-full w-2/5 bg-[#f0606f]" />
            </div>
          </div>
        </header>
      ) : (
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
                width: `${((workflowStepIndex + 1) / workflowSteps.length) * 100}%`,
              }}
            />
          </div>
        </header>
      )}

      <div
        className={cn(
          'mx-auto w-full',
          isIntro
            ? 'flex min-h-[calc(100dvh-8.3125rem)] max-w-[67.5rem] items-center px-5 pt-10 pb-32 sm:px-8 lg:px-12 xl:px-0'
            : isDomains ||
                isBranding ||
                isWeb ||
                isPrint ||
                isTimeline ||
                isSummary ||
                isContact
              ? 'max-w-[67.5rem] px-5 pt-10 pb-[8.5rem] sm:px-8 lg:px-12 xl:px-0'
              : 'max-w-[47.5rem] px-4 pt-10 pb-36 sm:px-6',
        )}
      >
        {step === 'intro' && (
          <section
            aria-labelledby="intro-heading"
            className="mx-auto flex w-full max-w-[48.375rem] flex-col items-center pt-[0.1875rem] text-center"
          >
            <p className="text-xs font-semibold tracking-[0.043em] text-[#ff6373] uppercase">
              Estimation de projet
            </p>
            <h1
              className="mt-[1.0625rem] font-heading text-[clamp(2.625rem,5.2vw,3.875rem)] leading-[0.984] font-bold tracking-[-0.047em]"
              id="intro-heading"
              ref={stepHeadingRef}
              tabIndex={-1}
            >
              Donnons un{' '}
              <span className="relative isolate inline-block px-[0.1em] text-white">
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 top-[0.035em] -z-10 h-[1.01em] rounded-[2px] bg-[#1e2324]"
                />
                valeur
              </span>
              <br />à votre idée.
            </h1>
            <p className="mt-6 max-w-[48.375rem] text-base leading-6">
              En 2 minutes, répondez à quelques questions sur votre projet{' '}
              <br className="hidden sm:block" />
              et obtenez une fourchette de prix détaillée, au plus juste.{' '}
              <br className="hidden sm:block" />
              Sans engagement.
            </p>
            <ul className="mt-6 flex flex-wrap items-center justify-center gap-[0.4375rem]">
              {introBenefits.map((benefit) => (
                <li
                  className="rounded-full border border-[#c7c7c7] bg-white px-2.5 py-1 text-center text-xs leading-[1.1875rem] font-bold tracking-[0.03em] text-[#ff5b6c]"
                  key={benefit}
                >
                  ✓ {benefit}
                </li>
              ))}
            </ul>
          </section>
        )}

        {step === 'domains' && (
          <section
            aria-labelledby="domains-heading"
            className="mx-auto w-full max-w-[48.375rem] pt-[0.1875rem] text-center"
          >
            <div>
              <h1
                className="font-heading text-[2.375rem] leading-normal font-bold tracking-[-0.02em]"
                id="domains-heading"
                ref={stepHeadingRef}
                tabIndex={-1}
              >
                De quoi avez-vous besoin ?
              </h1>
              <p className="mt-0.5 text-base leading-6" id="domains-help">
                Choisissez un ou plusieurs pôles. On ne vous posera que les
                questions utiles.
              </p>
            </div>
            <fieldset
              aria-describedby="domains-help"
              className="mt-[1.3125rem] grid grid-cols-1 gap-[0.8125rem] sm:grid-cols-2"
            >
              <legend className="sr-only">Pôles de prestations</legend>
              <DomainCard
                checked={brandingSelected}
                description="Création de logo, refonte de logo, charte graphique"
                icon={
                  <img
                    alt=""
                    className="h-[2.383375rem] w-[2.96875rem]"
                    height="38"
                    src={brandingDomainIcon}
                    width="48"
                  />
                }
                label="Identité & branding"
                onChange={(checked) => {
                  setBrandingSelected(checked)
                  if (!checked) setFormula(null)
                }}
              />
              <DomainCard
                checked={webSelected}
                description="site vitrine, site e-commerce, landing, refonte de l’existant"
                icon={
                  <img
                    alt=""
                    className="h-[2.39375rem] w-[2.630875rem]"
                    height="38"
                    src={webDomainIcon}
                    width="42"
                  />
                }
                label="Site internet · design UX/UI"
                onChange={(checked) => {
                  setWebSelected(checked)
                  setWebSelections(null)
                }}
              />
              <DomainCard
                checked={printSelected}
                description="Flyer, affiche, dépliant, carte de visite, plaquette commerciale, covering…"
                icon={
                  <img
                    alt=""
                    className="h-[2.383125rem] w-[2.586125rem]"
                    height="38"
                    src={printDomainIcon}
                    width="41"
                  />
                }
                label="Supports de com. imprimés"
                onChange={(checked) => {
                  setPrintSelected(checked)
                  if (!checked) setPrintSelections(createPrintSelections())
                }}
              />
              <DomainCard
                description="Newsletter, posts réseaux sociaux, signature, slides pptx"
                disabled
                icon={
                  <img
                    alt=""
                    className="h-[2.375rem] w-[2.6011875rem]"
                    height="38"
                    src={digitalDomainIcon}
                    width="42"
                  />
                }
                label="Supports de com. digitaux"
              />
            </fieldset>
          </section>
        )}

        {step === 'branding' && (
          <section
            aria-labelledby="branding-heading"
            className="mx-auto w-full max-w-[67.5rem] pt-[0.1875rem]"
          >
            <div>
              <p className="text-xs font-semibold tracking-[0.043em] text-[#f0606f] uppercase">
                Identité & branding
              </p>
              <h1
                className="mt-0.5 font-heading text-[2.375rem] leading-normal font-bold tracking-[-0.02em]"
                id="branding-heading"
                ref={stepHeadingRef}
                tabIndex={-1}
              >
                Quelle formule ?
              </h1>
            </div>
            <fieldset className="mt-8 flex flex-col gap-[0.8125rem]">
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
                    'relative cursor-pointer rounded-[1.125rem] border border-[#c7c7c7] bg-white px-[1.4375rem] py-[1.3125rem]',
                    'has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-3',
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
                        <span className="font-heading text-[1.1875rem] leading-normal font-bold">
                          {definition.label}
                        </span>
                        {'popular' in definition && definition.popular && (
                          <span className="rounded-full bg-[#1f2a28] px-2 py-[0.1875rem] font-meta text-[0.6875rem] font-bold text-white">
                            POPULAIRE
                          </span>
                        )}
                        <span className="font-meta text-xs text-[#a0a3a3]">
                          {definition.duration}
                        </span>
                      </span>
                      <span className="mt-[0.17375rem] block text-[0.84375rem] leading-[1.45] text-[#1f2a28]">
                        {definition.description}
                      </span>
                    </span>
                    <span className="shrink-0 font-meta text-[0.9375rem] font-bold text-[#f0606f]">
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

            <p className="mt-3 text-right text-sm text-[#1f2a28]/70">
              Cession des droits incluses. Base&nbsp;: 450&nbsp;€ / jour.
            </p>

            <aside className="mt-7 rounded-[1.25rem] bg-[#1f2a28] px-5 py-7 text-white sm:px-[2.8125rem] sm:py-[2.75rem]">
              <p className="inline-block rounded-full bg-[#ff929d] px-2.5 py-0 font-body text-xs leading-[1.1875rem] font-bold tracking-[0.03em] text-[#1f2a28]">
                Inclus dans chaque formule
              </p>
              <ul className="mt-[1.1875rem] grid grid-flow-col grid-rows-3 gap-x-6 gap-y-1 text-[0.90625rem] text-[#a0a3a3]">
                {[
                  'Brief créatif',
                  'Étude des cibles/personas,',
                  'Moodboards',
                  'Plusieurs pistes de logo',
                  'Charte graphique',
                  'Valise graphique (exports des éléments)',
                ].map((item) => (
                  <li className="ms-5 list-disc" key={item}>
                    {item}
                  </li>
                ))}
              </ul>
              <h2 className="mt-[1.6875rem] font-heading text-[1.1875rem] leading-normal font-bold">
                Ce que contient votre charte graphique :
              </h2>
              <ol className="mt-[0.875rem] grid grid-cols-1 gap-x-[1.375rem] gap-y-[0.875rem] sm:grid-cols-2 sm:grid-rows-[repeat(4,2.28125rem)]">
                {graphicCharterContents.map(([label, description], index) => (
                  <li
                    className="flex h-[2.28125rem] items-start gap-3"
                    key={label}
                  >
                    <span className="w-[1.375rem] shrink-0 font-meta text-xs font-bold text-[#f0606f]">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span>
                      <span className="block font-meta text-[0.90625rem] font-semibold">
                        {label}
                      </span>
                      <span className="mt-px block font-meta text-[0.78125rem] leading-[1.4] text-[#a0a3a3]">
                        {description}
                      </span>
                    </span>
                  </li>
                ))}
              </ol>
            </aside>
          </section>
        )}

        {step === 'web' && (
          <section
            aria-labelledby="web-heading"
            className="mx-auto w-full max-w-[67.5rem] pt-[0.1875rem]"
          >
            <div>
              <p className="text-xs font-semibold tracking-[0.043em] text-[#f0606f] uppercase">
                Site internet · design UX/UI
              </p>
              <h1
                className="mt-0.5 font-heading text-[2.375rem] leading-normal font-bold tracking-[-0.02em]"
                id="web-heading"
                ref={stepHeadingRef}
                tabIndex={-1}
              >
                Quel type de projet ?
              </h1>
            </div>

            <fieldset className="mt-8 flex flex-col gap-[0.8125rem]">
              <legend className="sr-only">Type de projet web</legend>
              {(
                Object.entries(webProjects) as Array<
                  [WebProjectType, (typeof webProjects)[WebProjectType]]
                >
              ).map(([type, project]) => (
                <label
                  className={cn(
                    'relative cursor-pointer rounded-[1.125rem] border border-[#c7c7c7] bg-white px-[1.4375rem] py-[1.3125rem]',
                    'has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-3',
                  )}
                  key={type}
                >
                  <input
                    checked={webSelections?.type === type}
                    className="sr-only"
                    name="web-project-type"
                    onChange={() => selectWebProject(type)}
                    type="radio"
                    value={type}
                  />
                  <span className="flex items-start gap-4">
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="font-heading text-[1.1875rem] leading-normal font-bold">
                          {project.label}
                        </span>
                        <span className="font-meta text-xs text-[#a0a3a3]">
                          {project.designDays.toLocaleString('fr-FR')} jours
                          UX/UI •{' '}
                          {project.developmentDays.toLocaleString('fr-FR')}{' '}
                          jours développement
                        </span>
                      </span>
                      <span className="mt-[0.17375rem] block text-[0.84375rem] leading-[1.45] text-[#1f2a28]">
                        {project.description}
                      </span>
                    </span>
                    <span className="shrink-0 font-meta text-[0.9375rem] font-bold text-[#f0606f]">
                      dès {formatEuros(project.priceCents)}
                    </span>
                  </span>
                  {webSelections?.type === type && (
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute -inset-0.5 rounded-[1.125rem] border-[2.5px] border-[#f0606f]"
                    />
                  )}
                </label>
              ))}
            </fieldset>

            <p className="mt-3 text-right text-sm text-[#1f2a28]/70">
              Base&nbsp;: 450&nbsp;€ / jour.
            </p>

            {webSelections && (
              <div className="mt-6 border-t border-dotted border-[#1e2324] pt-[1.375rem]">
                {webProjects[webSelections.type].pagesRelevant && (
                  <div className="flex items-center gap-4 rounded-[1.125rem] bg-white px-[1.375rem] py-[1.3125rem]">
                    <div className="min-w-0 flex-1">
                      <h2 className="font-heading text-[1.1875rem] font-bold">
                        Nombre de pages
                      </h2>
                      <p className="mt-0.5 font-meta text-[0.84375rem]">
                        + 450€ la page supplémentaire
                      </p>
                    </div>
                    <div className="flex items-center gap-[0.6875rem] rounded-full border border-[#c7c7c7] bg-white px-2.5 py-[0.4375rem]">
                      <button
                        aria-label="Retirer une page"
                        className="flex size-[1.5835rem] items-center justify-center rounded-full bg-[#f2f0ea] text-[1.0625rem]"
                        disabled={webSelections.pages <= 1}
                        onClick={() =>
                          updateWebSelection('pages', webSelections.pages - 1)
                        }
                        type="button"
                      >
                        −
                      </button>
                      <output className="min-w-6 text-center font-body text-[0.9375rem] font-semibold">
                        {webSelections.pages}
                      </output>
                      <button
                        aria-label="Ajouter une page"
                        className="flex size-[1.5835rem] items-center justify-center rounded-full bg-[#1f2a28] text-[1.0625rem] text-white"
                        disabled={webSelections.pages >= 40}
                        onClick={() =>
                          updateWebSelection('pages', webSelections.pages + 1)
                        }
                        type="button"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}

                <div className="mt-[0.8125rem] rounded-[1.125rem] bg-white px-[1.375rem] py-[1.3125rem]">
                  <h2 className="font-heading text-[1.1875rem] font-bold">
                    Fonctionnalités envisagées
                  </h2>
                  <p className="mt-1 font-meta text-[0.84375rem] leading-[1.45]">
                    Les fonctionnalités sont chiffrées sur-mesure avec mon
                    développeur lors du devis officiel.
                  </p>
                  <div className="mt-[0.8125rem] flex flex-wrap gap-2">
                    {webFeatureEntries.map(([feature, label]) => {
                      const selected = webSelections.features.includes(feature)
                      return (
                        <button
                          aria-pressed={selected}
                          className={cn(
                            'rounded-full border border-[#c7c7c7] bg-white px-[0.8125rem] py-[0.4375rem] font-body text-[0.9375rem] font-semibold',
                            selected && 'border-[#f0606f] bg-[#ffdcdf]',
                          )}
                          key={feature}
                          onClick={() => toggleWebFeature(feature)}
                          type="button"
                        >
                          {selected && <span aria-hidden="true">• </span>}
                          {label}
                        </button>
                      )
                    })}
                  </div>
                </div>
                <div className="mt-[0.8125rem] rounded-[1.125rem] bg-white px-[1.375rem] py-[1.3125rem]">
                  <h2 className="font-heading text-[1.1875rem] font-bold">
                    Option
                  </h2>
                  <p className="mt-0.5 font-meta text-[0.84375rem]">
                    Maintenance
                  </p>
                </div>
              </div>
            )}
          </section>
        )}

        {step === 'print' && (
          <section
            aria-labelledby="print-heading"
            className="mx-auto w-full max-w-[67.5rem] pt-[0.1875rem]"
          >
            <div>
              <p className="text-xs font-semibold tracking-[0.043em] text-[#f0606f] uppercase">
                Supports de com. imprimés
              </p>
              <h1
                className="mt-0.5 font-heading text-[2.375rem] leading-normal font-bold tracking-[-0.02em]"
                id="print-heading"
                ref={stepHeadingRef}
                tabIndex={-1}
              >
                Quels supports imprimés ?
              </h1>
              <p className="mt-[0.875rem] text-base leading-6">
                Ajustez les quantités souhaitées.
              </p>
            </div>

            <ul className="mt-8 flex flex-col gap-[0.8125rem]">
              {printSupportEntries.map(([support, definition]) => {
                const quantity = printSelections[support]
                return (
                  <li
                    className={cn(
                      'flex items-center gap-4 rounded-[1.125rem] border border-[#c7c7c7] bg-white px-[1.4375rem] py-[1.3125rem]',
                      quantity > 0 && 'border-[#f0606f]',
                    )}
                    key={support}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-heading text-[1.1875rem] leading-normal font-bold">
                          {definition.label}
                        </h2>
                        <span className="font-meta text-xs text-[#a0a3a3]">
                          {definition.duration}
                        </span>
                      </div>
                      {support === 'brochure' && (
                        <p className="mt-0.5 font-meta text-xs text-[#a0a3a3]">
                          option page en plus : 225 € · 0,5 jour
                        </p>
                      )}
                    </div>
                    <p className="shrink-0 font-meta text-[0.9375rem] font-bold text-[#f0606f]">
                      {formatEuros(definition.priceCents)}
                    </p>
                    <div className="flex shrink-0 items-center gap-[0.6875rem] rounded-full bg-[#e9edf6] px-[0.5625rem] py-[0.375rem]">
                      <button
                        aria-label={`Retirer un exemplaire de ${definition.label}`}
                        className="flex size-[1.5835rem] items-center justify-center rounded-full bg-white text-[1.0625rem] text-[#1f2a28] disabled:opacity-40"
                        disabled={quantity === 0}
                        onClick={() => updatePrintQuantity(support, quantity - 1)}
                        type="button"
                      >
                        −
                      </button>
                      <output className="min-w-6 text-center font-body text-[0.9375rem] font-semibold">
                        {quantity}
                      </output>
                      <button
                        aria-label={`Ajouter un exemplaire de ${definition.label}`}
                        className="flex size-[1.5835rem] items-center justify-center rounded-full bg-[#1f2a28] text-[1.0625rem] text-white disabled:opacity-40"
                        disabled={quantity === 20}
                        onClick={() => updatePrintQuantity(support, quantity + 1)}
                        type="button"
                      >
                        +
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>

            <p className="mt-3 text-right text-sm text-[#1f2a28]/70">
              Base&nbsp;: 450&nbsp;€ / jour.
            </p>
          </section>
        )}

        {step === 'timeline' && (
          <section
            aria-labelledby="timeline-heading"
            className="mx-auto w-full max-w-[67.5rem] pt-[0.1875rem]"
          >
            <div>
              <p className="text-xs font-semibold tracking-[0.043em] text-[#f0606f] uppercase">
                Dernière étape
              </p>
              <h1
                className="mt-0.5 font-heading text-[2.375rem] leading-normal font-bold tracking-[-0.02em]"
                id="timeline-heading"
                ref={stepHeadingRef}
                tabIndex={-1}
              >
                Idéalement pour quand ?
              </h1>
            </div>
            <fieldset className="mt-8 flex flex-col gap-[0.8125rem]">
              <legend className="sr-only">Délai souhaité</legend>
              {timelines.map((option) => (
                <label
                  className="relative cursor-pointer rounded-[1.125rem] border border-[#c7c7c7] bg-white px-[1.4375rem] py-[1.3125rem] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-3"
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
                  <span className="block">
                    <span className="flex flex-wrap items-center gap-[0.5625rem]">
                      <span className="font-heading text-[1.1875rem] leading-normal font-bold">
                        {option.label}
                      </span>
                      {option.emphasis && (
                        <span className="font-meta text-xs font-bold text-[#f0606f]">
                          {option.emphasis}
                        </span>
                      )}
                    </span>
                    {option.description && (
                      <span className="mt-[0.17375rem] block text-[0.84375rem] leading-[1.45] text-[#1f2a28]">
                        {option.description}
                      </span>
                    )}
                  </span>
                  {timeline === option.value && (
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute -inset-0.5 rounded-[1.125rem] border-[2.5px] border-[#f0606f]"
                    />
                  )}
                </label>
              ))}
            </fieldset>
          </section>
        )}

        {step === 'summary' && (
          <section
            aria-labelledby="summary-heading"
            className="mx-auto w-full max-w-[67.5rem] pt-[0.1875rem]"
          >
            <div className="rounded-[1.25rem] bg-[#1f2a28] px-5 py-8 text-white sm:px-[2.8125rem] sm:py-[2.75rem]">
              <p className="text-xs font-semibold tracking-[0.043em] text-[#f0606f] uppercase">
                Votre estimation
              </p>
              <h1
                className="quote-price-pop mt-0.5 font-heading text-[2.375rem] leading-normal font-bold tracking-[-0.02em]"
                id="summary-heading"
                ref={stepHeadingRef}
                tabIndex={-1}
              >
                {formatEuros(estimate.lowCents)}
              </h1>
              <p className="mt-[0.875rem] text-base leading-6">
                Design facturés au tarif (450 € / jour),
                <br />
                Développement facturés au tarif (450 € / TTC jour),
                développement inclus dans chaque estimation de site.
                <br />
                Hors frais externes (impression, hébergement, maintenance,
                banque d’images).
              </p>
            </div>

            <div className="mt-8 overflow-hidden rounded-[1.125rem] border border-[#c7c7c7] bg-white">
              {estimate.lines.map((line) => (
                <div
                  className="flex items-start gap-4 border-b border-[#c7c7c7] px-[1.375rem] pt-5 pb-[1.3125rem]"
                  key={line.label}
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-heading text-[1.1875rem] leading-normal font-bold">
                      {line.label}
                    </p>
                    <p className="mt-[0.17375rem] text-[0.84375rem] leading-[1.45] text-[#1f2a28]">
                      {line.label === 'Formule création'
                        ? 'Création de logo et charte graphique'
                        : line.detail}
                    </p>
                  </div>
                  <p className="shrink-0 font-meta text-[0.9375rem] font-bold text-[#f0606f]">
                    {formatEstimateLine(line)}
                  </p>
                </div>
              ))}
              {estimate.expressSurchargeCents > 0 && (
                <div className="flex items-start gap-4 border-b border-[#c7c7c7] px-[1.375rem] pt-5 pb-[1.3125rem]">
                  <div className="min-w-0 flex-1">
                    <p className="font-heading text-[1.1875rem] leading-normal font-bold">
                      Majoration express (+20 %)
                    </p>
                    <p className="mt-[0.17375rem] text-[0.84375rem] leading-[1.45] text-[#1f2a28]">
                      Priorisation du planning
                    </p>
                  </div>
                  <p className="shrink-0 font-meta text-[0.9375rem] font-bold text-[#f0606f]">
                    {formatEuros(estimate.expressSurchargeCents)}
                  </p>
                </div>
              )}
              <div className="flex items-center justify-between gap-4 bg-[#ffdcdf] px-[1.375rem] pt-5 pb-[1.3125rem]">
                <p className="font-heading text-[1.1875rem] leading-normal font-bold">
                  TOTAL ESTIMÉ
                </p>
                <p className="shrink-0 font-meta text-[0.9375rem] font-bold">
                  {formatEuros(estimate.lowCents)}
                </p>
              </div>
            </div>

            <p className="mt-8 text-base leading-6">
              <span className="block">
                💡 Ce sont des fourchettes de prix indicatives, à peaufiner
                ensemble lors d’un échange.
              </span>
              <span className="block">
                Je m’entoure de partenaires de confiance (développement,
                impression, SEO, rédaction de contenu, vidéaste, photographe…)
                pour vous accompagner sur l’ensemble de votre projet.
              </span>
            </p>
          </section>
        )}

        {step === 'contact' && (
          <section
            aria-labelledby="contact-heading"
            className="mx-auto w-full max-w-[67.5rem] pt-[0.1875rem]"
          >
            <div>
              <p className="text-xs font-semibold tracking-[0.043em] text-[#f0606f] uppercase">
                Dernière étape
              </p>
              <h1
                className="mt-0.5 font-heading text-[2.375rem] leading-normal font-bold tracking-[-0.02em]"
                id="contact-heading"
                ref={stepHeadingRef}
                tabIndex={-1}
              >
                Où vous envoyer le détail ?
              </h1>
              <p className="mt-1 text-base leading-6">
                Je récupère votre demande et reviens vers vous sous 48h avec un
                devis personnalisé.
              </p>
            </div>

            {submissionStatus === 'failed' && (
              <div
                className="mt-6 rounded-[0.875rem] border border-[#f0606f] bg-white px-4 py-3.5 text-[0.9375rem] leading-normal"
                role="alert"
              >
                <p className="font-semibold">L’envoi n’a pas abouti.</p>
                <p className="mt-1 text-[#5f6561]">{submissionError}</p>
              </div>
            )}

            <form
              className="mt-8 grid grid-cols-1 gap-[1.25rem] sm:grid-cols-2"
              id="quote-request-contact-form"
              noValidate
              onSubmit={submitQuoteRequest}
            >
              <TextInput
                autoComplete="name"
                error={contactErrors.fullName}
                label="Nom complet"
                name="fullName"
                onChange={(event) =>
                  updateContactDetails('fullName', event.target.value)
                }
                placeholder="Votre nom"
                required
                value={contactDetails.fullName}
              />
              <TextInput
                autoComplete="email"
                error={contactErrors.email}
                label="E-mail"
                name="email"
                onChange={(event) =>
                  updateContactDetails('email', event.target.value)
                }
                placeholder="votre@email.com"
                required
                type="email"
                value={contactDetails.email}
              />
              <TextInput
                autoComplete="tel"
                error={contactErrors.phone}
                label="Téléphone"
                name="phone"
                onChange={(event) =>
                  updateContactDetails('phone', event.target.value)
                }
                placeholder="06 …"
                type="tel"
                value={contactDetails.phone}
              />
              <TextInput
                autoComplete="organization"
                error={contactErrors.companyName}
                label="Entreprise"
                name="companyName"
                onChange={(event) =>
                  updateContactDetails('companyName', event.target.value)
                }
                placeholder="Optionnel"
                value={contactDetails.companyName}
              />
              <div className="sm:col-span-2">
                <TextInput
                  autoComplete="url"
                  error={contactErrors.websiteUrl}
                  label="Site web actuel (si vous en avez un)"
                  name="websiteUrl"
                  onChange={(event) =>
                    updateContactDetails('websiteUrl', event.target.value)
                  }
                  placeholder="https://…"
                  type="url"
                  value={contactDetails.websiteUrl}
                />
              </div>
              <div className="sm:col-span-2">
                <Textarea
                  error={contactErrors.projectDescription}
                  label="Un mot sur votre projet"
                  name="projectDescription"
                  onChange={(event) =>
                    updateContactDetails(
                      'projectDescription',
                      event.target.value,
                    )
                  }
                  placeholder="Contexte, inspirations, contraintes…"
                  required
                  rows={4}
                  value={contactDetails.projectDescription}
                />
              </div>

              <div className="sm:col-span-2 flex items-center justify-between gap-4 rounded-[1.125rem] border border-[#c7c7c7] bg-white px-[1.375rem] py-[1.3125rem]">
                <p className="text-[0.8125rem] font-semibold text-[#5f6561]">
                  Estimation jointe à votre demande
                </p>
                <p className="shrink-0 font-heading text-lg font-bold">
                  {formatEuros(estimate.lowCents)}
                </p>
              </div>

              <p className="sm:col-span-2 text-[0.8125rem] leading-normal text-[#5f6561]">
                Vos informations sont utilisées uniquement pour traiter votre
                demande et sont conservées trois ans après notre dernier
                contact.{' '}
                <a
                  className="font-semibold text-[#f0606f] underline underline-offset-2"
                  href="/politique-de-confidentialite"
                  rel="noreferrer"
                  target="_blank"
                >
                  Lire la politique de confidentialité
                  <span className="sr-only"> (nouvel onglet)</span>
                </a>
                .
              </p>
            </form>
          </section>
        )}
      </div>

      <footer
        className={cn(
          'fixed inset-x-0 bottom-0 z-20 border-t border-[#d4e0f5] bg-[#f0f4ff]/90 backdrop-blur-[5px]',
          isIntro ||
            isDomains ||
            isBranding ||
            isWeb ||
            isPrint ||
            isTimeline ||
            isSummary ||
            isContact
            ? 'pt-[1.3125rem] pb-[2.1875rem]'
            : '',
        )}
      >
        <div
          className={cn(
            'mx-auto flex items-center gap-3.5',
            isIntro
              ? 'max-w-[67.5rem] justify-end px-5 sm:px-8 lg:px-12 xl:px-0'
              : isDomains ||
                  isBranding ||
                  isWeb ||
                  isPrint ||
                  isTimeline ||
                  isSummary ||
                  isContact
                ? 'max-w-[67.5rem] px-5 sm:px-8 lg:px-12 xl:px-0'
                : 'max-w-[47.5rem] px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6',
          )}
        >
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
          {step !== 'contact' && (
            <Button
              className={cn(
                'px-[1.875rem] active:scale-[0.96] motion-reduce:transform-none',
                (isIntro ||
                  isDomains ||
                  isBranding ||
                  isWeb ||
                  isPrint ||
                  isTimeline ||
                  isSummary ||
                  isContact) &&
                  'min-h-[2.6875rem] px-[1.875rem] py-0 font-body text-[0.9375rem] font-bold',
              )}
              disabled={!canContinue}
              onClick={next}
            >
              {step === 'intro'
                ? 'Commencer'
                : step === 'summary'
                  ? 'Recevoir mon devis détaillé →'
                  : 'Continuer'}
            </Button>
          )}
          {step === 'contact' && (
            <Button
              className="px-[1.875rem] active:scale-[0.96] motion-reduce:transform-none"
              disabled={submissionStatus === 'submitting'}
              form="quote-request-contact-form"
              type="submit"
            >
              {submissionStatus === 'submitting'
                ? 'Envoi en cours…'
                : submissionStatus === 'failed'
                  ? 'Réessayer'
                  : 'Envoyer ma demande'}
            </Button>
          )}
        </div>
      </footer>
    </div>
  )
}
