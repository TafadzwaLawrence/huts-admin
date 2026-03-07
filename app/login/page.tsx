'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { Shield, Eye, EyeOff, ArrowLeft, Loader2, AlertCircle } from 'lucide-react'

type Step = 'credentials' | 'otp'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [step, setStep] = useState<Step>('credentials')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const challengeRef = useRef<{ factorId: string; challengeId: string } | null>(null)
  const otpInputs = useRef<Array<HTMLInputElement | null>>([])

  const handleCredentials = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const supabase = createClient()
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (signInError) {
        setError(signInError.message)
        return
      }

      const { data: assurance } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
      if (assurance?.nextLevel === 'aal2' && assurance.nextLevel !== assurance.currentLevel) {
        const { data: factorData } = await supabase.auth.mfa.listFactors()
        const totpFactor = factorData?.totp?.[0]
        if (!totpFactor) {
          // MFA is required but the account has no TOTP factor enrolled.
          // Sign out immediately so the session is not left in a partial state.
          await supabase.auth.signOut()
          setError('Two-factor authentication is required for this account. Please enroll a TOTP authenticator app and try again.')
          return
        }
        const { data: challenge, error: challengeErr } = await supabase.auth.mfa.challenge({
          factorId: totpFactor.id,
        })
        if (challengeErr) { setError(challengeErr.message); return }
        if (challenge) {
          challengeRef.current = { factorId: totpFactor.id, challengeId: challenge.id }
          setStep('otp')
          return
        }
      } else if (!assurance || assurance.nextLevel !== 'aal2') {
        // MFA is not configured at the project level — block access entirely.
        await supabase.auth.signOut()
        setError('Two-factor authentication is required but is not enabled on this account. Contact your administrator.')
        return
      }

      router.push(searchParams.get('next') || '/')
      router.refresh()
    } catch {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    const code = otp.join('')
    if (code.length !== 6) { setError('Please enter the full 6-digit code.'); return }
    if (!challengeRef.current) return
    setError(null)
    setLoading(true)
    try {
      const supabase = createClient()
      const { error: verifyErr } = await supabase.auth.mfa.verify({
        factorId: challengeRef.current.factorId,
        challengeId: challengeRef.current.challengeId,
        code,
      })
      if (verifyErr) { setError(verifyErr.message); return }
      router.push(searchParams.get('next') || '/')
      router.refresh()
    } catch {
      setError('Verification failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleOtpInput = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1)
    const next = [...otp]
    next[index] = digit
    setOtp(next)
    if (digit && index < 5) otpInputs.current[index + 1]?.focus()
  }

  const handleOtpKey = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) otpInputs.current[index - 1]?.focus()
    if (e.key === 'ArrowLeft' && index > 0) otpInputs.current[index - 1]?.focus()
    if (e.key === 'ArrowRight' && index < 5) otpInputs.current[index + 1]?.focus()
  }

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6).split('')
    const next = ['', '', '', '', '', '']
    digits.forEach((d, i) => { next[i] = d })
    setOtp(next)
    otpInputs.current[Math.min(digits.length, 5)]?.focus()
  }

  return (
    <div className="min-h-screen bg-adm-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm animate-fadeIn">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-adm-accent rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-adm-accent/30">
            <Shield size={22} className="text-white" />
          </div>
          <p className="text-[10px] font-black tracking-[4px] text-adm-faint mb-1.5">HUTS</p>
          <h1 className="text-2xl font-bold text-adm-text">
            {step === 'credentials' ? 'Admin Sign In' : 'Two-Factor Auth'}
          </h1>
          <p className="text-sm text-adm-muted mt-1.5">
            {step === 'credentials'
              ? 'Restricted to authorised administrators only.'
              : 'Enter the 6-digit code from your authenticator app.'}
          </p>
        </div>

        <div className="bg-adm-surface border border-adm-border rounded-2xl p-7 shadow-2xl shadow-black/50">
          {error && (
            <div className="flex items-start gap-2.5 p-3.5 bg-adm-red/10 border border-adm-red/25 rounded-xl text-sm text-adm-red mb-5">
              <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {step === 'credentials' ? (
            <form onSubmit={handleCredentials} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-adm-text mb-1.5">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full px-3.5 py-2.5 bg-adm-surface-2 border border-adm-border rounded-xl text-sm text-adm-text placeholder-adm-faint focus:outline-none focus:border-adm-accent transition-colors"
                  placeholder="admin@example.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-adm-text mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="w-full px-3.5 py-2.5 pr-11 bg-adm-surface-2 border border-adm-border rounded-xl text-sm text-adm-text placeholder-adm-faint focus:outline-none focus:border-adm-accent transition-colors"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-adm-faint hover:text-adm-muted transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-2.5 bg-adm-accent text-white text-sm font-semibold rounded-xl hover:bg-adm-accent/90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading && <Loader2 size={15} className="animate-spin" />}
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleOtp} className="space-y-5">
              <div>
                <p className="text-sm font-medium text-adm-text mb-4 text-center">
                  Authentication code
                </p>
                <div className="flex gap-2 justify-center" onPaste={handleOtpPaste}>
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => { otpInputs.current[i] = el }}
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpInput(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKey(i, e)}
                      className="w-11 h-12 text-center text-xl font-bold bg-adm-surface-2 border border-adm-border rounded-xl text-adm-text focus:outline-none focus:border-adm-accent focus:bg-adm-surface transition-all"
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || otp.join('').length !== 6}
                className="w-full py-2.5 bg-adm-accent text-white text-sm font-semibold rounded-xl hover:bg-adm-accent/90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading && <Loader2 size={15} className="animate-spin" />}
                {loading ? 'Verifying…' : 'Verify code'}
              </button>

              <button
                type="button"
                onClick={() => { setStep('credentials'); setOtp(['', '', '', '', '', '']); setError(null) }}
                className="flex items-center gap-1.5 text-sm text-adm-muted hover:text-adm-text transition-colors mx-auto"
              >
                <ArrowLeft size={13} />
                Back to sign in
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
