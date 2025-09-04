// app/layout.js
import './globals.css';

export const metadata = {
  title: 'Authorize.net Checkout',
  description: 'Custom checkout page with Next.js, Authorize.net, and MongoDB.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Load AcceptCore.js first, then Accept.js from the sandbox environment */}
        <script src="https://jstest.authorize.net/v1/AcceptCore.js" async />
        <script src="https://jstest.authorize.net/v1/Accept.js" async />
      </head>
      <body>{children}</body>
    </html>
  );
}