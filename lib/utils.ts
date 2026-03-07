import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(cents: number): string {
  return `$${(cents / 100).toLocaleString()}`
}

export function formatSalePrice(cents: number): string {
  const dollars = cents / 100
  if (dollars >= 1_000_000) {
    return `$${(dollars / 1_000_000).toFixed(2)}M`
  }
  if (dollars >= 1_000) {
    return `$${(dollars / 1_000).toFixed(0)}K`
  }
  return `$${dollars.toLocaleString()}`
}

export function calculateMonthlyMortgage(
  salePriceCents: number,
  downPaymentPercent: number = 20,
  interestRate: number = 6.5,
  termYears: number = 30
): number {
  const principal = (salePriceCents / 100) * (1 - downPaymentPercent / 100)
  const monthlyRate = interestRate / 100 / 12
  const numPayments = termYears * 12

  if (monthlyRate === 0) {
    return Math.round((principal / numPayments) * 100)
  }

  const monthly =
    principal *
    ((monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
      (Math.pow(1 + monthlyRate, numPayments) - 1))

  return Math.round(monthly * 100) // return in cents
}

export function calculateTotalMonthlyCost(
  mortgageCents: number,
  propertyTaxAnnualCents: number | null,
  hoaFeeMonthlyCents: number | null,
  insuranceEstimateCents: number = 15000 // ~$150/month default
): number {
  const propertyTaxMonthly = propertyTaxAnnualCents
    ? Math.round(propertyTaxAnnualCents / 12)
    : 0
  const hoaFee = hoaFeeMonthlyCents || 0

  return mortgageCents + propertyTaxMonthly + hoaFee + insuranceEstimateCents
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
