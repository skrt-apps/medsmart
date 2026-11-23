import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, DM_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-dm-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Personal Intel — Prescription Parser',
  description:
    'Prescription parser, medication tracker, refill schedule calculator, and reminder console.',
  openGraph: {
    title: 'Personal Intel — Prescription Parser',
    description:
      'Prescription parser, medication tracker, refill schedule calculator, and reminder console.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Personal Intel — Prescription Parser',
    description:
      'Prescription parser, medication tracker, refill schedule calculator, and reminder console.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${plusJakarta.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}
    >
      <body
        suppressHydrationWarning
        className="min-h-screen bg-[#1C1B1F] text-[#E6E1E5]"
      >
        {children}
      </body>
    </html>
  );
}
