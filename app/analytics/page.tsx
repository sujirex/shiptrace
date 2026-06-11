"use client"
import { useMemo } from "react"
import { useData } from "../../context/DataContext"
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, PieChart, Pie, Cell, Legend
} from "recharts"

const GREEN  = "#0f9b0f"
const GREEN2 = "#18d418"
const AMBER  = "#f59e0b"
const RED    = "#ef4444"
const BLUE   = "#3b82f6"

const COLORS = [GREEN, AMBER, RED, BLUE, "#8b5cf6", "#06b6d4", "#ec4899"]

export default function AnalyticsPage() {
  const { ncrs } = useData()

  // Pareto — defect type
  const paretoData = useMemo(() => {
    const counts: Record<string, number> = {}
    ncrs.forEach(n => { counts[n.defectType] = (counts[n.defectType] ?? 0) + 1 })
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([type, count]) => ({ type, count }))
  }, [ncrs])

  // Monthly trend (last 6 months)
  const trendData = useMemo(() => {
    const months: Record<string, { raised: number; closed: number }> = {}
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = d.toISOString().slice(0, 7)
      months[key] = { raised: 0, closed: 0 }
    }
    ncrs.forEach(n => {
      const rk = n.raisedDate.slice(0, 7)
      if (rk in months) months[rk].raised++
      if (n.closedDate) {
        const ck = n.closedDate.slice(0, 7)
        if (ck in months) months[ck].closed++
      }
    })
    return Object.entries(months).map(([month, v]) => ({ month: month.slice(5), ...v }))
  }, [ncrs])

  // Severity breakdown — pie
  const severityData = useMemo(() => {
    const counts: Record<string, number> = { Critical: 0, Major: 0, Minor: 0 }
    ncrs.forEach(n => { counts[n.severity] = (counts[n.severity] ?? 0) + 1 })
    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  }, [ncrs])

  // Department KPIs
  const deptData = useMemo(() => {
    const d: Record<string, { total: number; closed: number; cost: number }> = {}
    ncrs.forEach(n => {
      if (!d[n.department]) d[n.department] = { total: 0, closed: 0, cost: 0 }
      d[n.department].total++
      if (n.status === "Closed") d[n.department].closed++
      d[n.department].cost += n.cost ?? 0
    })
    return Object.entries(d).map(([dept, v]) => ({
      dept,
      total: v.total,
      closed: v.closed,
      open: v.total - v.closed,
      closeRate: v.total > 0 ? Math.round((v.closed / v.total) * 100) : 0,
      cost: v.cost,
    })).sort((a, b) => b.total - a.total)
  }, [ncrs])

  // Root cause breakdown
  const rootCauseData = useMemo(() => {
    const counts: Record<string, number> = {}
    ncrs.forEach(n => { counts[n.rootCause] = (counts[n.rootCause] ?? 0) + 1 })
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value }))
  }, [ncrs])

  const totalCost = ncrs.reduce((s, n) => s + (n.cost ?? 0), 0)
  const avgClose = useMemo(() => {
    const closed = ncrs.filter(n => n.closedDate)
    if (!closed.length) return 0
    const days = closed.map(n => Math.ceil((new Date(n.closedDate!).getTime() - new Date(n.raisedDate).getTime()) / 86400000))
    return Math.round(days.reduce((a, b) => a + b, 0) / days.length)
  }, [ncrs])

  const tt = { contentStyle: { background: "var(--bg-card)", border: "1px solid var(--border)", fontSize: 11 }, labelStyle: { color: "var(--text-primary)" } }

  return (
    <div className="page-content">
      <div className="section-header" style={{ marginBottom: 22 }}>
        <div>
          <h1>Analytics</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 13, marginTop: 3 }}>Quality KPIs — {ncrs.length} NCRs total</p>
        </div>
      </div>

      {/* Top KPIs */}
      <div className="stat-grid" style={{ marginBottom: 22 }}>
        {[
          { label: "Total NCRs",       value: ncrs.length,                          color: GREEN },
          { label: "Close Rate",        value: `${ncrs.length > 0 ? Math.round((ncrs.filter(n=>n.status==="Closed").length/ncrs.length)*100) : 0}%`, color: GREEN2 },
          { label: "Avg Days to Close", value: `${avgClose}d`,                       color: AMBER },
          { label: "Total Rework Cost", value: `$${(totalCost/1000).toFixed(1)}k`,   color: RED },
        ].map(({ label, value, color }) => (
          <div key={label} className="stat-card">
            <div className="stat-label">{label}</div>
            <div className="stat-value" style={{ color }}>{value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 18 }}>
        {/* Pareto */}
        <div className="card">
          <h3 style={{ fontSize: 13, marginBottom: 14 }}>Defect Type Pareto</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={paretoData} margin={{ top: 0, right: 10, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,155,15,.1)" />
              <XAxis dataKey="type" tick={{ fontSize: 10, fill: "var(--text-muted)" }} angle={-30} textAnchor="end" interval={0} />
              <YAxis tick={{ fontSize: 10, fill: "var(--text-muted)" }} />
              <Tooltip {...tt} />
              <Bar dataKey="count" fill={GREEN} radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly trend */}
        <div className="card">
          <h3 style={{ fontSize: 13, marginBottom: 14 }}>Monthly Trend — Raised vs Closed</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={trendData} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,155,15,.1)" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "var(--text-muted)" }} />
              <YAxis tick={{ fontSize: 10, fill: "var(--text-muted)" }} />
              <Tooltip {...tt} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="raised" stroke={AMBER} strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="closed" stroke={GREEN} strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 18 }}>
        {/* Severity pie */}
        <div className="card">
          <h3 style={{ fontSize: 13, marginBottom: 14 }}>Severity Breakdown</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={severityData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={false}
                style={{ fontSize: 10, fill: "var(--text-muted)" }}>
                {severityData.map((_, i) => <Cell key={i} fill={[RED, AMBER, GREEN][i] ?? COLORS[i]} />)}
              </Pie>
              <Tooltip {...tt} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Root cause */}
        <div className="card">
          <h3 style={{ fontSize: 13, marginBottom: 14 }}>Root Cause Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={rootCauseData} layout="vertical" margin={{ top: 0, right: 40, left: 10, bottom: 0 }}>
              <XAxis type="number" tick={{ fontSize: 10, fill: "var(--text-muted)" }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "var(--text-muted)" }} width={110} />
              <Tooltip {...tt} />
              <Bar dataKey="value" fill={BLUE} radius={[0,3,3,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Department table */}
      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
          <h3 style={{ fontSize: 13 }}>Department Quality KPIs</h3>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Department</th>
                <th style={{ textAlign: "right" }}>Total NCRs</th>
                <th style={{ textAlign: "right" }}>Open</th>
                <th style={{ textAlign: "right" }}>Closed</th>
                <th style={{ textAlign: "right" }}>Close Rate</th>
                <th style={{ textAlign: "right" }}>Rework Cost</th>
                <th>Quality Bar</th>
              </tr>
            </thead>
            <tbody>
              {deptData.map(d => (
                <tr key={d.dept}>
                  <td style={{ fontWeight: 600 }}>{d.dept}</td>
                  <td style={{ textAlign: "right" }}>{d.total}</td>
                  <td style={{ textAlign: "right", color: d.open > 0 ? AMBER : "inherit" }}>{d.open}</td>
                  <td style={{ textAlign: "right", color: GREEN }}>{d.closed}</td>
                  <td style={{ textAlign: "right", fontWeight: 700, color: d.closeRate >= 80 ? GREEN : d.closeRate >= 50 ? AMBER : RED }}>
                    {d.closeRate}%
                  </td>
                  <td style={{ textAlign: "right", fontFamily: "Courier New,monospace", fontSize: 11 }}>
                    ${d.cost.toLocaleString()}
                  </td>
                  <td style={{ width: 120 }}>
                    <div style={{ height: 6, background: "var(--bg-raised)", borderRadius: 3 }}>
                      <div style={{ height: "100%", width: `${d.closeRate}%`, background: d.closeRate >= 80 ? GREEN : d.closeRate >= 50 ? AMBER : RED, borderRadius: 3 }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
