import Link from 'next/link';
import { Zap } from 'lucide-react';

const footerSections = [
  {
    title: 'Navigation',
    links: [
      { label: 'Accueil', href: '#accueil' },
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
    <footer id="contact" className="bg-navy text-white py-[60px] px-10 border-t-2 border-primary/30 relative overflow-hidden">
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/10 rounded-full blur-[150px] pointer-events-none"></div>

      <div className="max-w-[1400px] mx-auto relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[60px] mb-10">
          <div>
            <h3 className="text-[22px] mb-5 font-black gradient-text-animate flex items-center gap-2">
              <Zap className="w-5 h-5 fill-primary text-primary flex-shrink-0" />
              5 Secondes Chrono
            </h3>
            <p className="text-white/70 leading-[1.7] font-semibold text-sm">
              La plateforme d'apprentissage gamifiée qui révolutionne la formation en immobilier commercial. Développée par Le Carré Pro, leader de la formation professionnelle.
            </p>
          </div>

          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="text-base mb-[25px] text-primary font-black uppercase tracking-wide">
                {section.title}
              </h4>
              <ul className="list-none space-y-3.5">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-white/60 no-underline transition-colors duration-200 font-semibold text-sm hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 pt-[30px] text-center text-white/40 font-semibold text-sm">
          <p>© 2025 Le Carré Pro — 5 Secondes Chrono. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}
