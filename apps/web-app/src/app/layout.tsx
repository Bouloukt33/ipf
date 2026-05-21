import type { Metadata } from 'next';
import './globals.css';
import { auth0 } from '@/lib/auth0';
import { AuthProvider } from '@/components/AuthProvider';

export const metadata: Metadata = {
    title: '5 Secondes Chrono - Formation Immobilier Commercial',
    description: 'Maîtrisez l\'immobilier en 5 secondes chrono. Quiz chronométrés, progression gamifiée et coaching IA personnalisé.',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {

    return (
        <html lang="fr">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;600;700;800;900&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body>
                <AuthProvider>
                    {children}
                </AuthProvider>
            </body>
        </html>
    );
}