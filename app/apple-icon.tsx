import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#0D1117',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 32,
        }}
      >
        {/* Hut roof */}
        <svg
          width="130"
          height="130"
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
        >
          <polygon points="50,10 88,42 12,42" fill="white" />
          <rect x="18" y="40" width="64" height="44" fill="white" />
          <rect x="37" y="58" width="26" height="26" fill="#0D1117" />
        </svg>
      </div>
    ),
    { ...size }
  )
}
