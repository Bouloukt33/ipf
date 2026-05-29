import Link from 'next/link';
import { auth0 } from "@/lib/auth0";
import LoginButton from './LoginButton';
import { UserMenu } from './UserMenu';
import Image from 'next/image';
import MobileMenu from './MobileMenu';

export default async function Navbar() {
    const session = await auth0.getSession();
    const user = session?.user;

    return (
        <nav className="fixed w-full top-0 z-[1000] bg-white/95 backdrop-blur-[20px] border-b border-gray-200 shadow-soft">
            <div className="max-w-[1400px] mx-auto px-6 lg:px-8 flex justify-between items-center h-16">
                <Link href="/" className="flex items-center gap-3 no-underline group">
                    <Image
                        src='/images/logo_light.png'
                        alt="5secondes chrono"
                        width={150}
                        height={44}
                    />
                </Link>

                <ul className="hidden md:flex gap-[35px] list-none items-center">
                    <li>
                        <Link
                            href="#accueil"
                            className="no-underline text-navy/80 font-bold text-[15px] transition-colors duration-200 hover:text-primary relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-primary after:transition-all after:duration-200 hover:after:w-full"
                        >
                            Accueil
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="#fonctionnalites"
                            className="no-underline text-navy/80 font-bold text-[15px] transition-colors duration-200 hover:text-primary relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-primary after:transition-all after:duration-200 hover:after:w-full"
                        >
                            Fonctionnalités
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="#tarifs"
                            className="no-underline text-navy/80 font-bold text-[15px] transition-colors duration-200 hover:text-primary relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-primary after:transition-all after:duration-200 hover:after:w-full"
                        >
                            Tarifs
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="#contact"
                            className="no-underline text-navy/80 font-bold text-[15px] transition-colors duration-200 hover:text-primary relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-primary after:transition-all after:duration-200 hover:after:w-full"
                        >
                            Contact
                        </Link>
                    </li>
                </ul>

                <div className="flex items-center gap-3">
                    <div className="hidden md:block">
                        {!user ? <LoginButton /> : <UserMenu user={user} />}
                    </div>
                    <MobileMenu user={user ?? null} />
                </div>

            </div>
        </nav>
    );
}