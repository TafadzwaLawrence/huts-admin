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
  const [googleLoading, setGoogleLoading] = useState(false)

  const challengeRef = useRef<{ factorId: string; challengeId: string } | null>(null)
  const otpInputs = useRef<Array<HTMLInputElement | null>>([])

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true)
    setError(null)
    try {
      const supabase = createClient()
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback`,
          queryParams: { access_type: 'offline', prompt: 'select_account' },
        },
      })
      if (oauthError) setError(oauthError.message)
    } catch {
      setError('Google sign-in failed. Please try again.')
    } finally {
      setGoogleLoading(false)
    }
  }

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
        if (totpFactor) {
          const { data: challenge, error: challengeErr } = await supabase.auth.mfa.challenge({
            factorId: totpFactor.id,
          })
          if (challengeErr) { setError(challengeErr.message); return }
          if (challenge) {
            challengeRef.current = { factorId: totpFactor.id, challengeId: challenge.id }
            setStep('otp')
            return
          }
        }
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

              <div className="relative my-1">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-adm-border" />
                </div>
                <div className="relative flex justify-center">
                  <span className="px-3 bg-adm-surface text-xs text-adm-faint">or</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={googleLoading || loading}
                className="w-full py-2.5 bg-adm-surface-2 border border-adm-border rounded-xl text-sm font-medium text-adm-text hover:bg-adm-border/40 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2.5"
              >
                {googleLoading ? (
                  <Loader2 size={15} className="animate-spin text-adm-muted" />
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                )}
                {googleLoading ? 'Redirecting…' : 'Continue with Google'}
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
