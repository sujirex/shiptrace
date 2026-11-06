"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "../context/ThemeContext"
import {
  LayoutDashboard, ClipboardList, BarChart2, BookOpen,
  Activity, Settings, Sun, Moon, Menu, X,
} from "lucide-react"
import { useEffect, useState } from "react"

const navItems = [
  { href: "/",                  label: "Dashboard",            icon: LayoutDashboard },
  { href: "/ncr",               label: "NCR Log",              icon: ClipboardList },
  { href: "/analytics",         label: "Analytics",            icon: BarChart2 },
  { href: "/lessons-learned",   label: "Lessons Learned",      icon: BookOpen },
  { href: "/predictive",        label: "Predictive Maint.",    icon: Activity },
  { href: "/settings",          label: "Settings",             icon: Settings },
]

function Brand({ onClick }: { onClick?: () => void }) {
  return (
    <Link href="/" className="side-brand" onClick={onClick} aria-label="ShipTrace home">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/ss-emblem.svg" alt="" width={36} height={36} />
      <span>
        <b>ShipTrace</b>
        <small>NCR intelligence</small>
      </span>
    </Link>
  )
}

export default function Sidebar() {
  const raw = usePathname()
  const pathname = raw.length > 1 ? raw.replace(/\/$/, "") : raw
  const { theme, toggle } = useTheme()
  const [open, setOpen] = useState(false)

  // Close the drawer on navigation
  useEffect(() => { setOpen(false) }, [raw])

  const themeBtn = (
    <button onClick={toggle} className="icon-btn" aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}>
      {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
    </button>
  )

  return (
    <>
      {/* Sidebar: fixed on desktop, slide-in drawer on mobile */}
      <aside className={`sidebar${open ? " open" : ""}`} aria-label="Main navigation">
        <Brand onClick={() => setOpen(false)} />
        <nav className="side-nav">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== "/" && pathname.startsWith(href))
            return (
              <Link key={href} href={href} onClick={() => setOpen(false)} className={`side-link${active ? " active" : ""}`}>
                <Icon size={15} />
                {label}
              </Link>
            )
          })}
        </nav>
        <div className="side-foot">
          <div className="side-foot-row">
            <span>v0.1 · Self-hosted</span>
            {themeBtn}
          </div>
          <a className="credit" href="https://sujikumar.com/" rel="author" title="Built by Suji Kumar C — Digital Maritime Engineer">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/ss-emblem.svg" alt="" width={20} height={20} />
            <span>Built by <b>Suji Kumar C</b></span>
          </a>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="mobile-bar">
        <Brand />
        <div style={{ display: "flex", gap: 8 }}>
          {themeBtn}
          <button onClick={() => setOpen(v => !v)} className="icon-btn" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open}>
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {open && <div className="drawer-backdrop" onClick={() => setOpen(false)} />}
    </>
  )
}
