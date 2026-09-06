import './globals.css'

export const metadata = {
  title: 'À Table !',
  description: 'Vos repas cuisinés et vos courses Drive, zéro stress.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  )
}
