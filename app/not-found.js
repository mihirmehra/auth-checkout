// app/not-found.js
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container" style={{ textAlign: 'center' }}>
      <h1>404 - Not Found</h1>
      <p>Could not find the requested invoice.</p>
      <Link href="/">
        <button style={{ marginTop: '1.5rem' }}>Go to Homepage</button>
      </Link>
    </div>
  );
}