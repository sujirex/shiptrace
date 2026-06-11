"use client"
import { useMemo, useState } from "react"
import { useData } from "../../context/DataContext"
import { useSettings } from "../../context/SettingsContext"
import { NCR, NCRStatus, Severity } from "../../lib/types"
import { Plus, Search, Download, Trash2, Check, X, ChevronDown, ChevronUp } from "lucide-react"
import Link from "next/link"

const ALL = "All"

export default function NCRLogPage() {
  const { ncrs, updateNCR, deleteNCR } = useData()
  const { fmt } = useSettings()

  const [search,    setSearch]    = useState("")
  const [fStatus,   setFStatus]   = useState<string>(ALL)
  const [fSeverity, setFSeverity] = useState<string>(ALL)
  const [fType,     setFType]     = useState<string>(ALL)
  const [fYard,     setFYard]     = useState<string>(ALL)
  const [fDept,     setFDept]     = useState<string>(ALL)
  const [fClass,    setFClass]    = useState<string>(ALL)
  const [expanded,  setExpanded]  = useState<string | null>(null)

  // Close modal
  const [closing,      setClosing]      = useState<NCR | null>(null)
  const [closeAction,  setCloseAction]  = useState("")
  const [closeLearned, setCloseLearned] = useState("")

  const yards  = useMemo(() => [ALL, ...Array.from(new Set(ncrs.map(n => n.yard)))], [ncrs])
  const depts  = useMemo(() => [ALL, ...Array.from(new Set(ncrs.map(n => n.department)))], [ncrs])
  const classes = useMemo(() => [ALL, ...Array.from(new Set(ncrs.map(n => n.classSociety)))], [ncrs])

  const filtered = useMemo(() => ncrs.filter(n => {
    if (fStatus   !== ALL && n.status      !== fStatus)   return false
    if (fSeverity !== ALL && n.severity    !== fSeverity) return false
    if (fType     !== ALL && n.defectType  !== fType)     return false
    if (fYard     !== ALL && n.yard        !== fYard)     return false
    if (fDept     !== ALL && n.department  !== fDept)     return false
    if (fClass    !== ALL && n.classSociety !== fClass)   return false
    if (search) {
      const q = search.toLowerCase()
      return n.id.toLowerCase().includes(q) || n.description.toLowerCase().includes(q) ||
             n.vessel.toLowerCase().includes(q) || n.location.toLowerCase().includes(q) ||
             n.raisedBy.toLowerCase().includes(q) || n.assignedTo.toLowerCase().includes(q)
    }
    return true
  }), [ncrs, fStatus, fSeverity, fType, fYard, fDept, fClass, search])

  function exportCSV() {
    const header = ["ID","Vessel","Yard","Location","Drawing Ref","Type","Severity","Dept","Root Cause","Raised By","Responsible","Authorized By","Assigned To","Followed By","Reviewed By","Class Society","Class Ref","Raised Date","Target Date","Status","Closed Date","Currency","Cost","Description","Corrective Action","Lesson Learned"]
    const rows = filtered.map(n => [
      n.id, `"${n.vessel}"`, `"${n.yard}"`, `"${n.location}"`, n.drawingRef ?? "",
      n.defectType, n.severity, n.department, n.rootCause,
      `"${n.raisedBy}"`, `"${n.responsible}"`, `"${n.authorizedBy}"`, `"${n.assignedTo}"`, `"${n.followedBy}"`, `"${n.reviewedBy ?? ""}"`,
      n.classSociety, n.classRef ?? "",
      n.raisedDate, n.targetDate, n.status, n.closedDate ?? "",
      n.currency, n.cost ?? "",
      `"${n.description}"`, `"${n.correctiveAction}"`, `"${n.lessonLearned ?? ""}"`
    ])
    const csv = [header, ...rows].map(r => r.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a"); a.href = url
    a.download = "shiptrace_ncrs.csv"; a.click(); URL.revokeObjectURL(url)
  }

  function confirmClose() {
    if (!closing) return
    updateNCR(closing.id, {
      status: "Closed",
      closedDate: new Date().toISOString().split("T")[0],
      correctiveAction: closeAction || closing.correctiveAction,
      lessonLearned: closeLearned || closing.lessonLearned,
    })
    setClosing(null); setCloseAction(""); setCloseLearned("")
  }

  function sbadge(s: NCRStatus) {
    const m: Record<NCRStatus, string> = { Open: "badge-open", "In Progress": "badge-progress", Closed: "badge-closed", Overdue: "badge-overdue" }
    return `badge ${m[s]}`
  }
  function sevbadge(s: Severity) {
    return `badge ${{ Critical: "badge-critical", Major: "badge-major", Minor: "badge-minor" }[s]}`
  }

  const CURRENCY_SYMBOL: Record<string, string> = { INR: "₹", USD: "$", EUR: "€", GBP: "£", AED: "د.إ" }

  return (
    <div className="page-content">
      <div className="section-header" style={{ marginBottom: 20 }}>
        <div>
          <h1>NCR Log</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 13, marginTop: 3 }}>{filtered.length} of {ncrs.length} records</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-secondary" onClick={exportCSV}><Download size={13} /> Export CSV</button>
          <Link href="/ncr/new" className="btn btn-primary"><Plus size={13} /> Raise NCR</Link>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: 14, padding: "12px 14px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
          <div style={{ position: "relative", flex: "1 1 200px" }}>
            <Search size={13} style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input className="input" placeholder="Search ID, vessel, description, person…"
              value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 28 }} />
          </div>
          {[
            { label: "Status",   val: fStatus,   set: setFStatus,   opts: [ALL,"Open","In Progress","Closed","Overdue"] },
            { label: "Severity", val: fSeverity, set: setFSeverity, opts: [ALL,"Critical","Major","Minor"] },
            { label: "Type",     val: fType,     set: setFType,     opts: [ALL,"Weld Defect","Structural","Hull Plate","Piping","Painting","Outfit","Electrical","Machinery","Other"] },
            { label: "Yard",     val: fYard,     set: setFYard,     opts: yards },
            { label: "Dept",     val: fDept,     set: setFDept,     opts: depts },
            { label: "Class",    val: fClass,    set: setFClass,    opts: classes },
          ].map(({ label, val, set, opts }) => (
            <select key={label} className="select" value={val} onChange={e => set(e.target.value)} style={{ flex: "0 1 130px" }}>
              {opts.map(o => <option key={o}>{o === ALL ? `All ${label}` : o}</option>)}
            </select>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0 }}>
        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th></th>
                <th>NCR ID</th>
                <th>Vessel / Yard</th>
                <th>Location</th>
                <th>Type</th>
                <th>Sev.</th>
                <th>Dept.</th>
                <th>Raised By</th>
                <th>Responsible</th>
                <th>Auth. By</th>
                <th>Assigned To</th>
                <th>Followed By</th>
                <th>Class</th>
                <th>Raised</th>
                <th>Target</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Cost</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={18} style={{ textAlign: "center", padding: 32, color: "var(--text-muted)" }}>No NCRs match the current filters.</td></tr>
              )}
              {filtered.map(n => (
                <>
                  <tr key={n.id} style={{ cursor: "pointer" }} onClick={() => setExpanded(expanded === n.id ? null : n.id)}>
                    <td style={{ width: 24, color: "var(--text-muted)" }}>
                      {expanded === n.id ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </td>
                    <td style={{ color: "var(--green-bright)", fontFamily: "Courier New,monospace", fontWeight: 700, fontSize: 11, whiteSpace: "nowrap" }}>{n.id}</td>
                    <td style={{ fontSize: 11 }}>
                      <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{n.vessel.split("(")[0].trim()}</div>
                      <div style={{ color: "var(--text-muted)", fontSize: 10 }}>{(n.yard ?? "").split(",")[0]}</div>
                    </td>
                    <td style={{ fontSize: 11, maxWidth: 110, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{n.location}</td>
                    <td style={{ fontSize: 11, whiteSpace: "nowrap" }}>{n.defectType}</td>
                    <td><span className={sevbadge(n.severity)}>{n.severity}</span></td>
                    <td style={{ fontSize: 11 }}>{n.department}</td>
                    <td style={{ fontSize: 11, maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={n.raisedBy}>{n.raisedBy.split("—")[0].trim()}</td>
                    <td style={{ fontSize: 11, maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={n.responsible}>{n.responsible.split("—")[0].trim()}</td>
                    <td style={{ fontSize: 11, maxWidth: 110, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={n.authorizedBy}>{n.authorizedBy.split("—")[0].trim()}</td>
                    <td style={{ fontSize: 11, maxWidth: 110, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={n.assignedTo}>{n.assignedTo.split("—")[0].trim()}</td>
                    <td style={{ fontSize: 11, maxWidth: 110, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={n.followedBy}>{n.followedBy.split("—")[0].trim()}</td>
                    <td style={{ fontSize: 11 }}>
                      <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 99, background: "rgba(15,155,15,.12)", color: "var(--green)", border: "1px solid rgba(15,155,15,.2)" }}>{n.classSociety}</span>
                    </td>
                    <td style={{ fontSize: 11, whiteSpace: "nowrap" }}>{n.raisedDate}</td>
                    <td style={{ fontSize: 11, whiteSpace: "nowrap", color: new Date(n.targetDate) < new Date() && n.status !== "Closed" ? "var(--status-overdue)" : "inherit" }}>{n.targetDate}</td>
                    <td><span className={sbadge(n.status as NCRStatus)}>{n.status}</span></td>
                    <td style={{ textAlign: "right", fontFamily: "Courier New,monospace", fontSize: 11, whiteSpace: "nowrap" }}>
                      {n.cost ? `${CURRENCY_SYMBOL[n.currency] ?? ""}${n.cost.toLocaleString("en-IN")}` : "—"}
                    </td>
                    <td onClick={e => e.stopPropagation()}>
                      <div style={{ display: "flex", gap: 4 }}>
                        {n.status !== "Closed" && (
                          <button className="btn btn-ghost" style={{ padding: "3px 8px", fontSize: 11 }}
                            onClick={() => { setClosing(n); setCloseAction(n.correctiveAction); setCloseLearned(n.lessonLearned ?? "") }}>
                            <Check size={11} /> Close
                          </button>
                        )}
                        <button className="btn btn-danger" style={{ padding: "3px 6px" }}
                          onClick={() => { if (confirm(`Delete ${n.id}?`)) deleteNCR(n.id) }}>
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Expanded detail row */}
                  {expanded === n.id && (
                    <tr key={`${n.id}-detail`}>
                      <td colSpan={18} style={{ background: "var(--bg-raised)", padding: "14px 20px" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, fontSize: 12 }}>
                          <div>
                            <div style={{ color: "var(--text-muted)", fontSize: 11, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 4 }}>Defect Description</div>
                            <p style={{ color: "var(--text-primary)", lineHeight: 1.6 }}>{n.description}</p>
                            {n.drawingRef && <p style={{ color: "var(--text-muted)", marginTop: 4, fontSize: 11 }}>📐 {n.drawingRef}</p>}
                            {n.imoNumber && <p style={{ color: "var(--text-muted)", marginTop: 2, fontSize: 11 }}>IMO: {n.imoNumber}</p>}
                            {n.classRef && <p style={{ color: "var(--green)", marginTop: 2, fontSize: 11 }}>Class Ref: {n.classRef}</p>}
                          </div>
                          <div>
                            <div style={{ color: "var(--text-muted)", fontSize: 11, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 4 }}>Corrective Action</div>
                            <p style={{ color: "var(--text-secondary)", lineHeight: 1.6 }}>{n.correctiveAction || "—"}</p>
                            {n.reviewedBy && (
                              <p style={{ marginTop: 8, fontSize: 11, color: "var(--text-muted)" }}>
                                <strong>Reviewed By:</strong> {n.reviewedBy}
                              </p>
                            )}
                            {n.closedDate && (
                              <p style={{ marginTop: 4, fontSize: 11, color: "var(--status-closed)" }}>✓ Closed: {n.closedDate}</p>
                            )}
                          </div>
                          <div>
                            {n.lessonLearned ? (
                              <>
                                <div style={{ color: "var(--green)", fontSize: 11, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 4 }}>📚 Lesson Learned</div>
                                <p style={{ color: "var(--text-primary)", lineHeight: 1.6 }}>{n.lessonLearned}</p>
                              </>
                            ) : (
                              <div style={{ color: "var(--text-muted)", fontSize: 11, fontStyle: "italic" }}>No lesson logged yet — add when closing.</div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Close NCR modal */}
      {closing && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div className="card" style={{ width: "100%", maxWidth: 560, padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h2 style={{ fontSize: 15 }}>Close NCR — {closing.id}</h2>
              <button onClick={() => setClosing(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}><X size={16} /></button>
            </div>
            <div style={{ background: "var(--bg-raised)", borderRadius: "var(--radius-sm)", padding: "10px 14px", marginBottom: 14, fontSize: 12 }}>
              <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "4px 12px" }}>
                {[
                  ["Vessel", closing.vessel.split("(")[0].trim()],
                  ["Type", `${closing.defectType} · ${closing.severity}`],
                  ["Responsible", closing.responsible],
                  ["Authorized By", closing.authorizedBy],
                ].map(([k, v]) => (
                  <>
                    <span key={`k-${k}`} style={{ color: "var(--text-muted)", fontSize: 10, textTransform: "uppercase", letterSpacing: ".04em" }}>{k}</span>
                    <span key={`v-${k}`} style={{ color: "var(--text-secondary)" }}>{v}</span>
                  </>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label className="form-label">Final Corrective Action Taken</label>
              <textarea className="input" rows={3} value={closeAction} onChange={e => setCloseAction(e.target.value)} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label className="form-label">Lesson Learned <span style={{ color: "var(--green)" }}>(feeds knowledge base & pattern engine)</span></label>
              <textarea className="input" rows={3} value={closeLearned} onChange={e => setCloseLearned(e.target.value)}
                placeholder="What should the team check before doing similar work next time?" />
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button className="btn btn-secondary" onClick={() => setClosing(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={confirmClose}><Check size={13} /> Confirm Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
