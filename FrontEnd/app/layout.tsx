import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from '@/components/ui/sonner'
import { AppProvider } from '@/contexts/app-context'
import { ThemeInitializer } from '@/components/theme-initializer'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter'
})

export const metadata: Metadata = {
  title: 'FilaJusta VidaPlena | Clinica Popular',
  description: 'Agende sua consulta de forma simples e gratuita na Clinica Popular VidaPlena. Atendimento prioritario a idosos, PCD e gestantes.',
  keywords: ['clinica popular', 'agendamento consulta', 'saude publica', 'Manaus', 'VidaPlena'],
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#45AC8B',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased min-h-screen`}>
        <ThemeInitializer />
        <AppProvider>
          {children}
          <Toaster position="top-right" />
        </AppProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
