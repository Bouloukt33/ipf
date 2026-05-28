'use client';

import { Sidebar } from '@/components/sidebar/Sidebar';
import { userNavItems } from '@/lib/nav-items';
 
export function UserSidebar() {
    return <Sidebar items={userNavItems} />;
}