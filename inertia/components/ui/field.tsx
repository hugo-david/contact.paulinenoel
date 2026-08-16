import { Field as BaseField } from '@base-ui/react/field'
import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import { cn } from '~/utils/cn'

export interface FieldProps
  extends Omit<
    ComponentPropsWithoutRef<typeof BaseField.Root>,
    'children' | 'className' | 'invalid'
  > {
  className?: string
  children: ReactNode
  error?: string
  hint?: string
  label: ReactNode
  required?: boolean
}

export function Field({
  children,
  className,
  error,
  hint,
  label,
  required = false,
  ...props
}: FieldProps) {
  return (
    <BaseField.Root
      {...props}
      className={cn('grid gap-2', className)}
      invalid={Boolean(error)}
    >
      <BaseField.Label className="font-meta text-[0.9375rem] leading-[1.3] font-semibold text-ink">
        {label}
        {required ? <span aria-hidden="true"> *</span> : null}
      </BaseField.Label>
      {children}
      {hint ? (
        <BaseField.Description className="text-sm leading-[1.45] text-muted">
          {hint}
        </BaseField.Description>
      ) : null}
      {error ? (
        <BaseField.Error
          className="text-sm leading-[1.45] font-semibold text-danger"
          match
          role="alert"
        >
          {error}
        </BaseField.Error>
      ) : null}
    </BaseField.Root>
  )
}
