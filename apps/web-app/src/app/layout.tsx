import type { Metadata } from 'next';
import './globals.css';
import { Auth0Provider } from "@auth0/nextjs-auth0/client";

export const metadata: Metadata = {
    title: '5 Secondes Chrono - Formation Immobilier Commercial',
    description: 'Maîtrisez l\'immobilier en 5 secondes chrono. Quiz chronométrés, progression gamifiée et coaching IA personnalisé.',
};


export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="fr">
            <body>
                <Auth0Provider>
                    {children}
                </Auth0Provider>
            </body>
        </html>
    );
}