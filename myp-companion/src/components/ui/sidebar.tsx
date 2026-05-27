"use client"

import {
  LayoutDashboard,
  BookOpen,
  FileText,
  FlaskConical,
  MessageCircle,
  BarChart3,
  Settings,
  Sparkles,
  Star,
  LogOut,
} from "lucide-react"

interface SidebarProps {
  page: string
  setPage: (page: string) => void
  user: {
    name: string
    year: number
    track: string
    email?: string
    school?: string
    role?: string
  }
  onSignOut?: () => void
}

const NAV_SECTIONS = [
  {
    label: "Learn",
    items: [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
      { id: "teacher", label: "AI Teacher", icon: MessageCircle },
    ],
  },
  {
    label: "Practice",
    items: [
      { id: "qbank", label: "Question Bank", icon: Sparkles },
      { id: "papers", label: "Practice Papers", icon: FileText },
      { id: "investigations", label: "Investigations", icon: FlaskConical },
      { id: "criterion", label: "Criterion Tests", icon: Star },
    ],
  },
  {
    label: "Account",
    items: [
      { id: "progress", label: "My Progress", icon: BarChart3 },
      { id: "settings", label: "Settings", icon: Settings },
    ],
  },
]

export default function Sidebar({ page, setPage, user, onSignOut }: SidebarProps) {
  return (
    <aside className="w-[264px] sticky top-0 h-screen overflow-y-auto flex flex-col border-r border-amber-500/[.18] bg-[radial-gradient(ellipse_600px_300px_at_top,rgba(212,175,55,0.12),transparent_60%),radial-gradient(ellipse_400px_400px_at_bottom_right,rgba(212,175,55,0.08),transparent_60%),linear-gradient(180deg,#060B24_0%,#0B1437_40%,#15224F_100%)]">
      <div className="p-[26px_18px_18px] flex-1 flex flex-col min-h-0">
        {/* Brand */}
        <div className="flex items-center gap-3 px-1.5 pb-[22px] border-b border-amber-500/[.15] mb-[18px] relative">
          <div className="w-[46px] h-[46px] rounded-[13px] bg-[radial-gradient(circle_at_30%_30%,#F4D783,#D4AF37_70%,#B8941F)] grid place-items-center flex-shrink-0 shadow-[0_0_0_1px_rgba(212,175,55,.4),0_6px_18px_rgba(212,175,55,.35),inset_0_1px_0_rgba(255,255,255,.4)] relative overflow-hidden">
            <svg viewBox="0 0 40 40" width="28" height="28" fill="none">
              <path d="M8 30 L8 12 L14 12 L20 22 L26 12 L32 12 L32 30 L28 30 L28 18 L22 27 L18 27 L12 18 L12 30 Z" fill="#0B1437"/>
              <circle cx="20" cy="34" r="2" fill="#0B1437" opacity="0.5"/>
            </svg>
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none" />
          </div>
          <div className="leading-[1.15]">
            <div className="font-serif font-extrabold text-lg text-white tracking-tight">MYP Companion</div>
            <div className="text-[10px] tracking-[.14em] text-amber-500 uppercase font-semibold mt-0.5">{user.track} · Year {user.year}</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1">
          {NAV_SECTIONS.map((section, si) => (
            <div key={si}>
              <div className="text-[10px] tracking-[.16em] uppercase text-amber-500/55 mx-2 mt-4 mb-2 font-bold first:mt-0">
                {section.label}
              </div>
              {section.items.map((item) => {
                const Icon = item.icon
                const active = page === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => setPage(item.id)}
                    className={`flex items-center gap-[13px] w-full text-left px-3.5 py-[11px] rounded-[10px] text-[13.5px] font-medium mb-0.5 transition-all duration-200 border border-transparent relative ${
                      active
                        ? "bg-gradient-to-r from-amber-500/[.24] via-amber-500/[.04] to-transparent text-white border-amber-500/30 shadow-[inset_3px_0_0_#D4AF37,0_4px_14px_rgba(212,175,55,.12)] font-semibold"
                        : "text-white/[.72] hover:bg-white/[.04] hover:text-white hover:border-white/[.06] hover:translate-x-0.5"
                    }`}
                  >
                    <Icon size={18} className={`flex-shrink-0 transition-colors ${active ? "text-amber-500" : ""}`} />
                    <span>{item.label}</span>
                    {active && (
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 w-[5px] h-[5px] rounded-full bg-amber-500 shadow-[0_0_8px_#D4AF37]" />
                    )}
                  </button>
                )
              })}
            </div>
          ))}
        </nav>

        {/* Profile */}
        <div className="mt-auto p-3.5 bg-gradient-to-br from-amber-500/10 to-white/[.02] rounded-xl border border-amber-500/[.18] flex items-center gap-3 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-amber-300 grid place-items-center font-bold text-primary text-sm flex-shrink-0">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-semibold text-white">{user.name}</div>
            <div className="text-[11px] text-white/50 truncate">{user.email || user.school || "Signed in"}</div>
          </div>
          {onSignOut && (
            <button
              onClick={onSignOut}
              title="Sign out"
              className="text-white/50 hover:text-white/80 transition-colors p-1"
            >
              <LogOut size={14} />
            </button>
          )}
        </div>
      </div>
    </aside>
  )
}
