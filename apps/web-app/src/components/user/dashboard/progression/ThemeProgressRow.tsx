import { memo, type ReactNode } from "react";
import { ThemeFill } from "./ThemeFill";
import { Stars } from "./Stars";
import { IThemeItem } from "@/lib/type";

interface IThemeProgressRowProps {
    theme: IThemeItem;
}

export const ThemeProgressRow = memo(function ThemeProgressRow({ theme }: IThemeProgressRowProps) {
    return (
        <div className="border-2 border-[rgba(210,122,45,0.39)] rounded-[14px] p-[18px_22px] flex items-center gap-4 bg-white hover:translate-x-1 hover:shadow-soft transition-all duration-150">
            <div
                className="w-[52px] h-[52px] rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: theme.icBg }}
            >
                {theme.icSvg}
            </div>
            <div className="flex-1 min-w-0">
                <div className="text-[17px] font-black text-charcoal">{theme.name}</div>
                <div className="text-[13px] font-extrabold text-muted mt-0.5">{theme.count}</div>
                <div className="mt-2.5 flex items-center gap-2.5">
                    <div className="flex-1 h-2.5 bg-border rounded-[5px] overflow-hidden">
                        <ThemeFill pct={theme.pct} barStyle={theme.barStyle} />
                    </div>
                    <div className="text-[15px] font-black text-charcoal min-w-[42px] text-right">{theme.pct}%</div>
                </div>
                <Stars count={theme.stars} />
            </div>
        </div>
    );
});