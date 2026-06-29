import Link from 'next/link';

const sections = [
    {
        title: 'Navigation',
        links: [
            { label: 'Fonctionnalités', href: '#fonctionnalites' },
            { label: 'Tarifs', href: '#tarifs' },
            { label: 'Contact', href: '#contact' },
        ],
    },
    {
        title: 'Légal',
        links: [
            { label: 'Mentions légales', href: '#' },
            { label: 'CGU', href: '#' },
            { label: 'Confidentialité', href: '#' },
            { label: 'RGPD', href: '#' },
        ],
    },
    {
        title: 'Support',
        links: [
            { label: "Centre d'aide", href: '#' },
            { label: 'FAQ', href: '#' },
            { label: 'Nous contacter', href: '#' },
            { label: 'Blog', href: '#' },
        ],
    },
];

export default function Footer() {
    return (
        <footer id="contact" className="bg-navy text-white py-16 px-6 border-t border-white/10">
            <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    <div>
                        <div className="text-xl font-black mb-4">
                            5 Secondes <span className="gradient-text-animate">Chrono</span>
                        </div>
                        <p className="text-white/50 text-sm font-semibold leading-relaxed">
                            La plateforme d'apprentissage gamifiée qui révolutionne la formation en immobilier commercial. Développée par Le Carré Pro.
                        </p>
                    </div>

                    {sections.map((section) => (
                        <div key={section.title}>
                            <h4 className="text-xs font-black uppercase tracking-widest text-primary mb-5">
                                {section.title}
                            </h4>
                            <ul className="space-y-3">
                                {section.links.map((link) => (
                                    <li key={link.label}>
                                        <Link
                                            href={link.href}
                                            className="text-white/50 text-sm font-semibold hover:text-white transition-colors no-underline"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="border-t border-white/10 pt-8 text-center text-white/30 text-sm font-semibold">
                    © 2025 Le Carré Pro — 5 Secondes Chrono. Tous droits réservés.
                </div>
            </div>
        </footer>
    );
}
