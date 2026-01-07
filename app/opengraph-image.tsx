import { ImageResponse } from 'next/og'
 
export const runtime = 'edge'
 
export const size = {
  width: 1200,
  height: 630,
}
 
export const contentType = 'image/png'
 
export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 64,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 'bold',
          padding: '40px',
          textAlign: 'center',
        }}
      >
        <div style={{ marginBottom: '20px' }}>Ajans</div>
        <div style={{ fontSize: 32, fontWeight: 'normal' }}>
          Web Tasarım & Dijital Çözümler
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}

