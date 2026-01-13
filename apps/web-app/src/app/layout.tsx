import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '5 Secondes Chrono - Formation Immobilier Commercial',
  description: 'Maîtrisez l\'immobilier en 5 secondes chrono. Quiz chronométrés, progression gamifiée et coaching IA personnalisé.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}