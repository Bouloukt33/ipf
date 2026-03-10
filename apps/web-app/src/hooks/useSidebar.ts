import { Zone } from "@/lib/type";
import { getZone } from "@/lib/utils";
import { useCallback, useEffect, useState } from "react";

export function useSidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const [zone, setZone] = useState<Zone>('desktop');

    const applyZone = useCallback((z: Zone) => {
        setZone(z);
        if (z === 'mobile') { setCollapsed(false); return; }
        const key = `sb_${z}`;
        const saved = localStorage.getItem(key);
        setCollapsed(z === 'tablet' ? saved !== 'open' : saved === 'closed');
    }, []);

    useEffect(() => {
        applyZone(getZone());
        let timer: ReturnType<typeof setTimeout>;
        const onResize = () => { clearTimeout(timer); timer = setTimeout(() => applyZone(getZone()), 80); };
        window.addEventListener('resize', onResize);
        return () => { window.removeEventListener('resize', onResize); clearTimeout(timer); };
    }, [applyZone]);

    const toggle = useCallback(() => {
        if (zone === 'mobile') return;
        const next = !collapsed;
        setCollapsed(next);
        localStorage.setItem(`sb_${zone}`, next ? 'closed' : 'open');
    }, [zone, collapsed]);

    return { collapsed, zone, toggle };
}