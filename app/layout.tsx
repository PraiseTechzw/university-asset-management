import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import { AuthProvider } from '@/lib/auth-context'
import { AuthErrorBoundary } from '@/components/auth/auth-error-boundary'
import './globals.css'

export const metadata: Metadata = {
  title: 'CUT Asset Manager | University Asset Management System',
  description: 'Professional asset management system for Chinhoyi University of Technology. Secure, efficient, and user-friendly platform for managing university assets, maintenance, and inventory.',
  keywords: ['asset management', 'university', 'inventory', 'maintenance', 'Chinhoyi University', 'CUT'],
  authors: [{ name: 'Chinhoyi University of Technology' }],
  creator: 'Chinhoyi University of Technology',
  publisher: 'Chinhoyi University of Technology',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://cut-asset-manager.vercel.app'),
  openGraph: {
    title: 'CUT Asset Manager | University Asset Management System',
    description: 'Professional asset management system for Chinhoyi University of Technology',
    url: 'https://cut-asset-manager.vercel.app',
    siteName: 'CUT Asset Manager',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CUT Asset Manager | University Asset Management System',
    description: 'Professional asset management system for Chinhoyi University of Technology',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <AuthErrorBoundary>
              {children}
              <Toaster />
            </AuthErrorBoundary>
          </AuthProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
