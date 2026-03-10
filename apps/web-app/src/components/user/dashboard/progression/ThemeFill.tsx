import { parseStyle } from "@/lib/parse.style";
import { IThemeFillProps } from "@/lib/type";
import { memo } from "react";

export const ThemeFill = memo(function ThemeFill({ pct, barStyle }: IThemeFillProps) {
    return (
        <div
            className="h-full rounded-[5px] transition-[width] duration-500 ease-out"
            style={{ width: `${pct}%`, ...parseStyle(barStyle) }}
        />
    );
});