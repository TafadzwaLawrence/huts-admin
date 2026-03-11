interface HutsLogoProps {
  size?: number
  className?: string
}

/**
 * Official Huts logo — dark background (#0D1117) with white hut icon.
 * The hut path is derived from the brand SVG, recentred and scaled to a square viewport.
 */
export function HutsLogo({ size = 32, className }: HutsLogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      aria-label="Huts logo"
    >
      <rect width="100" height="100" rx="18" fill="#0D1117" />
      {/* Hut shape: roof triangle + walls/door */}
      <polygon points="50,18 82,45 18,45" fill="white" />
      <rect x="26" y="44" width="48" height="32" fill="white" />
      <rect x="41" y="56" width="18" height="20" fill="#0D1117" />
    </svg>
  )
}
