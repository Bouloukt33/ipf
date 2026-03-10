import { Home, Zap, TrendingUp, User } from 'lucide-react';

export const userNavItems = [
    {
        label: 'Accueil',
        href: '/dashboard',
        icon: Home,
        iconBg: 'rgba(195,209,185,0.2)',
        iconColor: '#fff',
    },
    {
        label: 'Quiz',
        href: '/quiz',
        icon: Zap,
        iconBg: 'rgba(88,204,2,0.15)',
        iconColor: '#58cc02',
    },
    {
        label: 'Progression',
        href: '/dashboard/progression',
        icon: TrendingUp,
        iconBg: 'rgba(210,122,45,0.2)',
        iconColor: '#D27A2D',
    },
    {
        label: 'Mon Profil',
        href: '/dashboard/profile',
        icon: User,
        iconBg: 'rgba(206,130,255,0.15)',
        iconColor: '#ce82ff',
    },
];