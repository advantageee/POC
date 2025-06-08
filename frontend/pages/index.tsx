import Link from 'next/link';

export default function Home() {
  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Investor Codex Dashboard</h1>
      <ul>
        <li>
          <Link href="/api-config">API Configuration</Link>
        </li>
      </ul>
    </main>
  );
}
