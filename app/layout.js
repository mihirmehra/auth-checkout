// app/layout.js
import './globals.css';

export const metadata = {
  title: 'Authorize.net Checkout',
  description: 'Custom checkout page with Next.js, Authorize.net, and MongoDB.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}