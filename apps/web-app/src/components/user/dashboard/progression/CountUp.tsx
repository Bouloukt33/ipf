import { useEffect, useState } from "react";

export function CountUp({ target, suffix = '' }: { target: number; suffix?: string }) {
    const [val, setVal] = useState(0)
    useEffect(() => {
        const dur = 900
        const start = performance.now()
        const step = (ts: number) => {
            const p = Math.min((ts - start) / dur, 1)
            const e = 1 - Math.pow(1 - p, 3)
            setVal(Math.round(e * target))
            if (p < 1) requestAnimationFrame(step)
        }
        requestAnimationFrame(step)
    }, [target])
    return (
        <>
            {val}
            {suffix}
        </>
    )
}