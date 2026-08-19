import { Button as BaseButton } from '@base-ui/react/button'
import type { ComponentPropsWithoutRef } from 'react'
import { cn } from '~/utils/cn'

const variants = {
  primary:
    'bg-primary text-primary-foreground [@media(hover:hover)_and_(pointer:fine)]:hover:bg-primary-hover',
  quiet:
    'bg-transparent text-secondary underline decoration-secondary/60 underline-offset-3',
  secondary:
    'border-border bg-transparent text-ink opacity-50 focus-visible:opacity-100 active:opacity-100 [@media(hover:hover)_and_(pointer:fine)]:hover:opacity-100',
} as const

export interface ButtonProps
  extends ComponentPropsWithoutRef<typeof BaseButton> {
  variant?: keyof typeof variants
}

export function Button({
  className,
  variant = 'primary',
  ...props
}: ButtonProps) {
  return (
    <BaseButton
      className={cn(
        'inline-flex min-h-11 cursor-pointer items-center justify-center rounded-full border border-transparent px-6 py-2.5 font-meta text-[0.9375rem] leading-[1.2] font-semibold text-center',
        'focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-current disabled:cursor-not-allowed disabled:opacity-50',
        variants[variant],
        className,
      )}
      type="button"
      {...props}
    />
  )
}
