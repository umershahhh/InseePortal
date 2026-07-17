import './globals.css'

export const metadata = {
  title: 'INSEE — Intelligent Navigation for the Visually Impaired',
  description: 'A smart assistive cane system with AI obstacle detection, real-time GPS tracking, and caretaker monitoring.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
