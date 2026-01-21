import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'

export const metadata: Metadata = {
  title: 'Lexpacte - Analyse de contrats pour avocats',
  description: 'Application SaaS de legal-tech pour l\'analyse de contrats avec IA',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
      <ClerkProvider>
        <html lang="fr">
        <body>{children}</body>
        </html>
      </ClerkProvider>
  )
}
