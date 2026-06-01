import { useAuth0 } from "@auth0/auth0-react";
import { LogOut } from "lucide-react";
import { useState } from "react";

export function MobileLogoutItem() {
    const { logout } = useAuth0();
    const [hovered, setHovered] = useState(false);

    return (
        <button
            onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                padding: '6px 2px',
                borderRadius: 8,
                flex: 1,
                border: 'none',
                background: 'transparent',
                cursor: 'pointer'
            }}>
            <LogOut size={22} color={hovered ? '#f87171' : 'rgba(255,255,255,0.55)'} />
            <span style={{
                fontSize: 9,
                fontWeight: 900,
                letterSpacing: '0.3px',
                textTransform: 'uppercase',
                color: hovered ? '#f87171' : 'rgba(255,255,255,0.55)',
                transition: 'color 0.15s',
            }}>
                Quitter
            </span>
        </button>
    );
}
