import Link from 'next/link';

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
      { label: 'Centre d\'aide', href: '#' },
      { label: 'FAQ', href: '#' },
      { label: 'Nous contacter', href: '#' },
      { label: 'Blog', href: '#' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-dark-300 text-white py-[60px] px-10 border-t-2 border-primary/20">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[60px] mb-10">
          <div>
            <h3 className="text-[26px] mb-5 font-black">
              ⚡ 5 Secondes Chrono
            </h3>
            <p className="opacity-80 leading-[1.7] font-semibold">
              La plateforme d'apprentissage gamifiée qui révolutionne la formation en immobilier commercial. Développée par Le Carré Pro, leader de la formation professionnelle.
            </p>
          </div>

          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="text-xl mb-[25px] text-primary font-black">
                {section.title}
              </h4>
              <ul className="list-none">
                {section.links.map((link) => (
                  <li key={link.label} className="mb-[15px]">
                    <Link
                      href={link.href}
                      className="text-white/80 no-underline transition-all duration-300 font-bold hover:text-primary hover:translate-x-[5px] inline-block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t-2 border-white/10 pt-[30px] text-center opacity-70 font-bold">
          <p>© 2025 Le Carré Pro - 5 Secondes Chrono. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}