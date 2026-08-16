import { Input as BaseInput } from '@base-ui/react/input'
import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import { Field } from '~/components/ui/field'
import { cn } from '~/utils/cn'

export interface TextInputProps
  extends ComponentPropsWithoutRef<typeof BaseInput> {
  error?: string
  hint?: string
  label: ReactNode
}

export function TextInput({
  error,
  hint,
  label,
  required,
  ...props
}: TextInputProps) {
  return (
    <Field error={error} hint={hint} label={label} required={required}>
      <BaseInput
        {...props}
        className={cn(
          'min-h-11 w-full rounded-control border border-border bg-surface px-3.5 py-2.5 text-base leading-[1.4] text-ink placeholder:text-muted-light disabled:cursor-not-allowed disabled:bg-surface-subtle disabled:text-muted',
          'data-invalid:border-danger focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-secondary',
          props.className,
        )}
        required={required}
      />
    </Field>
  )
}
