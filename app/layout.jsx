import './globals.css'
import ThemeProvider from '@/components/ThemeProvider'

export const metadata = {
  title: 'INSEE — Intelligent Navigation for the Visually Impaired',
  description: 'AI-powered smart cane with real-time obstacle detection, GPS tracking, and caretaker monitoring.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
