export const metadata = { title: 'SmartDrive', description: 'Mon assistant courses' }
export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <head><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" /></head>
      <body>{children}</body>
    </html>
  )
}