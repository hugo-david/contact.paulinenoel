import { Field as BaseField } from '@base-ui/react/field'
import type { ReactNode, TextareaHTMLAttributes } from 'react'
import { Field } from '~/components/ui/field'
import { cn } from '~/utils/cn'

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string
  hint?: string
  label: ReactNode
}

export function Textarea({
  error,
  hint,
  label,
  required,
  ...props
}: TextareaProps) {
  return (
    <Field error={error} hint={hint} label={label} required={required}>
      <BaseField.Control
        render={
          <textarea
            {...props}
            className={cn(
              'min-h-30 w-full cursor-text resize-y rounded-control border border-border bg-surface px-3.5 py-2.5 text-base leading-[1.4] text-ink placeholder:text-muted-light disabled:cursor-not-allowed disabled:bg-surface-subtle disabled:text-muted',
              'data-invalid:border-danger focus-visible:border-focus-ring focus-visible:outline-none',
              props.className,
            )}
            required={required}
          />
        }
      />
    </Field>
  )
}
