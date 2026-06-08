import { Link } from "react-router-dom";

export function MobileNavItem({ href, label, icon, isActive }: {
    href: string; label: string; icon: React.ReactNode; isActive: boolean;
}) {
    return (
        <Link to={href} style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            padding: '6px 2px',
            borderRadius: 8,
            flex: 1,
            textDecoration: 'none',
            background: isActive ? 'rgba(210,122,45,0.18)' : 'transparent',
        }}>
            {icon}
            <span style={{
                fontSize: 9,
                fontWeight: 900,
                letterSpacing: '0.3px',
                textTransform: 'uppercase',
                color: isActive ? '#D27A2D' : 'rgba(255,255,255,0.55)',
            }}>
                {label}
            </span>
        </Link>
    );
}
