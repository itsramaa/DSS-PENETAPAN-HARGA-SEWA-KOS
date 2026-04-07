import type { Metadata } from 'next'
import { Montserrat, Poppins } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Providers } from '@/lib/providers'
import './globals.css'

const montserrat = Montserrat({ 
  subsets: ['latin', 'latin-ext'], 
  variable: '--font-montserrat',
  weight: ['400', '500', '600', '700', '800'],
})

const poppins = Poppins({ 
  subsets: ['latin', 'latin-ext'], 
  variable: '--font-poppins',
  weight: ['400', '500', '600', '700', '800'],
})

export const metadata: Metadata = {
  title: 'DSS Kos - Decision Support System',
  description: 'Sistem pendukung keputusan untuk penetapan harga sewa kos menggunakan metode AHP dan CBP',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id" className={`${montserrat.variable} ${poppins.variable}`}>
      <body className="font-poppins antialiased">
        <Providers>{children}</Providers>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
