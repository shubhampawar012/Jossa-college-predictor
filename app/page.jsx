import Link from 'next/link';

export default function Home() {
  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1 style={{ color: '#1d4ed8', fontSize: '36px' }}>Welcome to the Ultimate Predictor Hub</h1>
      <p style={{ fontSize: '18px', color: '#555', marginBottom: '40px' }}>
        Accurate predictions using our 100% optimized Dynamic Rank Tolerance Algorithm.
      </p>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
        <div style={{ background: 'white', padding: '30px', borderRadius: '8px', width: '250px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <h2 style={{ color: '#2563eb' }}>JEE Main / JoSAA</h2>
          <p>Predict NITs, IIITs, and GFTIs based on your rank.</p>
          <Link href="/jee" style={{ display: 'inline-block', background: '#2563eb', color: 'white', padding: '10px 15px', textDecoration: 'none', borderRadius: '5px', marginTop: '10px' }}>Open Predictor</Link>
        </div>

        <div style={{ background: 'white', padding: '30px', borderRadius: '8px', width: '250px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <h2 style={{ color: '#2563eb' }}>NEET Medical</h2>
          <p>Find the best MBBS/BDS colleges across India.</p>
          <button style={{ background: '#9ca3af', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '5px', marginTop: '10px', cursor: 'not-allowed' }}>Coming Soon</button>
        </div>

        <div style={{ background: 'white', padding: '30px', borderRadius: '8px', width: '250px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <h2 style={{ color: '#2563eb' }}>Study Materials</h2>
          <p>PYQs, Syllabus, Roadmaps, and High-Weightage topics.</p>
          <button style={{ background: '#9ca3af', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '5px', marginTop: '10px', cursor: 'not-allowed' }}>Coming Soon</button>
        </div>
      </div>
    </div>
  );
}