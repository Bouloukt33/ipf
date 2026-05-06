import { parseStyle } from "@/lib/parse.style";
import { memo } from "react";

interface IThemeFillProps {
    pct: number;
    barStyle?: string; 
}

export const ThemeFill = memo(function ThemeFill({ pct, barStyle }: IThemeFillProps) {
    return (
        <div
            className="h-full rounded-[5px] transition-[width] duration-500 ease-out"
            style={{ 
                width: `${pct}%`, 
                background: '#D27A2D', 
                ...parseStyle(barStyle) 
            }}
        />
    );
});