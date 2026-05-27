"use client"

import { motion } from "framer-motion"
import {
  Flame,
  Trophy,
  Star,
  CheckCircle,
  Play,
  FileText,
  FlaskConical,
  MessageCircle,
  BarChart3,
  Sparkles,
  BookOpen,
} from "lucide-react"

interface DashboardProps {
  user: { name: string; year: number; track: string }
  stats: {
    streak: number
    xp: number
    level: number
    problemsSolved: number
    criteria: Record<string, number>
  }
  setPage: (page: string) => void
}

const CRITERIA_INFO: Record<string, { title: string; color: string; bg: string }> = {
  A: { title: "Knowing & Understanding", color: "#3B82F6", bg: "bg-blue-500" },
  B: { title: "Investigating Patterns", color: "#EC4899", bg: "bg-pink-500" },
  C: { title: "Communicating", color: "#10B981", bg: "bg-emerald-500" },
  D: { title: "Applying to Real Life", color: "#F97316", bg: "bg-orange-500" },
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
}

export default function Dashboard({ user, stats, setPage }: DashboardProps) {
  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return "Good morning"
    if (h < 17) return "Good afternoon"
    return "Good evening"
  }

  const quotes = [
    "Mathematics is the music of reason. — James Joseph Sylvester",
    "Pure mathematics is, in its way, the poetry of logical ideas. — Albert Einstein",
    "The only way to learn mathematics is to do mathematics. — Paul Halmos",
  ]
  const todayQuote = quotes[new Date().getDate() % quotes.length]

  return (
    <motion.div
      className="max-w-[1400px] w-full"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Hero Banner */}
      <motion.div
        variants={itemVariants}
        className="relative bg-gradient-to-br from-primary via-primary-2 to-primary-3 text-white rounded-[20px] p-9 overflow-hidden mb-7 flex items-center justify-between gap-6"
      >
        <div className="absolute right-[-80px] top-[-80px] w-80 h-80 bg-[radial-gradient(circle,rgba(212,175,55,.25)_0%,transparent_70%)] rounded-full" />
        <div className="absolute left-[-40px] bottom-[-100px] w-70 h-70 bg-[radial-gradient(circle,rgba(255,255,255,.05)_0%,transparent_70%)] rounded-full" />

        <div className="relative z-10 flex-1">
          <div className="text-xs tracking-[.12em] uppercase text-amber-500 mb-2 font-semibold">
            {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
          </div>
          <h1 className="font-serif text-[38px] leading-[1.1] mb-2.5 font-extrabold">
            {greeting()},{" "}
            <span className="bg-gradient-to-r from-amber-500 to-amber-300 bg-clip-text text-transparent">
              {user.name.split(" ")[0]}
            </span>
            .
          </h1>
          <p className="text-white/[.78] text-[15px] max-w-[580px] mb-5 leading-relaxed">
            You&apos;re studying MYP Year {user.year} · {user.track} Track. Every problem here is graded against IB
            criterion descriptors, out of 8.
          </p>
          <div className="flex gap-2.5 flex-wrap relative">
            <button
              onClick={() => setPage("qbank")}
              className="inline-flex items-center gap-2 px-5 py-[11px] rounded-[10px] bg-gradient-to-br from-primary to-primary-2 text-white font-semibold text-sm border border-amber-500/30 hover:-translate-y-px hover:shadow-[0_8px_24px_rgba(212,175,55,.25)] transition-all cursor-pointer"
            >
              <Play size={14} /> Quick 5-Question Test
            </button>
            <button
              onClick={() => setPage("papers")}
              className="inline-flex items-center gap-2 px-5 py-[11px] rounded-[10px] bg-white/[.12] border border-white/30 text-white backdrop-blur-sm font-semibold text-sm hover:bg-white/20 transition-all cursor-pointer"
            >
              <FileText size={14} /> Take a Practice Paper
            </button>
          </div>
        </div>

        <div className="relative z-10 opacity-85 hidden lg:block">
          <svg viewBox="0 0 200 200" width="180" height="180">
            <defs>
              <linearGradient id="hg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#D4AF37" stopOpacity="0.9" />
                <stop offset="1" stopColor="#F4D783" stopOpacity="0.3" />
              </linearGradient>
            </defs>
            <circle cx="100" cy="100" r="80" fill="none" stroke="url(#hg)" strokeWidth="1.5" opacity="0.6" />
            <circle cx="100" cy="100" r="60" fill="none" stroke="url(#hg)" strokeWidth="1" opacity="0.5" />
            <circle cx="100" cy="100" r="40" fill="none" stroke="url(#hg)" strokeWidth="0.8" opacity="0.4" />
            <polygon points="100,40 130,90 100,140 70,90" fill="none" stroke="#D4AF37" strokeWidth="1.2" opacity="0.6" />
            <text x="100" y="105" textAnchor="middle" fontFamily="Playfair Display" fontSize="32" fill="#D4AF37" opacity="0.85">
              &#x2211;
            </text>
          </svg>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-[18px] mb-7">
        {[
          { icon: Flame, num: stats.streak, label: "Day Streak" },
          { icon: Trophy, num: stats.xp, label: "Total XP" },
          { icon: Star, num: stats.level, label: "Scholar Level" },
          { icon: CheckCircle, num: stats.problemsSolved, label: "Problems Solved" },
        ].map((s, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -2 }}
            className="bg-white border border-line rounded-[14px] p-[18px] transition-shadow hover:shadow-[0_4px_6px_-1px_rgba(11,20,55,.06),0_10px_25px_-5px_rgba(11,20,55,.10)]"
          >
            <div className="w-10 h-10 rounded-[10px] grid place-items-center mb-3 bg-gradient-to-br from-amber-50 to-amber-100">
              <s.icon size={22} className="text-amber-600" />
            </div>
            <div className="font-serif text-[32px] font-extrabold leading-none text-primary">{s.num}</div>
            <div className="text-xs text-muted-2 uppercase tracking-[.1em] font-semibold mt-1">{s.label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Criterion Performance */}
      <motion.div variants={itemVariants}>
        <h2 className="font-serif text-[26px] font-bold text-navy mt-9 mb-1.5">Criterion Performance</h2>
        <p className="text-muted text-sm mb-[18px]">Your IB MYP criterion averages — each problem is graded 0-8 against descriptors.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
          {(["A", "B", "C", "D"] as const).map((c) => {
            const info = CRITERIA_INFO[c]
            const score = stats.criteria[c] || 0
            const pct = (score / 8) * 100
            return (
              <div key={c} className="bg-white border border-line rounded-[14px] p-[18px_20px]">
                <div className="flex items-center gap-3.5 mb-3">
                  <div
                    className="w-[38px] h-[38px] rounded-[10px] grid place-items-center text-amber-500 font-serif font-extrabold text-lg"
                    style={{ background: `linear-gradient(135deg, ${info.color}22, ${info.color}11)` }}
                  >
                    {c}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-navy text-sm">Criterion {c}</div>
                    <div className="text-[11px] text-muted mt-px">{info.title}</div>
                  </div>
                  <div className="font-serif text-[26px] font-extrabold text-navy">
                    {score.toFixed(1)}
                    <span className="text-[13px] text-muted font-normal">/8</span>
                  </div>
                </div>
                <div className="h-2 bg-surface-2 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg, ${info.color}, ${info.color}99)` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </motion.div>

      {/* Continue Learning */}
      <motion.div variants={itemVariants}>
        <h2 className="font-serif text-[26px] font-bold text-navy mt-9 mb-1.5">Continue Learning</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 mb-7">
          {[
            { icon: BookOpen, title: "Question Bank", desc: "5 random questions across any unit. Timed or untimed.", page: "qbank" },
            { icon: FileText, title: "Practice Papers", desc: "Full mock exams. Paper 1 (no-calc) or Paper 2 (calc).", page: "papers" },
            { icon: FlaskConical, title: "Investigations", desc: "9-step IB Criterion B inquiry tasks. Discover patterns.", page: "investigations" },
            { icon: Star, title: "Criterion Tests", desc: "Target a specific criterion with focused practice.", page: "criterion" },
            { icon: MessageCircle, title: "AI Teacher Board", desc: "Ask any maths question. Voice input. Diagram support.", page: "teacher" },
            { icon: BarChart3, title: "My Progress", desc: "Attempt history. Earned badges. Strengths & weak areas.", page: "progress" },
          ].map((card, i) => (
            <motion.button
              key={i}
              whileHover={{ y: -4 }}
              onClick={() => setPage(card.page)}
              className="bg-white border border-line rounded-[14px] p-[22px_20px] text-left transition-all hover:shadow-[0_14px_28px_rgba(11,20,55,.12)] hover:border-amber-500 cursor-pointer"
            >
              <card.icon size={26} className="text-amber-600 mb-3" />
              <div className="font-serif font-bold text-navy text-[17px] mb-1">{card.title}</div>
              <div className="text-[12.5px] text-muted leading-relaxed">{card.desc}</div>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Quote */}
      <motion.div
        variants={itemVariants}
        className="bg-gradient-to-br from-amber-50/80 to-white border border-amber-500 rounded-[14px] p-[22px_26px] mt-7"
      >
        <Sparkles size={20} className="text-amber-600" />
        <div className="font-serif italic text-[17px] text-navy my-2.5 leading-relaxed">
          &ldquo;{todayQuote.split(" — ")[0]}&rdquo;
        </div>
        <div className="text-muted text-[13px]">— {todayQuote.split(" — ")[1]}</div>
      </motion.div>
    </motion.div>
  )
}
