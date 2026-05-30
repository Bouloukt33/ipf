import { useLocation } from 'react-router-dom';
import { useMemo } from 'react';
import { LogOut } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAuth0 } from '@auth0/auth0-react';
import { CollapseButton } from './CollapseButton';
import { SidebarItem } from './SidebarItem';
import { MobileNavItem } from './MobileNavItem';
import { MobileLogoutItem } from './MobileLogoutItem';
import { useSidebarStore } from '../../store/sidebar.store';

export interface SidebarNavItem {
    label: string;
    href: string;
    icon: LucideIcon;
    iconBg?: string;
    iconColor?: string;
}

export interface SidebarProps {
    items: SidebarNavItem[];
    logoSrc?: string;
    logoAlt?: string;
}

export function Sidebar({ items, logoSrc = '/images/logo_admin.png', logoAlt = 'IPF Admin' }: SidebarProps) {
    const location = useLocation();
    const pathname = location.pathname;
    const { collapsed, toggle } = useSidebarStore();
    const { logout } = useAuth0();

    const W = collapsed ? 68 : 240;

    const navItems = useMemo(() =>
        items.map(({ label, href, icon: Icon, iconBg, iconColor }) => (
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
        [items, pathname, collapsed]
    );

    const mobileNavItems = useMemo(() =>
        items.map(({ label, href, icon: Icon, iconColor }) => (
            <MobileNavItem
                key={href}
                href={href}
                label={label}
                icon={<Icon size={22} color={pathname === href ? '#D27A2D' : iconColor} />}
                isActive={pathname === href}
            />
        )),
        [items, pathname]
    );

    return (
        <>
            {/* ── Desktop sidebar ── */}
            <aside
                className="hidden md:flex flex-col fixed top-0 left-0 h-screen z-[500]"
                style={{
                    minWidth: W,
                    background: '#172E42',
                    boxSizing: 'border-box',
                    transition: 'width 0.3s ease, min-width 0.3s ease',
                    fontFamily: "'Nunito', sans-serif",
                    overflow: 'visible',
                    padding: '24px 12px',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: 28,
                        paddingLeft: 4,
                        paddingRight: 4,
                        minHeight: 32,
                        height: 32,
                    }}
                >
                    <img
                        src={logoSrc}
                        alt={logoAlt}
                        style={{
                            height: 32,
                            width: 'auto',
                            maxWidth: collapsed ? 0 : 160,
                            opacity: collapsed ? 0 : 1,
                            objectFit: 'contain',
                            flexShrink: 0,
                            display: 'block',
                            transition: collapsed
                                ? 'max-width 0s, opacity 0s'
                                : 'max-width 0s 0.28s, opacity 0.15s ease 0.28s',
                            overflow: 'hidden',
                        }}
                    />
                </div>

                <div
                    style={{
                        position: 'absolute',
                        top: 24 + 16,
                        right: -16,
                        transform: 'translateY(-50%)',
                        zIndex: 600,
                    }}
                >
                    <CollapseButton collapsed={collapsed} onClick={toggle} />
                </div>

                <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
                    {navItems}
                </nav>

                <SidebarItem
                    href="#"
                    label="Déconnexion"
                    icon={<LogOut size={22} color="rgba(255,255,255,0.55)" />}
                    iconBg="rgba(255,255,255,0.05)"
                    isActive={false}
                    collapsed={collapsed}
                    tooltip="Déconnexion"
                    onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
                />
            </aside>

            <div
                className="hidden md:block flex-shrink-0"
                style={{
                    width: W,
                    minWidth: W,
                    transition: 'width 0.3s ease, min-width 0.3s ease',
                }}
            />

            {/* ── Mobile bottom nav ── */}
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

            <div className="md:hidden" style={{ height: 60, flexShrink: 0 }} />
        </>
    );
}
