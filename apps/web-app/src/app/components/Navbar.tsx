import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="fixed w-full top-0 z-[1000] bg-dark-300/95 backdrop-blur-[20px] border-b-2 border-primary/20 shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
      <div className="max-w-[1400px] mx-auto px-10 py-[18px] flex justify-between items-center">
        <Link href="/" className="flex items-center gap-3 no-underline">
          <span className="text-xl font-extrabold text-white font-nunito">
            5 Secondes Chrono
          </span>
        </Link>
        
        <ul className="hidden md:flex gap-[35px] list-none items-center">
          <li>
            <Link 
              href="#accueil" 
              className="no-underline text-white/90 font-bold text-[15px] transition-all duration-300 hover:text-primary hover:-translate-y-0.5"
            >
              Accueil
            </Link>
          </li>
          <li>
            <Link 
              href="#fonctionnalites" 
              className="no-underline text-white/90 font-bold text-[15px] transition-all duration-300 hover:text-primary hover:-translate-y-0.5"
            >
              Fonctionnalités
            </Link>
          </li>
          <li>
            <Link 
              href="#tarifs" 
              className="no-underline text-white/90 font-bold text-[15px] transition-all duration-300 hover:text-primary hover:-translate-y-0.5"
            >
              Tarifs
            </Link>
          </li>
          <li>
            <Link 
              href="#contact" 
              className="no-underline text-white/90 font-bold text-[15px] transition-all duration-300 hover:text-primary hover:-translate-y-0.5"
            >
              Contact
            </Link>
          </li>
        </ul>

        <Link 
          href="/login" 
          className="px-[30px] py-3 bg-gradient-primary text-white rounded-[25px] font-extrabold cursor-pointer transition-all duration-300 no-underline text-[15px] shadow-primary hover:-translate-y-0.5 hover:shadow-primary-lg"
        >
          Connexion →
        </Link>
      </div>
    </nav>
  );
}