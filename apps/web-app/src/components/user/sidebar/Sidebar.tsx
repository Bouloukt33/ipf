'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { userNavItems } from '../../../lib/nav-items';
import { useMemo } from 'react';
import { LogOut } from 'lucide-react';
import { CollapseButton } from './CollapseButton';
import { SidebarItem } from './SidebarItem';
import { MobileNavItem } from './MobileNavItem';
import { MobileLogoutItem } from './MobileLogoutItem';
import { useSidebar } from '@/hooks/useSidebar';
import Image from 'next/image';

export function UserSidebar() {
    const pathname = usePathname();
    const { collapsed, toggle } = useSidebar();

    const W = collapsed ? 68 : 240;

    const navItems = useMemo(() =>
        userNavItems.map(({ label, href, icon: Icon, iconBg, iconColor }) => (
            <SidebarItem
                key={href}
                href={href}
                label={label}
                icon={<Icon size={22} color={iconColor} />}
                iconBg={iconBg}
                isActive={pathname === href}
                collapsed={collapsed}
                tooltip={label}
            />
        )),
        [pathname, collapsed]
    );

    const mobileNavItems = useMemo(() =>
        userNavItems.map(({ label, href, icon: Icon, iconColor }) => (
            <MobileNavItem
                key={href}
                href={href}
                label={label}
                icon={<Icon size={22} color={pathname === href ? '#D27A2D' : iconColor} />}
                isActive={pathname === href}
            />
        )),
        [pathname]
    );

    const sidebarStyle = {
        width: W,
        minWidth: W,
        background: '#172E42',
        boxSizing: 'border-box' as const,
        transition: 'width 0.3s ease, min-width 0.3s ease',
        fontFamily: "'Nunito', sans-serif",
        overflow: 'visible' as const,
        padding: '24px 12px',
    };

    const spacerStyle = {
        width: W,
        minWidth: W,
        transition: 'width 0.3s ease, min-width 0.3s ease',
    };

    const headerStyle = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        marginBottom: 28,
        paddingLeft: collapsed ? 0 : 4,
        paddingRight: collapsed ? 0 : 4,
        gap: 8,
        minHeight: 32,
        transition: 'padding 0.3s ease',
    };

    const logoWrapperStyle = {
        overflow: 'hidden',
        maxWidth: collapsed ? 0 : 200,
        opacity: collapsed ? 0 : 1,
        flexShrink: 0,
        transition: collapsed
            ? 'max-width 0s, opacity 0s'
            : 'max-width 0s 0.28s, opacity 0.15s ease 0.28s',
    };

    return (
        <>
            {/* ── Desktop / Tablet Sidebar ── */}
            <aside className="hidden md:flex flex-col fixed top-0 left-0 h-screen z-[500]" style={sidebarStyle}>

                {/* Header */}
                <div style={headerStyle}>
                    <Image
                        src='/images/logo_dark.png'
                        alt="5secondes chrono"
                        width={collapsed ? 0 : 200}
                        height={32}
                        style={logoWrapperStyle}
                    />
                    <CollapseButton collapsed={collapsed} onClick={toggle} />
                </div>

                {/* Nav */}
                <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
                    {navItems}
                </nav>

                {/* Logout */}
                <SidebarItem
                    href="/auth/logout"
                    label="Déconnexion"
                    icon={<LogOut size={22} color="rgba(255,255,255,0.55)" />}
                    iconBg="rgba(255,255,255,0.05)"
                    isActive={false}
                    collapsed={collapsed}
                    tooltip="Déconnexion"
                />
            </aside>

            {/* Spacer */}
            <div className="hidden md:block flex-shrink-0" style={spacerStyle} />

            {/* ── Mobile Bottom Bar ── */}
            <nav
                className="md:hidden fixed bottom-0 left-0 right-0 z-[500]"
                style={{
                    background: '#172E42',
                    borderTop: '1px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 -4px 20px rgba(0,0,0,0.2)',
                    height: 60,
                    paddingBottom: 'env(safe-area-inset-bottom)',
                    fontFamily: "'Nunito', sans-serif",
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', height: 60, padding: '0 4px' }}>
                    {mobileNavItems}
                    <MobileLogoutItem />
                </div>
            </nav>

            {/* Mobile spacer */}
            <div className="md:hidden" style={{ height: 60, flexShrink: 0 }} />
        </>
    );
}