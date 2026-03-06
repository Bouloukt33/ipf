import { Home, Zap, TrendingUp, User } from 'lucide-react';

export const userNavItems = [
    { label: 'Accueil', href: '/dashboard', icon: Home },
    { label: 'Quiz', href: '/dashboard/quiz', icon: Zap },
    { label: 'Progression', href: '/dashboard/progression', icon: TrendingUp },
    { label: 'Mon Profil', href: '/dashboard/profile', icon: User },
];