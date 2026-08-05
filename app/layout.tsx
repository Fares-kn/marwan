import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Graduation Guestbook',
  description: "Leave a message for the graduate's keepsake book.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar">
      <body>{children}</body>
    </html>
  );
}
