import Navbar from '../components/Navbar';
import './globals.css';

export const metadata = {
  title: 'Combo College Predictor',
  description: 'JEE, NEET, and MHT-CET Predictors',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'Arial, sans-serif', background: '#f3f4f6', color: '#111' }}>
        <Navbar />
        <main style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
          {children}
        </main>
      </body>
    </html>
  );
}