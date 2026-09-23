import type { Metadata } from 'next';
import './globals.css';
import Shell from '@/components/Shell';
import { AuthProvider } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'Big Bannia Di Hatti — Products',
  description: 'Bulk product catalogue imported from Excel + images ZIP',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <AuthProvider>
          <Shell>{children}</Shell>
        </AuthProvider>
      </body>
    </html>
  );
}
