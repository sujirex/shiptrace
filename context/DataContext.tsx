"use client"
import { createContext, useContext, useEffect, useState } from "react"
import { NCR, Equipment } from "../lib/types"
import { SAMPLE_NCRS, SAMPLE_EQUIPMENT } from "../lib/sampleData"

interface DataCtx {
  ncrs: NCR[]
  equipment: Equipment[]
  addNCR: (n: NCR) => void
  updateNCR: (id: string, updates: Partial<NCR>) => void
  deleteNCR: (id: string) => void
}

const DataContext = createContext<DataCtx>({
  ncrs: [], equipment: [],
  addNCR: () => {}, updateNCR: () => {}, deleteNCR: () => {},
})

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [ncrs, setNcrs] = useState<NCR[]>(SAMPLE_NCRS)
  const [equipment] = useState<Equipment[]>(SAMPLE_EQUIPMENT as unknown as Equipment[])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem("shiptrace-ncrs")
      if (saved) {
        const parsed: NCR[] = JSON.parse(saved)
        // Schema migration: if saved data is old format (no `yard` field), discard and use fresh sample data
        const isNewSchema = parsed.length === 0 || parsed[0].yard !== undefined
        if (isNewSchema) setNcrs(parsed)
        else localStorage.removeItem("shiptrace-ncrs")
      }
    } catch {}
    setLoaded(true)
  }, [])

  useEffect(() => {
    if (!loaded) return
    try { localStorage.setItem("shiptrace-ncrs", JSON.stringify(ncrs)) } catch {}
  }, [ncrs, loaded])

  function addNCR(n: NCR) { setNcrs(prev => [n, ...prev]) }
  function updateNCR(id: string, updates: Partial<NCR>) {
    setNcrs(prev => prev.map(n => n.id === id ? { ...n, ...updates } : n))
  }
  function deleteNCR(id: string) { setNcrs(prev => prev.filter(n => n.id !== id)) }

  return (
    <DataContext.Provider value={{ ncrs, equipment, addNCR, updateNCR, deleteNCR }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() { return useContext(DataContext) }
