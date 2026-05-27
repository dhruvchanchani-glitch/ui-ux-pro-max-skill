"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { CheckCircle } from "lucide-react"

interface SignInProps {
  onSignedIn: (account: { email: string; name: string; provider: string }) => void
}

export default function SignIn({ onSignedIn }: SignInProps) {
  const [email, setEmail] = useState("")
  const [signing, setSigning] = useState(false)

  const handleSignIn = () => {
    setSigning(true)
    setTimeout(() => {
      const fakeAccount = {
        email: email || "student@example.com",
        name: (email || "student@example.com")
          .split("@")[0]
          .split(".")
          .map((n) => n.charAt(0).toUpperCase() + n.slice(1))
          .join(" "),
        provider: "google",
      }
      onSignedIn(fakeAccount)
    }, 800)
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-primary to-primary-2 grid place-items-center z-[2000] p-5 overflow-y-auto">
      <div className="absolute top-[10%] left-[10%] w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(212,175,55,.15)_0%,transparent_70%)] rounded-full" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-[22px] p-[52px_44px] max-w-[460px] w-full shadow-[0_30px_60px_rgba(0,0,0,.4)] relative z-10"
      >
        <div className="text-center mb-9">
          <div className="w-[64px] h-[64px] rounded-[18px] bg-gradient-to-br from-primary to-primary-2 grid place-items-center mx-auto mb-5 relative">
            <svg viewBox="0 0 40 40" width="40" height="40" fill="none">
              <path d="M8 30 L8 12 L14 12 L20 22 L26 12 L32 12 L32 30 L28 30 L28 18 L22 27 L18 27 L12 18 L12 30 Z" fill="#D4AF37" />
              <circle cx="20" cy="34" r="2" fill="#D4AF37" opacity="0.5" />
            </svg>
            <div className="absolute -inset-[3px] rounded-[21px] p-[3px] bg-gradient-to-br from-amber-500 to-amber-300 [mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] [mask-composite:exclude]" />
          </div>
          <h1 className="font-serif text-[32px] text-navy font-extrabold mb-1.5 tracking-tight">MYP Companion</h1>
          <div className="text-muted text-[13px] tracking-[.08em] uppercase font-semibold">
            IB Mathematics · Years 1-5
          </div>
        </div>

        <h2 className="font-serif text-[22px] text-navy font-bold mb-2 text-center">Sign in to continue</h2>
        <p className="text-muted mb-7 leading-relaxed text-[13.5px] text-center">
          Your progress, criterion scores, and investigation history will be saved to your account.
        </p>

        <input
          className="w-full px-4 py-3 border-[1.5px] border-line rounded-[10px] text-sm outline-none transition-colors focus:border-amber-500 bg-white text-navy mb-3.5"
          placeholder="your.name@school.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSignIn()}
        />

        <button
          onClick={handleSignIn}
          disabled={signing}
          className="flex items-center justify-center gap-2.5 w-full bg-white border-[1.5px] border-[#dadce0] text-[#3c4043] py-3 rounded-[10px] font-semibold text-sm transition-all hover:bg-[#f8f9fa] hover:border-[#c4c8cc] hover:shadow-[0_1px_3px_rgba(60,64,67,.08),0_4px_8px_rgba(60,64,67,.1)] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
        >
          {signing ? (
            <span className="text-muted">Signing in...</span>
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
              </svg>
              Continue with Google
            </>
          )}
        </button>

        <div className="flex items-center text-center my-[18px] text-muted text-[11px] tracking-[.1em] uppercase font-semibold">
          <div className="flex-1 border-b border-line" />
          <span className="px-3.5">or</span>
          <div className="flex-1 border-b border-line" />
        </div>

        <button
          onClick={handleSignIn}
          disabled={signing}
          className="inline-flex items-center justify-center gap-2 w-full px-5 py-3 rounded-[10px] bg-gradient-to-br from-primary to-primary-2 text-white font-semibold text-sm hover:-translate-y-px hover:shadow-[0_8px_24px_rgba(11,20,55,.25)] transition-all disabled:opacity-45 disabled:cursor-not-allowed cursor-pointer"
        >
          <CheckCircle size={14} /> Continue with Email
        </button>

        <div className="mt-[26px] text-[11.5px] text-muted text-center leading-relaxed">
          By continuing you agree to our{" "}
          <a href="#" className="text-amber-700 underline">
            Terms
          </a>{" "}
          and{" "}
          <a href="#" className="text-amber-700 underline">
            Privacy Policy
          </a>
          .
        </div>
      </motion.div>

      <div className="absolute bottom-6 text-white/40 text-[11px] tracking-[.1em] uppercase font-semibold">
        Built for IB MYP · A premium learning platform
      </div>
    </div>
  )
}
