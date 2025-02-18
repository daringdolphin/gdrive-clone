// app/providers.js
'use client'
import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'
import { env } from '~/env'
import dynamicLoader from 'next/dynamic'

const SuspendedPostHogPageView = dynamicLoader(
  () => import('./pageview-tracker'),
  {
    ssr: false,
  }
)

if (typeof window !== 'undefined') {
  posthog.init(env.NEXT_PUBLIC_POSTHOG_KEY, {
    // api_host: env.NEXT_PUBLIC_POSTHOG_HOST,
    person_profiles: 'identified_only', // or 'always' to create profiles for anonymous users as well
    api_host: '/ingest',
    ui_host: 'https://us.posthog.com',
  })
}
export function CSPostHogProvider({ children }: { children: React.ReactNode }) {
  return (
    <PostHogProvider client={posthog}>
      <SuspendedPostHogPageView />
      {children}
    </PostHogProvider>
  )
}
