"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { BookOpen, BarChart3, ArrowRight, Sparkles } from "lucide-react"

interface OnboardingData {
  role: string
  name: string
  school: string
  year: number
  track: string
}

interface OnboardingProps {
  onComplete: (data: OnboardingData) => void
  initialName?: string
}

export default function Onboarding({ onComplete, initialName }: OnboardingProps) {
  const [step, setStep] = useState(0)
  const [data, setData] = useState<OnboardingData>({
    role: "",
    name: initialName || "",
    school: "",
    year: 0,
    track: "",
  })

  const next = (patch: Partial<OnboardingData>) => {
    const newData = { ...data, ...patch }
    setData(newData)
    if (step < 4) setStep(step + 1)
    else onComplete(newData)
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-primary to-primary-2 grid place-items-center z-[2000] p-5 overflow-y-auto">
      <div className="absolute top-[10%] left-[10%] w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(212,175,55,.15)_0%,transparent_70%)] rounded-full" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-[22px] p-[42px] max-w-[560px] w-full shadow-[0_30px_60px_rgba(0,0,0,.4)] relative z-10"
      >
        <div className="text-center mb-7">
          <div className="inline-flex items-center gap-3 mb-3.5">
            <div className="w-[46px] h-[46px] rounded-[13px] bg-[radial-gradient(circle_at_30%_30%,#F4D783,#D4AF37_70%,#B8941F)] grid place-items-center shadow-[0_0_0_1px_rgba(212,175,55,.4),0_6px_18px_rgba(212,175,55,.35)]">
              <Sparkles size={20} className="text-primary" />
            </div>
            <span className="font-serif font-extrabold text-2xl text-navy">MYP Companion</span>
          </div>
          <p className="text-muted text-sm tracking-[.06em] uppercase">IB Mathematics · Years 1-5</p>
        </div>

        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="welcome" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="font-serif text-[32px] mb-2 text-navy">Welcome.</h2>
              <p className="text-muted mb-7 leading-relaxed">
                An AI-guided platform that turns every problem into a learning conversation — built around the IB MYP
                criterion-based assessment model.
              </p>
              <button
                onClick={() => setStep(1)}
                className="flex items-center justify-center gap-2 w-full px-5 py-3 rounded-[10px] bg-gradient-to-br from-primary to-primary-2 text-white font-semibold text-sm hover:-translate-y-px hover:shadow-[0_8px_24px_rgba(11,20,55,.25)] transition-all cursor-pointer"
              >
                Begin Setup <ArrowRight size={16} />
              </button>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="role" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h3 className="font-serif text-[26px] text-navy mb-2 font-bold">I am a...</h3>
              <div className="grid grid-cols-2 gap-3.5 mt-[18px]">
                {[
                  { id: "student", icon: BookOpen, title: "Student", sub: "Practice, investigate, earn criterion marks" },
                  { id: "teacher", icon: BarChart3, title: "Teacher", sub: "Review work, set tasks, track classes" },
                ].map((r) => (
                  <button
                    key={r.id}
                    onClick={() => next({ role: r.id })}
                    className="bg-white border-2 border-line rounded-[14px] p-5 text-left transition-all hover:border-amber-500 hover:-translate-y-[3px] hover:shadow-[0_12px_24px_rgba(11,20,55,.12)] cursor-pointer"
                  >
                    <r.icon size={28} className="text-amber-600" />
                    <div className="font-bold text-base text-navy mt-2.5 mb-1">{r.title}</div>
                    <div className="text-xs text-muted leading-relaxed">{r.sub}</div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="name" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h3 className="font-serif text-[26px] text-navy mb-2 font-bold">What&apos;s your name?</h3>
              <input
                className="w-full px-4 py-3 border-[1.5px] border-line rounded-[10px] text-sm outline-none transition-colors focus:border-amber-500 bg-white text-navy"
                placeholder="e.g. Aarav Sharma"
                value={data.name}
                onChange={(e) => setData({ ...data, name: e.target.value })}
              />
              <input
                className="w-full px-4 py-3 border-[1.5px] border-line rounded-[10px] text-sm outline-none transition-colors focus:border-amber-500 bg-white text-navy mt-3.5"
                placeholder="School name (optional)"
                value={data.school}
                onChange={(e) => setData({ ...data, school: e.target.value })}
              />
              <button
                disabled={!data.name.trim()}
                onClick={() => setStep(3)}
                className="flex items-center justify-center gap-2 w-full px-5 py-3 mt-5 rounded-[10px] bg-gradient-to-br from-primary to-primary-2 text-white font-semibold text-sm hover:-translate-y-px hover:shadow-[0_8px_24px_rgba(11,20,55,.25)] transition-all disabled:opacity-45 disabled:cursor-not-allowed cursor-pointer"
              >
                Continue <ArrowRight size={16} />
              </button>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="year" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h3 className="font-serif text-[26px] text-navy mb-2 font-bold">MYP Year</h3>
              <p className="text-muted mb-[18px] text-sm">Which year of MYP are you currently studying?</p>
              <div className="grid grid-cols-5 gap-2.5 mt-[18px]">
                {[1, 2, 3, 4, 5].map((y) => (
                  <button
                    key={y}
                    onClick={() => next({ year: y })}
                    className="bg-white border-2 border-line rounded-[14px] py-4 px-2 text-center transition-all hover:border-amber-500 hover:-translate-y-[3px] hover:shadow-[0_12px_24px_rgba(11,20,55,.12)] cursor-pointer"
                  >
                    <div className="font-serif text-[28px] font-extrabold text-navy">{y}</div>
                    <div className="text-[11px] text-muted mt-0.5">Grade {y + 5}</div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="track" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h3 className="font-serif text-[26px] text-navy mb-2 font-bold">Mathematics Track</h3>
              <p className="text-muted mb-[18px] text-sm">Choose the track that matches your school&apos;s curriculum.</p>
              <div className="grid grid-cols-2 gap-3.5 mt-[18px]">
                <button
                  onClick={() => next({ track: "Standard" })}
                  className="bg-white border-2 border-line rounded-[14px] p-5 text-left transition-all hover:border-amber-500 hover:-translate-y-[3px] hover:shadow-[0_12px_24px_rgba(11,20,55,.12)] cursor-pointer"
                >
                  <span className="inline-block text-[10px] px-2.5 py-1 rounded-full bg-surface-2 text-navy font-bold tracking-[.06em] uppercase">
                    Standard
                  </span>
                  <div className="font-bold text-base text-navy mt-2.5 mb-1">MYP Mathematics</div>
                  <div className="text-xs text-muted leading-relaxed">
                    Core syllabus designed for the majority of MYP students.
                  </div>
                </button>
                <button
                  onClick={() => next({ track: "Extended" })}
                  className="border-2 border-amber-500 rounded-[14px] p-5 text-left transition-all hover:-translate-y-[3px] hover:shadow-[0_12px_24px_rgba(212,175,55,.15)] cursor-pointer bg-gradient-to-b from-amber-50 to-white"
                >
                  <span className="inline-block text-[10px] px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-300 text-navy font-bold tracking-[.06em] uppercase">
                    Extended
                  </span>
                  <div className="font-bold text-base text-navy mt-2.5 mb-1">Extended Mathematics</div>
                  <div className="text-xs text-muted leading-relaxed">
                    For students aiming at HL Analysis & Approaches.
                  </div>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {step > 0 && step < 5 && (
          <div className="flex gap-2 justify-center mt-7">
            {[1, 2, 3, 4].map((i) => (
              <span
                key={i}
                className={`h-2 rounded-full transition-all ${
                  i <= step ? "bg-amber-500 w-7" : "bg-surface-2 w-2"
                }`}
              />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}
