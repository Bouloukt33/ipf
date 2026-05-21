import Link from "next/link";
import { useState } from "react";

interface ISidebarItemProps {
    href: string;
    label: string;
    icon: React.ReactNode;
    iconBg: string;
    isActive: boolean;
    collapsed: boolean;
    tooltip: string;
}

export function SidebarItem({ href, label, icon, iconBg, isActive, collapsed, tooltip }: ISidebarItemProps) {
    const [hovered, setHovered] = useState(false);

    return (
        <Link
            href={href}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: collapsed ? 0 : 14,
                padding: collapsed ? '10px' : '12px 14px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                borderRadius: 12,
                textDecoration: 'none',
                border: collapsed ? '3px solid' : '2px solid',
                borderColor: isActive ? 'rgba(210,122,45,0.4)' : 'transparent',

                background: collapsed
                    ? 'transparent'
                    : isActive
                        ? 'rgba(210,122,45,0.18)'
                        : hovered
                            ? 'rgba(255,255,255,0.07)'
                            : 'transparent',

                transition: 'background 0.15s, gap 0.3s ease, padding 0.3s ease, justify-content 0.3s ease',
                position: 'relative',
                cursor: 'pointer',
                overflow: 'visible',
            }}
        >
            {/* Icon — always visible, fixed size */}
            <div style={{
                width: 38,
                height: 38,
                minWidth: 38,
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                background: iconBg,
            }}>
                {icon}
            </div>

            {/* Label — collapses to 0 width instantly, expands after sidebar opens */}
            <div style={{
                overflow: 'hidden',
                maxWidth: collapsed ? 0 : 160,
                opacity: collapsed ? 0 : 1,
                flexShrink: 0,
                transition: collapsed
                    ? 'max-width 0s, opacity 0s'
                    : 'max-width 0s 0.28s, opacity 0.15s ease 0.28s',
                whiteSpace: 'nowrap',
            }}>
                <span style={{
                    fontSize: 14,
                    fontWeight: 900,
                    color: isActive ? '#D27A2D' : hovered ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.55)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.8px',
                    display: 'block',
                    transition: 'color 0.15s',
                }}>
                    {label}
                </span>
            </div>

            {/* Tooltip — position:fixed so it escapes sidebar overflow */}
            {collapsed && hovered && (
                <span style={{
                    position: 'fixed',
                    left: 78,
                    background: 'rgba(23,46,66,0.97)',
                    color: 'white',
                    fontSize: 12,
                    fontWeight: 700,
                    padding: '6px 10px',
                    borderRadius: 8,
                    whiteSpace: 'nowrap',
                    zIndex: 9999,
                    pointerEvents: 'none',
                    fontFamily: "'Nunito', sans-serif",
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                }}>
                    {tooltip}
                </span>
            )}
        </Link>
    );
}
