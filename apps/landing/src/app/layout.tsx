import type { Metadata } from 'next';
import { Nunito } from 'next/font/google';
import './globals.css';

const nunito = Nunito({
    subsets: ['latin'],
    weight: ['400', '600', '700', '800', '900'],
    display: 'swap',
});

export const metadata: Metadata = {
    title: '5 Secondes Chrono — Maîtrisez l\'immobilier commercial',
    description: 'La plateforme d\'apprentissage gamifiée pour les professionnels de l\'immobilier commercial. Quiz chronométrés, progression gamifiée et coach IA.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="fr">
            <body className={nunito.className}>{children}</body>
        </html>
    );
}
