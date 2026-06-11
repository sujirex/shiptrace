"use client"
import { useState } from "react"
import { useData } from "../../../context/DataContext"
import { useSettings } from "../../../context/SettingsContext"
import { NCR, DefectType, Severity, RootCause, ClassSociety, Currency } from "../../../lib/types"
import { useRouter } from "next/navigation"
import { Save, ArrowLeft } from "lucide-react"
import Link from "next/link"

const DEPARTMENTS = ["Hull Structure","Outfitting","Piping","Electrical","Painting & Blasting","Machinery","QA/QC","Production Planning","Safety","Design","Procurement","Sub-contractor","Other"]
const CLASS_SOCIETIES: ClassSociety[] = ["IRS","BV","DNV","LR","ABS","KR","NK","Internal","None"]
const CURRENCIES: Currency[] = ["INR","USD","EUR","GBP","AED"]

export default function NewNCRPage() {
  const { ncrs, addNCR } = useData()
  const { settings } = useSettings()
  const router = useRouter()

  const nextId = () => {
    const year = new Date().getFullYear()
    const existing = ncrs.filter(n => n.id.startsWith(`NCR-${year}`))
    return `NCR-${year}-${String(existing.length + 1).padStart(4, "0")}`
  }

  const [form, setForm] = useState({
    // Vessel & location
    vessel: "", yard: "", imoNumber: "", location: "", drawingRef: "",
    // Classification
    defectType: "Weld Defect" as DefectType, severity: "Major" as Severity,
    rootCause: "Workmanship" as RootCause, department: "Hull Structure",
    // Description
    description: "", correctiveAction: "",
    // People
    raisedBy: "", responsible: "", authorizedBy: "", assignedTo: "", followedBy: "", reviewedBy: "",
    // Class
    classSociety: (settings.classSociety || "IRS") as ClassSociety, classRef: "",
    // Timeline
    targetDate: "",
    // Cost
    currency: settings.currency as Currency, cost: "",
  })

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))
  const [err, setErr] = useState("")

  function handleSubmit() {
    if (!form.vessel || !form.yard || !form.location || !form.description || !form.targetDate || !form.raisedBy || !form.responsible || !form.authorizedBy || !form.assignedTo || !form.followedBy) {
      setErr("Please fill all required fields (marked *)."); return
    }
    const ncr: NCR = {
      id: nextId(),
      vessel: form.vessel, yard: form.yard,
      imoNumber: form.imoNumber || undefined,
      location: form.location, drawingRef: form.drawingRef || undefined,
      defectType: form.defectType, severity: form.severity,
      description: form.description, rootCause: form.rootCause,
      department: form.department,
      raisedBy: form.raisedBy, responsible: form.responsible,
      authorizedBy: form.authorizedBy, assignedTo: form.assignedTo,
      followedBy: form.followedBy, reviewedBy: form.reviewedBy || undefined,
      classSociety: form.classSociety, classRef: form.classRef || undefined,
      raisedDate: new Date().toISOString().split("T")[0],
      targetDate: form.targetDate,
      status: "Open",
      correctiveAction: form.correctiveAction,
      currency: form.currency,
      cost: form.cost ? parseFloat(form.cost) : undefined,
    }
    addNCR(ncr)
    router.push("/ncr")
  }

  const F = (label: string, key: string, type = "text", required = false, placeholder = "") => (
    <div>
      <label className="form-label">{label}{required && <span style={{ color: "var(--green)" }}> *</span>}</label>
      <input className="input" type={type} placeholder={placeholder}
        value={(form as Record<string, string>)[key]}
        onChange={e => set(key, e.target.value)} />
    </div>
  )

  const S = (label: string, key: string, opts: string[], required = false) => (
    <div>
      <label className="form-label">{label}{required && <span style={{ color: "var(--green)" }}> *</span>}</label>
      <select className="select" value={(form as Record<string, string>)[key]} onChange={e => set(key, e.target.value)}>
        {opts.map(o => <option key={o}>{o}</option>)}
      </select>
    </div>
  )

  const sectionHead = (title: string) => (
    <div style={{ gridColumn: "1 / -1", borderBottom: "1px solid var(--border)", paddingBottom: 6, marginBottom: 2 }}>
      <h4 style={{ fontSize: 12, color: "var(--green)", textTransform: "uppercase", letterSpacing: ".06em" }}>{title}</h4>
    </div>
  )

  return (
    <div className="page-content">
      <div className="section-header" style={{ marginBottom: 20 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <Link href="/ncr" style={{ color: "var(--text-muted)", display: "flex" }}><ArrowLeft size={14} /></Link>
            <h1>Raise New NCR</h1>
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: 13 }}>NCR ID auto-assigned on save · <span style={{ color: "var(--green)" }}>Required fields marked *</span></p>
        </div>
        <button className="btn btn-primary" onClick={handleSubmit}><Save size={13} /> Save NCR</button>
      </div>

      {err && (
        <div style={{ background: "var(--status-overdue-bg)", border: "1px solid rgba(239,68,68,.4)", borderRadius: "var(--radius-sm)", padding: "9px 14px", marginBottom: 16, color: "var(--status-overdue)", fontSize: 12 }}>{err}</div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

        {/* LEFT */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Vessel & Yard */}
          <div className="card">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {sectionHead("Vessel & Shipyard")}
              {F("Vessel Name / Yard No.", "vessel", "text", true, "e.g. MT Kalpana (Yard No. 445)")}
              {F("Shipyard", "yard", "text", true, "e.g. L&T Shipbuilding, Kattupalli")}
              {F("IMO Number", "imoNumber", "text", false, "Optional")}
            </div>
          </div>

          {/* Location */}
          <div className="card">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {sectionHead("Location & Drawing Reference")}
              {F("Location / Block / Frame", "location", "text", true, "e.g. Block P-14 / Fr.112–118")}
              {F("Drawing / Doc Ref.", "drawingRef", "text", false, "e.g. CSL-STR-3001-014 Rev.2")}
            </div>
          </div>

          {/* Classification */}
          <div className="card">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {sectionHead("Defect Classification")}
              {S("Defect Type", "defectType", ["Weld Defect","Structural","Hull Plate","Piping","Painting","Outfit","Electrical","Machinery","Other"], true)}
              {S("Severity", "severity", ["Critical","Major","Minor"], true)}
              {S("Root Cause", "rootCause", ["Design Issue","Material Defect","Workmanship","Process Gap","Environmental","Sub-contractor","Unknown"])}
              {S("Responsible Department", "department", DEPARTMENTS, true)}
            </div>
          </div>

          {/* Class Society */}
          <div className="card">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {sectionHead("Classification Society")}
              {S("Class Society", "classSociety", CLASS_SOCIETIES)}
              {F("Class / Survey Reference No.", "classRef", "text", false, "e.g. IRS/CSL/2024/NCR/0118")}
            </div>
          </div>

          {/* Cost & Timeline */}
          <div className="card">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {sectionHead("Timeline & Cost")}
              {F("Target Close Date", "targetDate", "date", true)}
              <div>
                <label className="form-label">Currency</label>
                <select className="select" value={form.currency} onChange={e => set("currency", e.target.value)}>
                  {CURRENCIES.map(c => <option key={c} value={c}>{c === "INR" ? "₹ INR" : c === "USD" ? "$ USD" : c === "EUR" ? "€ EUR" : c === "GBP" ? "£ GBP" : "د.إ AED"}</option>)}
                </select>
              </div>
              {F("Est. Rework Cost", "cost", "number", false, "0")}
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* People */}
          <div className="card">
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {sectionHead("Responsibility Chain")}

              <div style={{ background: "rgba(15,155,15,.05)", borderRadius: "var(--radius-sm)", padding: "10px 12px", fontSize: 11, color: "var(--text-muted)", lineHeight: 1.7 }}>
                Indian shipyard NCR flow: <strong style={{ color: "var(--text-secondary)" }}>Raised By</strong> → <strong style={{ color: "var(--text-secondary)" }}>Responsible HOD</strong> → <strong style={{ color: "var(--text-secondary)" }}>Authorized By</strong> (QA Mgr) → <strong style={{ color: "var(--text-secondary)" }}>Assigned To</strong> (Foreman) → <strong style={{ color: "var(--text-secondary)" }}>Followed By</strong> (QA Eng) → <strong style={{ color: "var(--text-secondary)" }}>Reviewed By</strong> (Surveyor)
              </div>

              {F("Raised By *", "raisedBy", "text", false, "e.g. Shri. Deepa Nair — QA Inspector, CSL")}
              {F("Responsible (HOD / Manager) *", "responsible", "text", false, "e.g. Shri. Ramesh Pillai — DGM, Hull Production")}
              {F("Authorized By (QA Manager / GM) *", "authorizedBy", "text", false, "e.g. Shri. Arun Menon — AGM, QA")}
              {F("Assigned To (Foreman / Supervisor) *", "assignedTo", "text", false, "e.g. Shri. Murugan S. — Sr. Welding Foreman")}
              {F("Followed Up By (QA Engineer) *", "followedBy", "text", false, "e.g. Shri. Jithin Kumar — QA Engineer")}
              {F("Reviewed By (Class Surveyor)", "reviewedBy", "text", false, "e.g. Surveyor Krishnamurthy — IRS, Kochi")}
            </div>
          </div>

          {/* Description */}
          <div className="card">
            <label className="form-label">Defect Description <span style={{ color: "var(--green)" }}>*</span></label>
            <textarea className="input" rows={5}
              placeholder="Describe clearly — location, measurement, applicable standard, class limit exceeded, photo reference…"
              value={form.description} onChange={e => set("description", e.target.value)} />
          </div>

          {/* Corrective Action */}
          <div className="card">
            <label className="form-label">Proposed Corrective Action</label>
            <textarea className="input" rows={4}
              placeholder="Initial proposed corrective action / repair method…"
              value={form.correctiveAction} onChange={e => set("correctiveAction", e.target.value)} />
          </div>

          {/* Info */}
          <div className="card" style={{ background: "rgba(15,155,15,.05)", borderColor: "rgba(15,155,15,.2)" }}>
            <p style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.7 }}>
              💡 When you <strong style={{ color: "var(--green-bright)" }}>close</strong> this NCR, you will be prompted for final corrective action and a <strong style={{ color: "var(--green-bright)" }}>Lesson Learned</strong> — this feeds the knowledge base and pattern detection engine automatically.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
