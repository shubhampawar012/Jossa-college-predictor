"use client";
import Link from 'next/link';

export default function Navbar() {
  return (
    <nav style={{ background: '#1d4ed8', padding: '15px 20px', color: 'white', display: 'flex', justifyContent: 'space-between' }}>
      <h2 style={{ margin: 0 }}>Combo Predictor Hub</h2>
      <div style={{ display: 'flex', gap: '20px' }}>
        <Link href="/" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>Home</Link>
        <Link href="/jee" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>JEE Predictor</Link>
        <Link href="#" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>NEET Predictor</Link>
        <Link href="#" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>Study Hub</Link>
      </div>
    </nav>
  );
}