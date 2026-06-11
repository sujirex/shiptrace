"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "../context/ThemeContext"
import {
  LayoutDashboard, ClipboardList, BarChart2, BookOpen,
  Activity, Settings, Sun, Moon, Menu, X, Shield
} from "lucide-react"
import { useState } from "react"

const navItems = [
  { href: "/",                  label: "Dashboard",            icon: LayoutDashboard },
  { href: "/ncr",               label: "NCR Log",              icon: ClipboardList },
  { href: "/analytics",         label: "Analytics",            icon: BarChart2 },
  { href: "/lessons-learned",   label: "Lessons Learned",      icon: BookOpen },
  { href: "/predictive",        label: "Predictive Maint.",    icon: Activity },
  { href: "/settings",          label: "Settings",             icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { theme, toggle } = useTheme()
  const [mobileOpen, setMobileOpen] = useState(false)

  const NavContent = () => (
    <>
      {/* Logo */}
      <div style={{
        padding: "20px 18px 16px",
        borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <div style={{
          width: 34, height: 34, borderRadius: 8, flexShrink: 0,
          background: "linear-gradient(135deg, #0f9b0f, #000000)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Shield size={18} color="#e8f5e8" />
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text-primary)", letterSpacing: ".03em" }}>ShipTrace</div>
          <div style={{ fontSize: 10, color: "var(--text-muted)", letterSpacing: ".04em" }}>NCR INTELLIGENCE</div>
        </div>
      </div>

      {/* Nav links */}
      <nav style={{ flex: 1, padding: "12px 10px", display: "flex", flexDirection: "column", gap: 2 }}>
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/" && pathname.startsWith(href))
          return (
            <Link key={href} href={href}
              onClick={() => setMobileOpen(false)}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "8px 10px", borderRadius: "var(--radius-sm)",
                color: active ? "var(--green-bright)" : "var(--text-secondary)",
                background: active ? "rgba(15,155,15,0.15)" : "transparent",
                border: active ? "1px solid rgba(15,155,15,0.25)" : "1px solid transparent",
                fontSize: 12, fontWeight: active ? 600 : 400,
                textDecoration: "none", transition: "all 0.15s",
              }}
            >
              <Icon size={15} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom: theme + branding */}
      <div style={{ padding: "10px 14px", borderTop: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontSize: 10, color: "var(--text-muted)" }}>v0.1 · Self-Hosted</span>
          <button onClick={toggle} style={{
            background: "var(--bg-raised)", border: "1px solid var(--border)",
            borderRadius: "var(--radius-sm)", padding: "5px 8px", cursor: "pointer",
            color: "var(--text-secondary)", display: "flex", alignItems: "center",
          }}>
            {theme === "dark" ? <Sun size={13} /> : <Moon size={13} />}
          </button>
        </div>
        <div style={{ fontSize: 9, color: "var(--text-muted)", letterSpacing: ".04em", lineHeight: 1.5 }}>
          Built by{" "}
          <span style={{ background: "linear-gradient(90deg,#0f9b0f,#18d418)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontWeight: 700 }}>
            Suji Kumar
          </span>
        </div>
      </div>
    </>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="sidebar" style={{ display: "flex", flexDirection: "column" }}>
        <NavContent />
      </aside>

      {/* Mobile top bar */}
      <div style={{
        display: "none",
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 200,
        background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)",
        borderBottom: "1px solid var(--border)",
        padding: "10px 16px", alignItems: "center", justifyContent: "space-between",
      }} className="mobile-bar">
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Shield size={18} color="var(--green-bright)" />
          <span style={{ fontWeight: 700, fontSize: 14, color: "var(--text-primary)" }}>ShipTrace</span>
        </div>
        <button onClick={() => setMobileOpen(v => !v)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-primary)" }}>
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div style={{
          position: "fixed", top: 44, left: 0, right: 0, bottom: 0, zIndex: 150,
          background: "rgba(0,0,0,0.95)", backdropFilter: "blur(8px)",
          display: "flex", flexDirection: "column",
          borderTop: "1px solid var(--border)",
        }}>
          <NavContent />
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .sidebar { display: none !important; }
          .mobile-bar { display: flex !important; }
          .main-content { margin-left: 0 !important; padding-top: 60px !important; }
        }
      `}</style>
    </>
  )
}
