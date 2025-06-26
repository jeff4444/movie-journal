import type { Metadata } from 'next'
import './globals.css'
import { Navbar }  from '@/components/navbar'

export const metadata: Metadata = {
  title: 'Movie Journal',
  description: 'Track and reflect on your cinematic journey',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  )
}
