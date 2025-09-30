import { GalleryVerticalEnd } from "lucide-react"
import { Suspense } from "react"

import { SignupForm } from "@/components/signup-form"
import Link from 'next/link'
import { useTranslations } from 'next-intl'

function SignupFormFallback() {
  const t = useTranslations('common')
  return (
    <div className="flex items-center justify-center p-8">
      <div className="text-muted-foreground">{t('loading') || '加载中...'}</div>
    </div>
  )
}

export default function SignupPage() {
  const t = useTranslations('auth')
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link href="/" className="flex items-center gap-2 self-center font-medium">
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
            <GalleryVerticalEnd className="size-4" />
          </div>
          {'BetAIOne'}
        </Link>
        <Suspense fallback={<SignupFormFallback />}>
          <SignupForm />
        </Suspense>
      </div>
    </div>
  )
}
