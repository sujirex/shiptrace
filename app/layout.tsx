import type { Metadata, Viewport } from "next"
import localFont from "next/font/local"
import "./globals.css"
import { ThemeProvider } from "../context/ThemeContext"
import { DataProvider } from "../context/DataContext"
import { SettingsProvider } from "../context/SettingsContext"
import Sidebar from "../components/Sidebar"

const geist = localFont({ src: "./fonts/Geist.woff2", variable: "--font-geist", weight: "100 900", display: "swap" })
const geistMono = localFont({ src: "./fonts/GeistMono.woff2", variable: "--font-geist-mono", weight: "100 900", display: "swap" })

export const metadata: Metadata = {
  title: { default: "ShipTrace", template: "%s — ShipTrace" },
  description: "NCR & Defect Intelligence Platform for shipyards. Self-hosted.",
  authors: [{ name: "Suji Kumar C", url: "https://sujikumar.com" }],
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FBFBFD" },
    { media: "(prefers-color-scheme: dark)", color: "#07080D" },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <head>
        {/* Saved choice wins, otherwise the device setting. Runs before first paint (no flash). */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){var t=null;try{t=localStorage.getItem('shiptrace-theme')}catch(e){}if(t!=='light'&&t!=='dark')t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.setAttribute('data-theme',t)})();` }} />
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
