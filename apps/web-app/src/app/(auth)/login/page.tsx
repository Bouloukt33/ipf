import { redirect } from 'next/navigation';

export default function LoginPage() {
    // Redirection vers Auth0 pour l'authentification
    redirect('/auth/login');
}