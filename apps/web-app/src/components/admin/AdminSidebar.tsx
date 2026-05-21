'use client'

import { adminNavItems } from '@/lib/nav-items';
import { Sidebar } from '../sidebar/Sidebar';
 
export function AdminSidebar() {
    return <Sidebar items={adminNavItems} logoSrc="/images/logo_admin.png" />;
}
 