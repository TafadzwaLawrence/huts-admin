interface HutsLogoProps {
  size?: number
  className?: string
}

export function HutsLogo({ size = 32, className }: HutsLogoProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo.svg"
      width={size}
      height={size}
      alt="Huts"
      className={className}
      style={{ objectFit: 'contain' }}
    />
  )
}
