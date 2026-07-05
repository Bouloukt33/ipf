import type { ReactNode } from 'react';

interface PageHeroProps {
    /** Petit libellé au-dessus du titre (ex. « Dashboard »). */
    eyebrow?: string;
    title: string;
    subtitle?: string;
    /** Boutons / actions affichés à droite du titre. */
    actions?: ReactNode;
    /** Rangée basse du bandeau : KPIs verre dépoli, recherche, chips… */
    children?: ReactNode;
}

/**
 * Bandeau héros commun aux pages admin : gradient navy, halos orange,
 * contenu « verre dépoli » via les classes bg-white/10 + backdrop-blur.
 */
export function PageHero({ eyebrow, title, subtitle, actions, children }: PageHeroProps) {
    return (
        <section className="relative overflow-hidden rounded-[32px] bg-gradient-hero text-white px-8 py-8 lg:px-10 mb-8 shadow-card motion-safe:animate-fade-in-down">
            <div aria-hidden className="absolute -top-24 -right-16 w-72 h-72 rounded-full bg-primary/20 blur-3xl" />
            <div aria-hidden className="absolute -bottom-28 left-1/3 w-80 h-80 rounded-full bg-primary/10 blur-3xl" />

            <div className="relative flex flex-wrap items-center justify-between gap-6">
                <div>
                    {eyebrow && (
                        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-primary-light mb-2">
                            {eyebrow}
                        </p>
                    )}
                    <h1 className="text-[30px] font-black leading-tight">{title}</h1>
                    {subtitle && <p className="text-[14px] font-semibold text-white/60 mt-1">{subtitle}</p>}
                </div>
                {actions && <div className="flex items-center gap-2">{actions}</div>}
            </div>

            {children && <div className="relative mt-7">{children}</div>}
        </section>
    );
}
