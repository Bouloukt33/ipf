import { DashboardClient } from '@/components/user/dashboard/DashboardClient';
import { auth0 } from '@/lib/auth0';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import Image from 'next/image';
import Link from 'next/link';
import Sidebar from '../components/Sidebar';

const API_BASE_URL = process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const isDev = process.env.NODE_ENV === 'development';


export default async function DashboardPage() {
    const session = await auth0.getSession();    
    if (!session) redirect('/auth/login');

    return <DashboardClient user={session.user} />;
}