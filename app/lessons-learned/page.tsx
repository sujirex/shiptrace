"use client"
import { useMemo, useState } from "react"
import { useData } from "../../context/DataContext"
import { BookOpen, Search, AlertTriangle } from "lucide-react"

export default function LessonsLearnedPage() {
  const { ncrs } = useData()
  const [search, setSearch] = useState("")
  const [fType, setFType] = useState("All")

  const lessons = useMemo(() =>
    ncrs
      .filter(n => n.lessonLearned && n.lessonLearned.trim().length > 0)
      .sort((a, b) => (b.closedDate ?? "").localeCompare(a.closedDate ?? "")),
    [ncrs])

  const defectTypes = ["All", ...Array.from(new Set(lessons.map(n => n.defectType)))]

  const filtered = useMemo(() => lessons.filter(n => {
    if (fType !== "All" && n.defectType !== fType) return false
    if (search) {
      const q = search.toLowerCase()
      return n.lessonLearned!.toLowerCase().includes(q) ||
             n.description.toLowerCase().includes(q) ||
             n.vessel.toLowerCase().includes(q) ||
             n.defectType.toLowerCase().includes(q)
    }
    return true
  }), [lessons, fType, search])

  // Pattern detection: same defect type appearing 2+ times
  const patterns = useMemo(() => {
    const counts: Record<string, number> = {}
    ncrs.forEach(n => { counts[n.defectType] = (counts[n.defectType] ?? 0) + 1 })
    return Object.entries(counts).filter(([, c]) => c >= 2).sort((a, b) => b[1] - a[1])
  }, [ncrs])

  function sevColor(s: string) {
    return s === "Critical" ? "#ef4444" : s === "Major" ? "#f59e0b" : "#22c55e"
  }

  return (
    <div className="page-content">
      <div className="section-header" style={{ marginBottom: 20 }}>
        <div>
          <h1>Lessons Learned</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 13, marginTop: 3 }}>
            {lessons.length} lessons from closed NCRs · searchable knowledge base
          </p>
        </div>
      </div>

      {/* Recurring patterns alert */}
      {patterns.length > 0 && (
        <div className="card" style={{ marginBottom: 18, background: "rgba(245,158,11,.06)", borderColor: "rgba(245,158,11,.3)" }}>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <AlertTriangle size={15} color="#f59e0b" style={{ flexShrink: 0, marginTop: 1 }} />
            <div>
              <div style={{ fontWeight: 600, fontSize: 13, color: "#f59e0b", marginBottom: 6 }}>Recurring Defect Patterns Detected</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {patterns.map(([type, count]) => (
                  <span key={type} style={{
                    fontSize: 11, padding: "3px 10px", borderRadius: 99,
                    background: "rgba(245,158,11,.15)", border: "1px solid rgba(245,158,11,.3)", color: "#f59e0b"
                  }}>
                    {type} — {count}×
                  </span>
                ))}
              </div>
              <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 8 }}>
                These defect types have appeared multiple times. Review the lessons below before starting similar work.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card" style={{ marginBottom: 16, padding: "11px 14px" }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ position: "relative", flex: "1 1 220px" }}>
            <Search size={13} style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input className="input" placeholder="Search lessons, vessel, defect type…"
              value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 28 }} />
          </div>
          <select className="select" value={fType} onChange={e => setFType(e.target.value)} style={{ flex: "0 1 180px" }}>
            {defectTypes.map(t => <option key={t}>{t === "All" ? "All Defect Types" : t}</option>)}
          </select>
          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{filtered.length} lessons</span>
        </div>
      </div>

      {/* Lesson cards */}
      {filtered.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: 40 }}>
          <BookOpen size={28} color="var(--text-muted)" style={{ margin: "0 auto 12px" }} />
          <p style={{ color: "var(--text-muted)", fontSize: 13 }}>
            {lessons.length === 0
              ? "No lessons logged yet. Close an NCR and add a lesson to start building the knowledge base."
              : "No lessons match the current filter."}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map(n => (
            <div key={n.id} className="card" style={{ borderLeft: `3px solid ${sevColor(n.severity)}` }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontFamily: "Courier New,monospace", fontSize: 11, color: "var(--green-bright)", fontWeight: 700 }}>{n.id}</span>
                <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{n.vessel}</span>
                <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 99, background: "rgba(15,155,15,.12)", color: "var(--green)", border: "1px solid rgba(15,155,15,.2)" }}>{n.defectType}</span>
                <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 99, color: sevColor(n.severity), background: `${sevColor(n.severity)}18`, border: `1px solid ${sevColor(n.severity)}44` }}>{n.severity}</span>
                <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--text-muted)" }}>{n.closedDate}</span>
              </div>
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 4 }}>Defect</div>
                <p style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6 }}>{n.description}</p>
              </div>
              <div style={{ background: "rgba(15,155,15,.06)", border: "1px solid rgba(15,155,15,.15)", borderRadius: "var(--radius-sm)", padding: "10px 14px" }}>
                <div style={{ fontSize: 11, color: "var(--green)", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
                  <BookOpen size={11} /> Lesson Learned
                </div>
                <p style={{ fontSize: 12, color: "var(--text-primary)", lineHeight: 1.7 }}>{n.lessonLearned}</p>
              </div>
              {n.correctiveAction && (
                <div style={{ marginTop: 8, fontSize: 11, color: "var(--text-muted)" }}>
                  <strong>Action taken:</strong> {n.correctiveAction}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
