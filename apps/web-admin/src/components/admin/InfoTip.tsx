import { useId, type ReactNode } from 'react';
import { Info } from 'lucide-react';

type Side = 'top' | 'bottom' | 'left' | 'right';

const SIDE_CLASSES: Record<Side, string> = {
    top:    'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left:   'right-full top-1/2 -translate-y-1/2 mr-2',
    right:  'left-full top-1/2 -translate-y-1/2 ml-2',
};

interface InfoTipProps {
    /** Contenu de la bulle — texte simple ou bloc riche (listes, code…). */
    content: ReactNode;
    side?: Side;
    /** Classe de largeur de la bulle, ex. 'w-80' pour un contenu riche. */
    widthClass?: string;
    /** aria-label du déclencheur. */
    label?: string;
    iconSize?: number;
}

/**
 * Icône ⓘ + bulle d'aide au survol ou au focus clavier.
 * Accessible : déclencheur focusable, bulle liée par aria-describedby.
 */
export function InfoTip({
    content,
    side = 'top',
    widthClass = 'w-64',
    label = "Plus d'informations",
    iconSize = 15,
}: InfoTipProps) {
    const id = useId();

    return (
        <span className="relative inline-flex group">
            <button
                type="button"
                aria-describedby={id}
                aria-label={label}
                className="flex items-center justify-center w-6 h-6 rounded-full border-none bg-transparent
                  text-text-muted cursor-help transition-colors hover:text-primary focus-visible:text-primary
                  focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary"
            >
                <Info size={iconSize} aria-hidden />
            </button>
            <span
                role="tooltip"
                id={id}
                className={`absolute z-[400] ${SIDE_CLASSES[side]} ${widthClass} pointer-events-none
                  bg-navy text-white text-left text-[12px] font-semibold leading-relaxed
                  rounded-2xl px-4 py-3 shadow-2xl border border-white/10
                  invisible opacity-0 transition-opacity duration-150
                  group-hover:visible group-hover:opacity-100
                  group-focus-within:visible group-focus-within:opacity-100`}
            >
                {content}
            </span>
        </span>
    );
}
