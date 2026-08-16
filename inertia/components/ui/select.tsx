import { Field } from '@base-ui/react/field'
import { Select as BaseSelect } from '@base-ui/react/select'
import type { ReactNode } from 'react'
import { cn } from '~/utils/cn'

export interface SelectOption {
  disabled?: boolean
  label: ReactNode
  value: string
}

export interface SelectProps {
  className?: string
  defaultValue?: string | null
  disabled?: boolean
  error?: string
  hint?: string
  id?: string
  label: ReactNode
  name?: string
  onValueChange?: (
    value: string | null,
    eventDetails: BaseSelect.Root.ChangeEventDetails,
  ) => void
  options: readonly SelectOption[]
  placeholder?: ReactNode
  required?: boolean
  value?: string | null
}

export function Select({
  className,
  defaultValue,
  disabled,
  error,
  hint,
  id,
  label,
  name,
  onValueChange,
  options,
  placeholder = 'Sélectionner une option',
  required,
  value,
}: SelectProps) {
  return (
    <Field.Root className="grid gap-2" invalid={Boolean(error)} name={name}>
      <BaseSelect.Root
        defaultValue={defaultValue}
        disabled={disabled}
        id={id}
        items={options}
        name={name}
        onValueChange={onValueChange}
        required={required}
        value={value}
      >
        <BaseSelect.Label className="font-meta text-[0.9375rem] leading-[1.3] font-semibold text-ink">
          {label}
          {required ? <span aria-hidden="true"> *</span> : null}
        </BaseSelect.Label>
        <BaseSelect.Trigger
          className={cn(
            'flex min-h-11 w-full items-center justify-between gap-3 rounded-control border border-border bg-surface px-3.5 py-2.5 text-left text-base leading-[1.4] text-ink disabled:cursor-not-allowed disabled:bg-surface-subtle disabled:text-muted',
            'data-invalid:border-danger focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-secondary',
            className,
          )}
        >
          <BaseSelect.Value
            className="data-placeholder:text-muted-light"
            placeholder={placeholder}
          />
          <BaseSelect.Icon className="shrink-0 text-secondary">
            <svg
              aria-hidden="true"
              fill="none"
              height="16"
              viewBox="0 0 16 16"
              width="16"
            >
              <path
                d="m4 6 4 4 4-4"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
              />
            </svg>
          </BaseSelect.Icon>
        </BaseSelect.Trigger>
        <BaseSelect.Portal>
          <BaseSelect.Positioner className="z-50" sideOffset={6}>
            <BaseSelect.Popup className="min-w-(--anchor-width) rounded-control border border-border bg-surface p-1 text-ink shadow-card outline-none motion-safe:transition-[opacity,transform] motion-safe:duration-150 data-ending-style:translate-y-0.5 data-ending-style:opacity-0 data-starting-style:-translate-y-0.5 data-starting-style:opacity-0">
              <BaseSelect.List className="max-h-64 overflow-y-auto py-1">
                {options.map((option) => (
                  <BaseSelect.Item
                    className="flex cursor-default items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm leading-[1.4] outline-none select-none data-highlighted:bg-secondary/10 data-highlighted:text-secondary data-disabled:cursor-not-allowed data-disabled:opacity-50"
                    disabled={option.disabled}
                    key={option.value}
                    value={option.value}
                  >
                    <BaseSelect.ItemText>{option.label}</BaseSelect.ItemText>
                    <BaseSelect.ItemIndicator className="text-secondary">
                      <svg
                        aria-hidden="true"
                        fill="none"
                        height="16"
                        viewBox="0 0 16 16"
                        width="16"
                      >
                        <path
                          d="m3.5 8 2.75 2.75 6.25-6.25"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.75"
                        />
                      </svg>
                    </BaseSelect.ItemIndicator>
                  </BaseSelect.Item>
                ))}
              </BaseSelect.List>
            </BaseSelect.Popup>
          </BaseSelect.Positioner>
        </BaseSelect.Portal>
      </BaseSelect.Root>
      {hint ? (
        <Field.Description className="text-sm leading-[1.45] text-muted">
          {hint}
        </Field.Description>
      ) : null}
      {error ? (
        <Field.Error
          className="text-sm leading-[1.45] font-semibold text-danger"
          match
          role="alert"
        >
          {error}
        </Field.Error>
      ) : null}
    </Field.Root>
  )
}
