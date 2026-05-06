import type { Metadata } from 'next';
import { Playfair_Display, DM_Sans } from 'next/font/google';
import './globals.css';

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-playfair',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-dm-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Lovely Nails — Premium Nail Salon in Guam',
  description:
    'Experience luxury nail care in Guam. Gel manicures, custom nail art, spa pedicures, and acrylic extensions by expert technicians. Book your appointment today.',
  keywords: ['nail salon Guam', 'gel manicure Guam', 'nail art Guam', 'spa pedicure Guam', 'acrylic nails Guam'],
  openGraph: {
    title: 'Lovely Nails — Premium Nail Salon in Guam',
    description: 'Experience luxury nail care crafted by skilled artisans. Book your appointment today.',
    type: 'website',
    locale: 'en_US',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `try{if(localStorage.getItem('theme')==='dark')document.documentElement.setAttribute('data-theme','dark');}catch(e){}` }} />
        <noscript>
          <style>{`.reveal,.reveal-left,.reveal-right{opacity:1!important;transform:none!important}`}</style>
        </noscript>
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
