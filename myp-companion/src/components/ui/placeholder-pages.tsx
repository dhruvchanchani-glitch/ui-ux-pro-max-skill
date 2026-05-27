"use client"

import { motion } from "framer-motion"
import {
  Sparkles,
  FileText,
  FlaskConical,
  Star,
  MessageCircle,
  BarChart3,
  Settings,
  Play,
  BookOpen,
  Flame,
  Trophy,
  CheckCircle,
  Lock,
} from "lucide-react"

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
}

interface PageProps {
  user: { name: string; year: number; track: string }
  setPage?: (page: string) => void
  stats?: {
    streak: number
    xp: number
    level: number
    problemsSolved: number
    criteria: Record<string, number>
    criteriaAttempts?: Record<string, number>
  }
}

function HeroBanner({
  eyebrow,
  title,
  subtitle,
  icon,
  children,
}: {
  eyebrow: string
  title: string
  subtitle: string
  icon?: React.ReactNode
  children?: React.ReactNode
}) {
  return (
    <motion.div
      variants={itemVariants}
      className="relative bg-gradient-to-br from-primary via-primary-2 to-primary-3 text-white rounded-[20px] p-9 overflow-hidden mb-7 flex items-center justify-between gap-6"
    >
      <div className="absolute right-[-80px] top-[-80px] w-80 h-80 bg-[radial-gradient(circle,rgba(212,175,55,.25)_0%,transparent_70%)] rounded-full" />
      <div className="relative z-10 flex-1">
        <div className="text-xs tracking-[.12em] uppercase text-amber-500 mb-2 font-semibold">{eyebrow}</div>
        <h1 className="font-serif text-[38px] leading-[1.1] mb-2.5 font-extrabold">{title}</h1>
        <p className="text-white/[.78] text-[15px] max-w-[580px] mb-5 leading-relaxed">{subtitle}</p>
        {children}
      </div>
      {icon && <div className="relative z-10 opacity-85 hidden lg:block">{icon}</div>}
    </motion.div>
  )
}

export function QuestionBank({ user }: PageProps) {
  const units = [
    { name: "Number", icon: "🔢", subtopics: ["Integers", "Fractions", "Decimals", "Percentages"] },
    { name: "Algebra", icon: "𝒙", subtopics: ["Patterns", "Expressions", "Equations", "Sequences"] },
    { name: "Geometry", icon: "△", subtopics: ["Area & Perimeter", "Angles", "2D Shapes", "Symmetry"] },
    { name: "Statistics & Probability", icon: "📊", subtopics: ["Mean, Median, Mode", "Data Display", "Probability"] },
    { name: "Measurement", icon: "📏", subtopics: ["Unit Conversion", "Time", "Length and Mass"] },
  ]

  return (
    <motion.div className="max-w-[1400px] w-full" variants={containerVariants} initial="hidden" animate="show">
      <HeroBanner
        eyebrow={`Question Bank · Year ${user.year} · ${user.track}`}
        title="Practice your way."
        subtitle="Choose any unit, any band (1-2 easy to 7-8 multi-part), any number of questions. Every question is freshly generated, graded out of 8 against IB MYP descriptors."
        icon={
          <svg viewBox="0 0 200 200" width="160" height="160">
            <rect x="40" y="40" width="120" height="120" rx="14" fill="none" stroke="#D4AF37" strokeWidth="1.5" opacity="0.5" />
            <text x="100" y="118" textAnchor="middle" fontFamily="Playfair Display" fontSize="42" fill="#D4AF37" opacity="0.8">&#x221e;</text>
            <circle cx="100" cy="100" r="78" fill="none" stroke="#D4AF37" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.4" />
          </svg>
        }
      />

      <motion.div variants={itemVariants}>
        <h2 className="font-serif text-[26px] font-bold text-navy mt-2 mb-1.5">Units for Year {user.year}</h2>
        <p className="text-muted text-sm mb-[18px]">{units.length} units · choose a unit to configure your practice session</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {units.map((unit, i) => (
          <motion.button
            key={i}
            variants={itemVariants}
            whileHover={{ y: -4 }}
            className="bg-white border border-line rounded-[16px] p-[22px] text-left transition-all hover:shadow-[0_16px_32px_rgba(11,20,55,.12)] hover:border-amber-500 cursor-pointer relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-amber-300" />
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-primary-2 grid place-items-center mb-3 text-lg">
              {unit.icon}
            </div>
            <div className="font-serif font-bold text-lg text-navy mb-1">{unit.name}</div>
            <div className="text-xs text-muted mb-3">{unit.subtopics.length} subtopics</div>
            <div className="flex flex-wrap gap-1">
              {unit.subtopics.map((s, j) => (
                <span key={j} className="text-[11px] px-2.5 py-1 bg-surface-2 text-navy rounded-full">{s}</span>
              ))}
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}

export function PracticePapers({ user }: PageProps) {
  return (
    <motion.div className="max-w-[1400px] w-full" variants={containerVariants} initial="hidden" animate="show">
      <HeroBanner
        eyebrow={`Practice Papers · Year ${user.year} · ${user.track}`}
        title="Full IB-style exam papers."
        subtitle="Sit a complete mock under timed conditions. Auto-graded across criteria A-D, with examiner-style feedback and model answers."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-[18px]">
        {[
          { num: 1, calc: false, time: 45, qs: 8, criteria: "A & C", desc: "Tests pure knowledge, conceptual understanding, and mathematical communication." },
          { num: 2, calc: true, time: 60, qs: 10, criteria: "B & D", desc: "Tests pattern investigation and real-world application. Calculator available." },
        ].map((p) => (
          <motion.div
            key={p.num}
            variants={itemVariants}
            whileHover={{ y: -4 }}
            className="bg-white border border-line rounded-[16px] p-8 transition-all hover:shadow-[0_14px_28px_rgba(11,20,55,.12)] hover:border-amber-500 cursor-pointer"
          >
            <div className="flex justify-between items-start mb-3.5">
              <FileText size={32} className="text-amber-600" />
              <span className={`text-[11px] px-2.5 py-1 rounded-full font-bold tracking-[.06em] uppercase ${p.calc ? "bg-gradient-to-r from-amber-500 to-amber-300 text-navy" : "bg-navy text-amber-500"}`}>
                {p.calc ? "Calculator" : "No Calculator"}
              </span>
            </div>
            <h3 className="font-serif text-[22px] font-bold text-navy mb-1">Paper {p.num}</h3>
            <p className="text-[13.5px] text-muted leading-relaxed mb-3.5">
              {p.time} minutes · {p.qs} questions · Criteria {p.criteria} focus.
              <br />{p.desc}
            </p>
            <div className="flex gap-1.5 flex-wrap mb-[18px]">
              <span className="text-[11px] px-2.5 py-1 bg-surface-2 text-navy rounded-full font-medium">⏱ {p.time} min</span>
              <span className="text-[11px] px-2.5 py-1 bg-surface-2 text-navy rounded-full font-medium">{p.qs} questions</span>
              <span className="text-[11px] px-2.5 py-1 bg-surface-2 text-navy rounded-full font-medium">{p.qs * 8} marks</span>
            </div>
            <button className="flex items-center justify-center gap-2 w-full px-5 py-3 rounded-[10px] bg-gradient-to-r from-amber-500 to-amber-300 text-navy font-bold text-sm hover:-translate-y-px hover:shadow-[0_8px_24px_rgba(212,175,55,.35)] transition-all cursor-pointer">
              <Play size={14} /> Begin Paper {p.num}
            </button>
          </motion.div>
        ))}
      </div>

      <motion.div
        variants={itemVariants}
        className="mt-6 p-5 bg-amber-50 border border-amber-500 rounded-[14px] text-navy text-[13.5px] leading-relaxed"
      >
        <strong className="font-serif text-base block mb-1.5">Exam Conditions</strong>
        Once you begin a paper, the timer cannot be paused. Submit on time even if unfinished — partial credit is awarded for working shown. Each question is graded 0-8.
      </motion.div>
    </motion.div>
  )
}

export function Investigations({ user }: PageProps) {
  const invs = [
    { title: "Stacking Oranges in a Market", unit: "Number", desc: "A fruit vendor stacks oranges in triangular pyramids..." },
    { title: "Toothpick Squares", unit: "Algebra", desc: "A student builds connected squares using toothpicks..." },
    { title: "Staircase Perimeter", unit: "Geometry", desc: "A staircase has n equal steps. Trace the outline..." },
    { title: "Dice Roll Frequencies", unit: "Statistics", desc: "Roll two dice n times and record the sum..." },
    { title: "Water Tank Filling", unit: "Measurement", desc: "A cylindrical water tank fills at a constant rate..." },
    { title: "Handshakes at a Party", unit: "Algebra", desc: "Every person shakes hands with every other person..." },
  ]

  return (
    <motion.div className="max-w-[1400px] w-full" variants={containerVariants} initial="hidden" animate="show">
      <HeroBanner
        eyebrow="Investigations · Criterion B & D"
        title="Discover patterns. Prove rules."
        subtitle="Mathematical investigations are at the heart of MYP Criterion B. Work through a 10-step inquiry process — identify, extend, generalise, verify, apply, and explain."
        icon={
          <svg viewBox="0 0 200 200" width="160" height="160">
            <circle cx="100" cy="100" r="60" fill="none" stroke="#D4AF37" strokeWidth="1.2" strokeDasharray="4 4" opacity="0.4" />
            <path d="M 60 100 Q 100 40 140 100 T 60 100" fill="none" stroke="#D4AF37" strokeWidth="1.8" opacity="0.85" />
            <circle cx="60" cy="100" r="5" fill="#D4AF37" />
            <circle cx="100" cy="60" r="5" fill="#D4AF37" />
            <circle cx="140" cy="100" r="5" fill="#D4AF37" />
            <circle cx="100" cy="140" r="5" fill="#D4AF37" />
          </svg>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {invs.map((inv, i) => (
          <motion.button
            key={i}
            variants={itemVariants}
            whileHover={{ y: -4 }}
            className="bg-white border border-line rounded-[16px] p-[22px] text-left transition-all hover:shadow-[0_16px_32px_rgba(11,20,55,.10)] hover:border-primary-3 cursor-pointer relative overflow-hidden"
          >
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-500 to-amber-300" />
            <div className="w-11 h-11 rounded-xl bg-surface-2 grid place-items-center mb-3">
              <FlaskConical size={20} className="text-amber-600" />
            </div>
            <div className="flex justify-between items-start">
              <div className="font-serif font-bold text-lg text-navy mb-1">{inv.title}</div>
              <span className="text-[11px] px-2.5 py-1 bg-surface-2 text-navy rounded-full flex-shrink-0 ml-2">{inv.unit}</span>
            </div>
            <div className="text-xs text-muted mt-1">Criterion B · 10 steps · /80</div>
            <p className="text-xs text-muted mt-2.5 leading-relaxed">{inv.desc}</p>
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}

export function CriterionTests({ user }: PageProps) {
  const criteria = [
    { letter: "A", title: "Knowing & Understanding", desc: "Apply mathematics in familiar and unfamiliar situations.", color: "#3B82F6" },
    { letter: "B", title: "Investigating Patterns", desc: "Apply problem-solving techniques. Describe & justify general rules.", color: "#D4AF37" },
    { letter: "C", title: "Communicating", desc: "Use correct notation & terminology. Move between forms.", color: "#22A45A" },
    { letter: "D", title: "Applying to Real Life", desc: "Identify relevant maths in real-life contexts.", color: "#C04A4A" },
  ]

  return (
    <motion.div className="max-w-[1400px] w-full" variants={containerVariants} initial="hidden" animate="show">
      <HeroBanner
        eyebrow="Criterion-Focused Tests"
        title="Target one descriptor at a time."
        subtitle="Each test concentrates 6 questions on a single IB MYP criterion, helping you build depth where you need it most. 35 minutes. Graded out of 48."
      />

      <h2 className="font-serif text-[26px] font-bold text-navy mt-2 mb-4">Choose a Criterion</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {criteria.map((c) => (
          <motion.div
            key={c.letter}
            variants={itemVariants}
            className="bg-white border border-line rounded-[14px] p-[18px_20px] relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-20 h-20" style={{ background: `radial-gradient(circle, ${c.color}33, transparent 70%)` }} />
            <div className="flex items-center gap-3.5 mb-3">
              <div
                className="w-[38px] h-[38px] rounded-[10px] grid place-items-center text-amber-500 font-serif font-extrabold text-lg bg-gradient-to-br from-navy to-primary-2"
              >
                {c.letter}
              </div>
              <div className="flex-1">
                <div className="font-bold text-navy text-sm">Criterion {c.letter}</div>
                <div className="text-[11px] text-muted mt-px">{c.title}</div>
              </div>
            </div>
            <p className="text-[13px] text-muted leading-relaxed mb-3.5">{c.desc}</p>
            <button className="flex items-center justify-center gap-2 w-full px-5 py-3 rounded-[10px] bg-gradient-to-r from-amber-500 to-amber-300 text-navy font-bold text-sm hover:-translate-y-px hover:shadow-[0_8px_24px_rgba(212,175,55,.35)] transition-all cursor-pointer">
              <Play size={14} /> Begin Criterion {c.letter} Test
            </button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

export function TeacherBoard({ user }: PageProps) {
  return (
    <motion.div className="max-w-[1400px] w-full" variants={containerVariants} initial="hidden" animate="show">
      <motion.div variants={itemVariants} className="flex justify-between items-start mb-4">
        <div>
          <h1 className="font-serif text-[32px] text-navy font-extrabold">AI Teacher Board</h1>
          <p className="text-muted text-sm mt-1">
            Conversational tutoring · voice input · listen mode · Year {user.year} {user.track}
          </p>
        </div>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="bg-white border border-line rounded-[16px] p-8 min-h-[500px] flex flex-col"
      >
        <div className="flex-1 overflow-y-auto pb-4">
          <div className="flex gap-3 mb-[18px]">
            <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-navy to-primary-2 grid place-items-center flex-shrink-0">
              <Sparkles size={16} className="text-amber-500" />
            </div>
            <div className="bg-white border border-line rounded-[14px] p-3.5 leading-relaxed text-sm text-navy flex-1">
              Hello {user.name.split(" ")[0]} — I&apos;m your IB Maths Teacher. Ask me anything: explain a topic, walk
              through a worked example, set you a practice problem, or describe a real-world scenario you find tricky.
            </div>
          </div>
        </div>

        <div className="flex gap-2.5 items-end pt-4 border-t border-line">
          <button className="w-12 h-12 rounded-xl bg-navy text-amber-500 grid place-items-center cursor-pointer hover:bg-primary-2 transition-colors flex-shrink-0">
            <MessageCircle size={18} />
          </button>
          <textarea
            className="flex-1 min-h-12 max-h-40 px-4 py-3 border border-line rounded-xl text-sm resize-none outline-none focus:border-amber-500 transition-colors"
            placeholder="Ask anything about MYP maths..."
          />
          <button className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-300 text-navy grid place-items-center cursor-pointer flex-shrink-0">
            <Play size={18} className="ml-0.5" />
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

function BadgeCard({ icon: Icon, title, earned, desc }: { icon: typeof Flame; title: string; earned: boolean; desc: string }) {
  return (
    <div className={`bg-white border border-line rounded-[14px] p-[22px_20px] relative ${earned ? "" : "opacity-40"}`}>
      <div className={`w-[50px] h-[50px] rounded-[14px] grid place-items-center mb-3 ${earned ? "bg-gradient-to-br from-amber-500 to-amber-300" : "bg-surface-2"}`}>
        {earned ? <Icon size={22} className="text-primary" /> : <Lock size={22} className="text-muted-2" />}
      </div>
      <div className="font-serif font-bold text-[15px] text-navy">{title}</div>
      <div className="text-[12.5px] text-muted">{desc}</div>
      {earned && (
        <div className="absolute top-3.5 right-3.5 text-[10px] font-bold text-amber-600 tracking-[.06em] uppercase">
          Earned
        </div>
      )}
    </div>
  )
}

export function MyProgress({ user, stats }: PageProps) {
  const s = stats || { streak: 1, xp: 0, level: 1, problemsSolved: 0, criteria: { A: 0, B: 0, C: 0, D: 0 }, criteriaAttempts: {} }

  return (
    <motion.div className="max-w-[1400px] w-full" variants={containerVariants} initial="hidden" animate="show">
      <HeroBanner
        eyebrow="Your Learning Journey"
        title={`${s.problemsSolved} problems mastered.`}
        subtitle="A complete record of your IB MYP Mathematics progress, criterion by criterion."
      />

      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-[18px] mb-7">
        {[
          { icon: Flame, num: s.streak, label: "Day Streak" },
          { icon: Trophy, num: s.xp, label: "Total XP" },
          { icon: Star, num: s.level, label: "Scholar Level" },
          { icon: CheckCircle, num: s.problemsSolved, label: "Problems Solved" },
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-line rounded-[14px] p-[18px]">
            <div className="w-10 h-10 rounded-[10px] grid place-items-center mb-3 bg-gradient-to-br from-amber-50 to-amber-100">
              <stat.icon size={22} className="text-amber-600" />
            </div>
            <div className="font-serif text-[32px] font-extrabold leading-none text-primary">{stat.num}</div>
            <div className="text-xs text-muted-2 uppercase tracking-[.1em] font-semibold mt-1">{stat.label}</div>
          </div>
        ))}
      </motion.div>

      <motion.div variants={itemVariants}>
        <h2 className="font-serif text-[26px] font-bold text-navy mt-9 mb-4">Earned Badges</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <BadgeCard icon={Flame} title="First Streak" earned={s.streak >= 3} desc="3-day learning streak" />
          <BadgeCard icon={Star} title="Rising Scholar" earned={s.xp >= 100} desc="100 XP earned" />
          <BadgeCard icon={Trophy} title="Centurion" earned={s.problemsSolved >= 100} desc="100 problems solved" />
          <BadgeCard icon={Sparkles} title="Pattern Hunter" earned={(s.criteria.B || 0) >= 6} desc="Avg 6+/8 on Criterion B" />
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <h2 className="font-serif text-[26px] font-bold text-navy mt-9 mb-4">Recent Attempts</h2>
        <div className="bg-white border border-dashed border-line rounded-[16px] p-[60px_30px] text-center text-muted">
          <div className="w-[60px] h-[60px] rounded-[16px] bg-surface-2 grid place-items-center mx-auto mb-3.5">
            <BarChart3 size={26} className="text-muted-2" />
          </div>
          <div className="font-serif text-xl text-navy mb-1.5 font-semibold">No attempts yet</div>
          <div>Complete your first test or investigation to see it appear here.</div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export function SettingsPage({ user }: PageProps) {
  return (
    <motion.div className="max-w-[1400px] w-full" variants={containerVariants} initial="hidden" animate="show">
      <motion.div variants={itemVariants}>
        <h1 className="font-serif text-[32px] text-navy font-extrabold mb-2">Settings</h1>
        <p className="text-muted text-sm mb-7">Update your profile, year and track. Changes affect future questions immediately.</p>
      </motion.div>

      <motion.div variants={itemVariants} className="bg-white border border-line rounded-[14px] p-[22px_20px] max-w-[600px]">
        <label className="text-xs font-semibold text-muted tracking-[.03em] mb-1.5 block">Your name</label>
        <input
          className="w-full px-4 py-3 border-[1.5px] border-line rounded-[10px] text-sm outline-none transition-colors focus:border-amber-500 bg-white text-navy mb-4"
          defaultValue={user.name}
        />

        <label className="text-xs font-semibold text-muted tracking-[.03em] mb-1.5 block">MYP Year</label>
        <div className="grid grid-cols-5 gap-2.5 mb-4">
          {[1, 2, 3, 4, 5].map((y) => (
            <button
              key={y}
              className={`py-3 px-2 text-center rounded-[10px] border-2 transition-all cursor-pointer ${
                y === user.year
                  ? "border-amber-500 bg-gradient-to-b from-amber-50 to-white"
                  : "border-line bg-white hover:border-amber-500"
              }`}
            >
              <div className="font-serif text-[22px] font-extrabold text-navy">{y}</div>
              <div className="text-[11px] text-muted mt-0.5">Grade {y + 5}</div>
            </button>
          ))}
        </div>

        <label className="text-xs font-semibold text-muted tracking-[.03em] mb-1.5 block">Track</label>
        <div className="grid grid-cols-2 gap-3 mb-5">
          {["Standard", "Extended"].map((t) => (
            <button
              key={t}
              className={`py-[18px] px-4 text-center rounded-xl border-2 transition-all cursor-pointer ${
                t === user.track
                  ? "border-amber-500 bg-gradient-to-b from-amber-50 to-white"
                  : "border-line bg-white hover:border-amber-500"
              }`}
            >
              <div className="font-bold text-navy">{t}</div>
              <div className="text-[11px] text-muted mt-0.5">{t === "Standard" ? "Core syllabus" : "Advanced track"}</div>
            </button>
          ))}
        </div>

        <button className="flex items-center justify-center gap-2 w-full px-5 py-3 rounded-[10px] bg-gradient-to-r from-amber-500 to-amber-300 text-navy font-bold text-sm hover:-translate-y-px hover:shadow-[0_8px_24px_rgba(212,175,55,.35)] transition-all cursor-pointer">
          <CheckCircle size={14} /> Save Changes
        </button>
      </motion.div>
    </motion.div>
  )
}
