"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import SignIn from "@/components/ui/sign-in"
import Onboarding from "@/components/ui/onboarding"
import Sidebar from "@/components/ui/sidebar"
import Dashboard from "@/components/ui/dashboard"
import {
  QuestionBank,
  PracticePapers,
  Investigations,
  CriterionTests,
  TeacherBoard,
  MyProgress,
  SettingsPage,
} from "@/components/ui/placeholder-pages"

const ShaderShowcase = dynamic(() => import("@/components/ui/hero"), { ssr: false })

interface Account {
  email: string
  name: string
  provider: string
}

interface User {
  role: string
  name: string
  school: string
  year: number
  track: string
  email?: string
}

interface Stats {
  streak: number
  xp: number
  level: number
  problemsSolved: number
  criteria: Record<string, number>
  criteriaAttempts: Record<string, number>
}

export default function AppShell() {
  const [account, setAccount] = useState<Account | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [page, setPage] = useState("dashboard")
  const [showLanding, setShowLanding] = useState(true)
  const [stats] = useState<Stats>({
    streak: 1,
    xp: 0,
    level: 1,
    problemsSolved: 0,
    criteria: { A: 0, B: 0, C: 0, D: 0 },
    criteriaAttempts: { A: 0, B: 0, C: 0, D: 0 },
  })

  const onSignedIn = (acc: Account) => {
    setAccount(acc)
  }

  const onOnboardComplete = (data: { role: string; name: string; school: string; year: number; track: string }) => {
    const full: User = { ...data, email: account?.email }
    setUser(full)
    setPage(data.role === "teacher" ? "teacherHome" : "dashboard")
  }

  const onSignOut = () => {
    setAccount(null)
    setUser(null)
    setShowLanding(true)
  }

  if (showLanding && !account) {
    return (
      <div className="relative">
        <ShaderShowcase />
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50">
          <button
            onClick={() => setShowLanding(false)}
            className="px-8 py-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white font-semibold text-sm hover:bg-white/20 transition-all cursor-pointer shadow-[0_8px_32px_rgba(0,0,0,.3)]"
          >
            Sign In to Get Started
          </button>
        </div>
      </div>
    )
  }

  if (!account) return <SignIn onSignedIn={onSignedIn} />
  if (!user) return <Onboarding onComplete={onOnboardComplete} initialName={account.name} />

  let content
  switch (page) {
    case "dashboard":
      content = <Dashboard user={user} stats={stats} setPage={setPage} />
      break
    case "qbank":
      content = <QuestionBank user={user} />
      break
    case "papers":
      content = <PracticePapers user={user} />
      break
    case "investigations":
      content = <Investigations user={user} />
      break
    case "criterion":
      content = <CriterionTests user={user} />
      break
    case "teacher":
      content = <TeacherBoard user={user} />
      break
    case "progress":
      content = <MyProgress user={user} stats={stats} />
      break
    case "settings":
      content = <SettingsPage user={user} />
      break
    default:
      content = <Dashboard user={user} stats={stats} setPage={setPage} />
  }

  return (
    <div className="grid grid-cols-[264px_1fr] min-h-screen">
      <Sidebar page={page} setPage={setPage} user={user} onSignOut={onSignOut} />
      <main className="p-8 lg:px-10 pb-[60px] max-w-[1400px] w-full">{content}</main>
    </div>
  )
}
