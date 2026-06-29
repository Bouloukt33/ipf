import { ChevronLeft } from "lucide-react";
import { useState } from "react";

export function CollapseButton({ collapsed, onClick }: { collapsed: boolean; onClick: () => void }) {
    const [hovered, setHovered] = useState(false);
    return (
        <button
            onClick={onClick}
            aria-label="Réduire/agrandir"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                background: hovered ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.08)',
                border: 'none',
                borderRadius: 8,
                width: 32,
                height: 32,
                minWidth: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
                transition: 'background 0.15s',
            }}
        >
            <ChevronLeft
                size={20}
                color="white"
                style={{
                    transition: 'transform 0.3s ease',
                    transform: collapsed ? 'rotate(180deg)' : 'rotate(0deg)',
                }}
            />
        </button>
    );
}
