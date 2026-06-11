"use client"
import { useMemo } from "react"
import { useData } from "../../context/DataContext"
import { Activity, AlertTriangle, CheckCircle, Clock, Wrench } from "lucide-react"

export default function PredictivePage() {
  const { equipment, ncrs } = useData()

  const daysUntil = (d: string) => Math.ceil((new Date(d).getTime() - Date.now()) / 86400000)

  // Risk scoring per equipment
  const scored = useMemo(() => equipment.map(eq => {
    const days = daysUntil(eq.nextServiceDate)
    const failCount = eq.failureHistory.length
    const totalDowntime = eq.failureHistory.reduce((s, f) => s + f.downtime, 0)
    const totalCost = eq.failureHistory.reduce((s, f) => s + f.cost, 0)

    // Risk score 0–100: overdue=+40, <30d=+20, each failure=+10, downtime per failure=+varies
    let risk = 0
    if (days <= 0)   risk += 40
    else if (days <= 30) risk += 20
    else if (days <= 60) risk += 10
    risk += Math.min(failCount * 10, 30)
    risk += Math.min(totalDowntime / 5, 20)
    risk = Math.min(risk, 100)

    const level = risk >= 70 ? "High" : risk >= 40 ? "Medium" : "Low"
    return { ...eq, days, failCount, totalDowntime, totalCost, risk: Math.round(risk), level }
  }).sort((a, b) => b.risk - a.risk), [equipment])

  const high   = scored.filter(e => e.level === "High")
  const medium = scored.filter(e => e.level === "Medium")
  const low    = scored.filter(e => e.level === "Low")

  function riskColor(level: string) {
    return level === "High" ? "#ef4444" : level === "Medium" ? "#f59e0b" : "#22c55e"
  }

  function riskBadgeClass(level: string) {
    return level === "High" ? "badge badge-overdue" : level === "Medium" ? "badge badge-open" : "badge badge-closed"
  }

  return (
    <div className="page-content">
      <div className="section-header" style={{ marginBottom: 20 }}>
        <div>
          <h1>Predictive Maintenance</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 13, marginTop: 3 }}>
            Risk scoring based on service schedule + failure history
          </p>
        </div>
      </div>

      {/* Risk summary */}
      <div className="stat-grid" style={{ marginBottom: 20 }}>
        {[
          { label: "High Risk",   value: high.length,   icon: AlertTriangle, color: "#ef4444" },
          { label: "Medium Risk", value: medium.length, icon: Clock,         color: "#f59e0b" },
          { label: "Low Risk",    value: low.length,    icon: CheckCircle,   color: "#22c55e" },
          { label: "Total Equipment", value: equipment.length, icon: Wrench, color: "var(--green-bright)" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="stat-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div className="stat-label">{label}</div>
              <Icon size={14} color={color} />
            </div>
            <div className="stat-value" style={{ color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* High risk alert */}
      {high.length > 0 && (
        <div className="card" style={{ marginBottom: 18, background: "rgba(239,68,68,.06)", borderColor: "rgba(239,68,68,.3)" }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
            <AlertTriangle size={15} color="#ef4444" />
            <span style={{ fontWeight: 600, fontSize: 13, color: "#ef4444" }}>
              {high.length} equipment item{high.length > 1 ? "s" : ""} at HIGH risk — action required
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {high.map(eq => (
              <div key={eq.id} style={{ fontSize: 12, color: "var(--text-secondary)", paddingLeft: 24 }}>
                ⚠ <strong style={{ color: "var(--text-primary)" }}>{eq.name}</strong> — {eq.vessel} ·
                {eq.days <= 0 ? ` Overdue by ${Math.abs(eq.days)} days` : ` ${eq.days} days to service`} ·
                {eq.failCount} past failure{eq.failCount !== 1 ? "s" : ""}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Equipment risk table */}
      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
          <h3 style={{ fontSize: 13 }}>Equipment Risk Register</h3>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Tag</th>
                <th>Equipment</th>
                <th>Vessel</th>
                <th>System</th>
                <th>Last Service</th>
                <th>Next Service</th>
                <th style={{ textAlign: "right" }}>Days</th>
                <th style={{ textAlign: "right" }}>Failures</th>
                <th style={{ textAlign: "right" }}>Downtime (h)</th>
                <th style={{ textAlign: "right" }}>Cost (USD)</th>
                <th>Risk</th>
                <th style={{ minWidth: 100 }}>Risk Score</th>
              </tr>
            </thead>
            <tbody>
              {scored.map(eq => (
                <tr key={eq.id}>
                  <td style={{ fontFamily: "Courier New,monospace", fontSize: 11, color: "var(--green-bright)", fontWeight: 600 }}>{eq.tag}</td>
                  <td style={{ fontSize: 11, fontWeight: 500, color: "var(--text-primary)", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{eq.name}</td>
                  <td style={{ fontSize: 11 }}>{eq.vessel}</td>
                  <td style={{ fontSize: 11 }}>{eq.system}</td>
                  <td style={{ fontSize: 11 }}>{eq.lastServiceDate}</td>
                  <td style={{ fontSize: 11, color: eq.days <= 30 ? riskColor(eq.level) : "inherit" }}>{eq.nextServiceDate}</td>
                  <td style={{ textAlign: "right", fontWeight: 700, fontSize: 11, color: eq.days <= 0 ? "#ef4444" : eq.days <= 30 ? "#f59e0b" : "var(--text-secondary)" }}>
                    {eq.days <= 0 ? `${Math.abs(eq.days)}d OD` : `${eq.days}d`}
                  </td>
                  <td style={{ textAlign: "right", fontSize: 11 }}>{eq.failCount}</td>
                  <td style={{ textAlign: "right", fontSize: 11 }}>{eq.totalDowntime}</td>
                  <td style={{ textAlign: "right", fontFamily: "Courier New,monospace", fontSize: 11 }}>{eq.totalCost.toLocaleString()}</td>
                  <td><span className={riskBadgeClass(eq.level)}>{eq.level}</span></td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ flex: 1, height: 6, background: "var(--bg-raised)", borderRadius: 3 }}>
                        <div style={{ height: "100%", width: `${eq.risk}%`, background: riskColor(eq.level), borderRadius: 3 }} />
                      </div>
                      <span style={{ fontSize: 10, color: riskColor(eq.level), fontWeight: 700, minWidth: 24 }}>{eq.risk}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Failure history */}
      <div className="card" style={{ marginTop: 18, padding: 0 }}>
        <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
          <h3 style={{ fontSize: 13 }}>Failure History Log</h3>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Equipment</th>
                <th>Vessel</th>
                <th>Date</th>
                <th>Description</th>
                <th style={{ textAlign: "right" }}>Downtime (h)</th>
                <th style={{ textAlign: "right" }}>Cost (USD)</th>
              </tr>
            </thead>
            <tbody>
              {equipment.flatMap(eq =>
                eq.failureHistory.map((f, i) => (
                  <tr key={`${eq.id}-${i}`}>
                    <td style={{ fontSize: 11, fontWeight: 500, color: "var(--text-primary)" }}>{eq.name.split("—")[0].trim()}</td>
                    <td style={{ fontSize: 11 }}>{eq.vessel}</td>
                    <td style={{ fontSize: 11 }}>{f.date}</td>
                    <td style={{ fontSize: 11 }}>{f.description}</td>
                    <td style={{ textAlign: "right", fontSize: 11, color: "#f59e0b" }}>{f.downtime}</td>
                    <td style={{ textAlign: "right", fontFamily: "Courier New,monospace", fontSize: 11 }}>{f.cost.toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card" style={{ marginTop: 14, background: "rgba(15,155,15,.04)" }}>
        <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
          <Activity size={14} color="var(--green-bright)" style={{ flexShrink: 0, marginTop: 2 }} />
          <p style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.6 }}>
            Risk score is calculated from: days to next service (overdue = high weight), number of past failures, and total historical downtime.
            <strong style={{ color: "var(--text-primary)" }}> Score 0–100</strong> — High ≥70, Medium ≥40, Low &lt;40.
            Scores update automatically as you add NCRs and equipment history.
          </p>
        </div>
      </div>
    </div>
  )
}
