import { ImageResponse } from 'next/og';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const alt = 'BiaBip - Quản lý điểm game bàn';
export const size = {
  width: 1200,
  height: 630
};
export const contentType = 'image/png';

// Image generation
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 128,
          background: 'linear-gradient(to bottom right, #1e40af, #3b82f6)',
          width: '100%',
          height: '100%',
          display: 'flex',
          textAlign: 'center',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          color: 'white'
        }}
      >
        <div style={{ marginBottom: 20, fontSize: 48 }}>🎮</div>
        <div style={{ fontWeight: 'bold' }}>BiaBip</div>
        <div
          style={{
            fontSize: 32,
            marginTop: 10,
            opacity: 0.8,
            textAlign: 'center',
            maxWidth: '80%'
          }}
        >
          Quản lý điểm game bàn hiện đại
        </div>
      </div>
    ),
    {
      ...size
    }
  );
}
