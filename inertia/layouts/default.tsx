import type { Data } from '@generated/data'
import { usePage } from '@inertiajs/react'
import type { ReactElement } from 'react'
import { useEffect } from 'react'
import { Toaster, toast } from 'sonner'

export default function Layout({
  children,
}: {
  children: ReactElement<Data.SharedProps>
}) {
  const { url, flash } = usePage()
  // biome-ignore lint/correctness/useExhaustiveDependencies: dismiss toasts after navigation.
  useEffect(() => {
    toast.dismiss()
  }, [url])

  useEffect(() => {
    if (flash.error) {
      toast.error(flash.error)
    }
    if (flash.success) {
      toast.success(flash.success)
    }
  })

  return (
    <>
      <header>
        <div>
          <div></div>
        </div>
      </header>
      <main>{children}</main>
      <Toaster position="top-center" richColors />
    </>
  )
}
