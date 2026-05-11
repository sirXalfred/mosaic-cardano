import "../styles/globals.css";
import type { ReactNode } from 'react';

export const metadata = {
  title: 'mosaic',
  description: 'Mosaic Cardano - Modular Next.js App'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
