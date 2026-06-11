"use client"
import { useMemo } from "react"
import { useData } from "../context/DataContext"
import { AlertTriangle, CheckCircle, Clock, TrendingUp, ClipboardList, BookOpen, Activity, BarChart2 } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const { ncrs, equipment } = useData()

  const stats = useMemo(() => {
    const open     = ncrs.filter(n => n.status === "Open").length
    const progress = ncrs.filter(n => n.status === "In Progress").length
    const overdue  = ncrs.filter(n => n.status === "Overdue").length
    const closed   = ncrs.filter(n => n.status === "Closed").length
    const critical = ncrs.filter(n => n.severity === "Critical" && n.status !== "Closed").length
    const totalCost = ncrs.reduce((s, n) => s + (n.cost ?? 0), 0)
    const withLL   = ncrs.filter(n => n.lessonLearned).length
    return { open, progress, overdue, closed, critical, totalCost, withLL }
  }, [ncrs])

  const recentNCRs = useMemo(() => [...ncrs].sort((a, b) => b.raisedDate.localeCompare(a.raisedDate)).slice(0, 6), [ncrs])

  const upcomingMaint = useMemo(() =>
    [...equipment]
      .sort((a, b) => a.nextServiceDate.localeCompare(b.nextServiceDate))
      .slice(0, 4),
    [equipment])

  function statusBadge(s: string) {
    const map: Record<string, string> = {
      "Open": "badge-open", "In Progress": "badge-progress",
      "Closed": "badge-closed", "Overdue": "badge-overdue"
    }
    return `badge ${map[s] ?? "badge-open"}`
  }

  function sevBadge(s: string) {
    const map: Record<string, string> = { Critical: "badge-critical", Major: "badge-major", Minor: "badge-minor" }
    return `badge ${map[s] ?? "badge-minor"}`
  }

  const daysUntil = (d: string) => {
    const diff = Math.ceil((new Date(d).getTime() - Date.now()) / 86400000)
    return diff
  }

  return (
    <div className="page-content">
      {/* Header */}
      <div className="section-header" style={{ marginBottom: 24 }}>
        <div>
          <h1>Dashboard</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 13, marginTop: 3 }}>
            NCR & defect overview — all vessels
          </p>
        </div>
        <Link href="/ncr/new" className="btn btn-primary">
          + New NCR
        </Link>
      </div>

      {/* KPI stat cards */}
      <div className="stat-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", marginBottom: 22 }}>
        {[
          { label: "Open NCRs",       value: stats.open,     icon: ClipboardList, color: "var(--status-open)" },
          { label: "In Progress",     value: stats.progress, icon: Clock,         color: "var(--status-progress)" },
          { label: "Overdue",         value: stats.overdue,  icon: AlertTriangle, color: "var(--status-overdue)" },
          { label: "Closed (Total)",  value: stats.closed,   icon: CheckCircle,   color: "var(--status-closed)" },
          { label: "Critical Active", value: stats.critical, icon: AlertTriangle, color: "#ef4444" },
          { label: "Lessons Logged",  value: stats.withLL,   icon: BookOpen,      color: "var(--green-bright)" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="stat-card">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <div className="stat-label">{label}</div>
              <Icon size={14} color={color} />
            </div>
            <div className="stat-value" style={{ fontSize: 30, color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Cost of Poor Quality */}
      <div className="card" style={{ marginBottom: 20, padding: "14px 20px", display: "flex", alignItems: "center", gap: 14 }}>
        <TrendingUp size={22} color="var(--green-bright)" />
        <div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: ".06em" }}>Total Estimated Rework Cost</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "var(--green-bright)", fontFamily: "Courier New, monospace" }} suppressHydrationWarning>
            ₹{stats.totalCost.toLocaleString()}
          </div>
        </div>
        <div style={{ marginLeft: "auto", fontSize: 12, color: "var(--text-secondary)" }} suppressHydrationWarning>
          Across {ncrs.length} NCRs · ₹{ncrs.length > 0 ? Math.round(stats.totalCost / ncrs.length).toLocaleString() : 0} avg/NCR
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 20 }}>
        {/* Recent NCRs */}
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h3 style={{ fontSize: 13 }}>Recent NCRs</h3>
            <Link href="/ncr" style={{ fontSize: 11, color: "var(--green-bright)" }}>View all →</Link>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Vessel</th>
                  <th>Type</th>
                  <th>Sev.</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentNCRs.map(n => (
                  <tr key={n.id}>
                    <td style={{ color: "var(--green-bright)", fontFamily: "Courier New, monospace", fontWeight: 600, fontSize: 11 }}>{n.id}</td>
                    <td style={{ fontSize: 11 }}>{n.vessel.split(" ").slice(-1)[0]}</td>
                    <td style={{ fontSize: 11 }}>{n.defectType}</td>
                    <td><span className={sevBadge(n.severity)}>{n.severity}</span></td>
                    <td><span className={statusBadge(n.status)}>{n.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Upcoming Maintenance */}
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h3 style={{ fontSize: 13 }}>Upcoming Maintenance</h3>
            <Link href="/predictive" style={{ fontSize: 11, color: "var(--green-bright)" }}>View all →</Link>
          </div>
          <div style={{ padding: "8px 0" }}>
            {upcomingMaint.map(eq => {
              const days = daysUntil(eq.nextServiceDate)
              const urgent = days <= 30
              return (
                <div key={eq.id} style={{ padding: "10px 16px", borderBottom: "1px solid rgba(15,155,15,.07)", display: "flex", alignItems: "center", gap: 10 }}>
                  <Activity size={13} color={urgent ? "var(--status-overdue)" : "var(--green)"} style={{ flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, color: "var(--text-primary)", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{eq.name}</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{eq.vessel}</div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: urgent ? "var(--status-overdue)" : "var(--green-bright)" }}>
                      {days <= 0 ? "Overdue" : `${days}d`}
                    </div>
                    <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{eq.nextServiceDate}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
        {[
          { href: "/ncr",             label: "NCR Log",              icon: ClipboardList, desc: "Log and manage defects" },
          { href: "/analytics",       label: "Analytics",            icon: BarChart2,     desc: "Pareto, trends, KPIs" },
          { href: "/lessons-learned", label: "Lessons Learned",      icon: BookOpen,      desc: "Pattern knowledge base" },
          { href: "/predictive",      label: "Predictive Maint.",    icon: Activity,      desc: "Equipment risk scoring" },
        ].map(({ href, label, icon: Icon, desc }) => (
          <Link key={href} href={href} style={{ textDecoration: "none" }}>
            <div className="card" style={{ cursor: "pointer", display: "flex", gap: 12, alignItems: "flex-start" }}>
              <Icon size={18} color="var(--green-bright)" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <div style={{ fontWeight: 600, fontSize: 13, color: "var(--text-primary)" }}>{label}</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>{desc}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
