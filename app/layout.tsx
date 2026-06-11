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
