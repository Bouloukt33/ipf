import { Home, Zap, TrendingUp, User, CircleGauge, Package, Users, CreditCard, Target, Mail, BookOpen } from 'lucide-react';
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

export const adminNavItems = [
    {
        label: 'Tableau de bord',
        href: '/admin/dashboard',
        icon: Home,
        iconBg: 'rgba(195,209,185,0.2)',
        iconColor: '#fff',
    },
    {
        label: 'Questions',
        href: '/admin/questions',
        icon: CircleGauge,
        iconBg: 'rgba(210,122,45,0.2)',
        iconColor: '#D27A2D',
    },
    {
        label: 'Types de baux',
        href: '/admin/categories',
        icon: BookOpen,
        iconBg: 'rgba(88,204,2,0.15)',
        iconColor: '#58cc02',
    },
    {
        label: 'Packs',
        href: '/admin/packs',
        icon: Package,
        iconBg: 'rgba(30,58,95,0.15)',
        iconColor: '#1e3a5f',
    },
    {
        label: 'Utilisateurs',
        href: '/admin/users',
        icon: Users,
        iconBg: 'rgba(16,185,129,0.15)',
        iconColor: '#10B981',
    },
    {
        label: 'Abonnements',
        href: '/admin/subscriptions',
        icon: CreditCard,
        iconBg: 'rgba(28,176,246,0.15)',
        iconColor: '#1CB0F6',
    },
    {
        label: 'Prospects',
        href: '/admin/prospects',
        icon: Target,
        iconBg: 'rgba(124,58,237,0.15)',
        iconColor: '#7C3AED',
    },
    {
        label: 'Plans',
        href: '/admin/plans',
        icon: CreditCard,
        iconBg: 'rgba(245,158,11,0.15)',
        iconColor: '#F59E0B',
    },
    {
        label: 'Emails',
        href: '/admin/emails',
        icon: Mail,
        iconBg: 'rgba(239,68,68,0.15)',
        iconColor: '#EF4444',
    },
];