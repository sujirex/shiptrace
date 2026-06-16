import type { Metadata } from "next"
import "./globals.css"
import { ThemeProvider } from "../context/ThemeContext"
import { DataProvider } from "../context/DataContext"
import { SettingsProvider } from "../context/SettingsContext"
import Sidebar from "../components/Sidebar"

export const metadata: Metadata = {
  title: { default: "ShipTrace", template: "%s — ShipTrace" },
  description: "NCR & Defect Intelligence Platform for shipyards. Self-hosted.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark">
      <head>
        <script dangerouslySetInnerHTML={{ __html: `(function(){var t=localStorage.getItem('shiptrace-theme')||'dark';document.documentElement.setAttribute('data-theme',t);})();` }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <ThemeProvider>
          <SettingsProvider>
          <DataProvider>
            <div className="app-shell">
              <Sidebar />
              <main className="main-content">
                {children}
              </main>
            </div>
          </DataProvider>
          </SettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
