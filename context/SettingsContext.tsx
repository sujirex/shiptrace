"use client"
import { createContext, useContext, useEffect, useState } from "react"
import { Currency, ClassSociety } from "../lib/types"

interface Settings {
  currency: Currency
  yard: string
  classSociety: ClassSociety
}

interface SettingsCtx {
  settings: Settings
  updateSettings: (s: Partial<Settings>) => void
  fmt: (amount: number) => string  // format currency amount
  symbol: string
}

const defaults: Settings = {
  currency: "INR",
  yard: "",
  classSociety: "IRS",
}

const SYMBOLS: Record<Currency, string> = {
  INR: "₹", USD: "$", EUR: "€", GBP: "£", AED: "د.إ"
}

const SettingsContext = createContext<SettingsCtx>({
  settings: defaults,
  updateSettings: () => {},
  fmt: (n) => `₹${n.toLocaleString("en-IN")}`,
  symbol: "₹",
})

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaults)

  useEffect(() => {
    try {
      const saved = localStorage.getItem("shiptrace-settings")
      if (saved) setSettings({ ...defaults, ...JSON.parse(saved) })
    } catch {}
  }, [])

  function updateSettings(s: Partial<Settings>) {
    const next = { ...settings, ...s }
    setSettings(next)
    try { localStorage.setItem("shiptrace-settings", JSON.stringify(next)) } catch {}
  }

  const symbol = SYMBOLS[settings.currency]

  function fmt(amount: number) {
    // Use plain toLocaleString() — no locale arg keeps SSR and client consistent
    const n = Math.round(amount).toLocaleString()
    return `${symbol}${n}`
  }

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, fmt, symbol }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() { return useContext(SettingsContext) }
