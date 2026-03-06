import type { Metadata } from 'next';
import './globals.css';
import { auth0 } from '@/lib/auth0';
import { AuthProvider } from '@/components/AuthProvider';

export const metadata: Metadata = {
    title: '5 Secondes Chrono - Formation Immobilier Commercial',
    description: 'Maîtrisez l\'immobilier en 5 secondes chrono. Quiz chronométrés, progression gamifiée et coaching IA personnalisé.',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
    const session = await auth0.getSession();
    const accessToken = session?.tokenSet.accessToken ?? null;

    return (
        <html lang="fr">
            <body>
                <AuthProvider accessToken={accessToken}>
                    {children}
                </AuthProvider>
            </body>
        </html>
    );
}