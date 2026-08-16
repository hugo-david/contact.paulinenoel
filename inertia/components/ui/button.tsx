import { Button as BaseButton } from '@base-ui/react/button'
import type { ComponentPropsWithoutRef } from 'react'
import { cn } from '~/utils/cn'

const variants = {
  primary: 'bg-primary text-primary-foreground',
  quiet: 'bg-transparent text-secondary underline underline-offset-3',
  secondary: 'border-secondary bg-transparent text-secondary',
} as const

export interface ButtonProps
  extends ComponentPropsWithoutRef<typeof BaseButton> {
  static?: boolean
  variant?: keyof typeof variants
}

export function Button({
  className,
  static: isStatic = false,
  variant = 'primary',
  ...props
}: ButtonProps) {
  return (
    <BaseButton
      className={cn(
        'inline-flex min-h-11 items-center justify-center rounded-full border border-transparent px-6 py-2.5 font-meta text-[0.9375rem] leading-[1.2] font-semibold text-center',
        'disabled:pointer-events-none disabled:opacity-50 motion-safe:transition-[background-color,border-color,color,opacity,transform] motion-safe:duration-150 motion-safe:ease-out',
        !isStatic && 'motion-safe:active:scale-[0.96]',
        variants[variant],
        className,
      )}
      type="button"
      {...props}
    />
  )
}
