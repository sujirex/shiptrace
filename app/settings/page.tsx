"use client"
import { useSettings } from "../../context/SettingsContext"
import { Shield, Server, Database, Info, Settings2 } from "lucide-react"
import { Currency, ClassSociety } from "../../lib/types"

const CURRENCIES: { value: Currency; label: string }[] = [
  { value: "INR", label: "₹ INR — Indian Rupee (default)" },
  { value: "USD", label: "$ USD — US Dollar" },
  { value: "EUR", label: "€ EUR — Euro" },
  { value: "GBP", label: "£ GBP — British Pound" },
  { value: "AED", label: "د.إ AED — UAE Dirham" },
]

const CLASS_SOCIETIES: ClassSociety[] = ["IRS","BV","DNV","LR","ABS","KR","NK","Internal","None"]

export default function SettingsPage() {
  const { settings, updateSettings } = useSettings()

  return (
    <div className="page-content">
      <div className="section-header" style={{ marginBottom: 22 }}>
        <h1>Settings</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 13, marginTop: 3 }}>Yard preferences · currency · deployment info</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 640 }}>

        {/* Yard Preferences */}
        <div className="card">
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 16 }}>
            <Settings2 size={16} color="var(--green-bright)" />
            <h3 style={{ fontSize: 13 }}>Yard & Classification Preferences</h3>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label className="form-label">Shipyard Name</label>
              <input className="input" placeholder="e.g. Cochin Shipyard Ltd (CSL)"
                value={settings.yard}
                onChange={e => updateSettings({ yard: e.target.value })} />
              <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
                Used as default yard name when raising new NCRs
              </p>
            </div>
            <div>
              <label className="form-label">Default Classification Society</label>
              <select className="select" value={settings.classSociety}
                onChange={e => updateSettings({ classSociety: e.target.value as ClassSociety })}>
                {CLASS_SOCIETIES.map(c => <option key={c} value={c}>{c === "IRS" ? "IRS — Indian Register of Shipping (default)" : c}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Currency */}
        <div className="card">
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 16 }}>
            <span style={{ fontSize: 18, lineHeight: 1 }}>₹</span>
            <h3 style={{ fontSize: 13 }}>Currency</h3>
          </div>
          <div>
            <label className="form-label">Default Currency for Cost Entry</label>
            <select className="select" value={settings.currency}
              onChange={e => updateSettings({ currency: e.target.value as Currency })}>
              {CURRENCIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6, lineHeight: 1.6 }}>
              Applies to new NCRs and cost display throughout the app. Existing NCRs keep their saved currency. Indian Rupee (₹ INR) is the default for Indian shipyards.
            </p>
          </div>
        </div>

        {/* Deployment */}
        <div className="card">
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 14 }}>
            <Server size={16} color="var(--green-bright)" />
            <h3 style={{ fontSize: 13 }}>Deployment Mode</h3>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "8px 16px", fontSize: 12 }}>
            {[
              ["Mode",    "Self-Hosted"],
              ["Version", "v0.1.0"],
              ["Storage", "Browser localStorage (demo) · Production: PostgreSQL on-premises"],
              ["Network", "Local network only — no external data transfer"],
              ["Built by","Suji Kumar"],
            ].map(([k, v]) => (
              <>
                <span key={`k-${k}`} style={{ color: "var(--text-muted)", textTransform: "uppercase", fontSize: 10, letterSpacing: ".05em", paddingTop: 1 }}>{k}</span>
                <span key={`v-${k}`} style={{ color: k === "Built by" ? "var(--green-bright)" : "var(--text-primary)", fontWeight: k === "Built by" ? 700 : 400 }}>{v}</span>
              </>
            ))}
          </div>
        </div>

        {/* Data Safety */}
        <div className="card">
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 14 }}>
            <Shield size={16} color="var(--green-bright)" />
            <h3 style={{ fontSize: 13 }}>Data Safety</h3>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              "All NCR and defect data stored on your own server — never leaves the yard",
              "No cloud dependency — works fully offline on local network",
              "Suitable for Indian shipyard confidentiality and contract requirements",
              "Docker-based deployment — isolated, portable, easy to back up",
              "PostgreSQL database — standard, auditable, export-friendly",
              "No external API calls — optional AI classification can be disabled",
              "Compliant with Indian data protection best practices",
            ].map(item => (
              <div key={item} style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 12, color: "var(--text-secondary)" }}>
                <span style={{ color: "var(--green-bright)", flexShrink: 0, marginTop: 1 }}>✓</span>
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ background: "rgba(15,155,15,.05)", borderColor: "rgba(15,155,15,.2)" }}>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <Info size={14} color="var(--green)" style={{ flexShrink: 0, marginTop: 2 }} />
            <p style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.7 }}>
              <strong style={{ color: "var(--green-bright)" }}>ShipTrace v0.1</strong> — NCR & Defect Intelligence Platform for Indian Shipyards.
              Self-hosted deployment. Production backend (PostgreSQL + Docker) in next release.
              Built by <strong style={{ color: "var(--green-bright)" }}>Suji Kumar</strong>.
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}
