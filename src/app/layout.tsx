import { Navbar } from '@/components/ui/Navbar';
import './globals.css';

const GLOBAL_PRINT_CSS = `@media print { .hide-on-print { display: none !important; } }`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <style dangerouslySetInnerHTML={{ __html: GLOBAL_PRINT_CSS }} />
      </head>
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
