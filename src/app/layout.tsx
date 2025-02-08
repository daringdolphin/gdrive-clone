import '~/styles/globals.css'

import { GeistSans } from 'geist/font/sans'
import { type Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { CSPostHogProvider } from './_providers/posthog-provider'

export const metadata: Metadata = {
  title: 'Drive Clone',
  description: 'Drive Clone',
  icons: [{ rel: 'icon', url: '/favicon.ico' }],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${GeistSans.variable}`}>
        <body>
          <CSPostHogProvider>{children}</CSPostHogProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
