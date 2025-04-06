import './globals.css'
import Navigation from './components/Navigation'
import FirebaseAnalytics from './components/FirebaseAnalytics'

export const metadata = {
  title: 'KingDoom Squad',
  description: 'Site officiel de KingDoom Squad',
}

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <FirebaseAnalytics />
        <Navigation />
        {children}
        <footer className="bg-secondary/80 py-8">
          <div className="max-w-6xl mx-auto px-4 text-center text-gray-400">
            <p>© 2024 KingDoom Squad. Tous droits réservés.</p>
          </div>
        </footer>
      </body>
    </html>
  )
}
