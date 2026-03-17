import Link from 'next/link';
import { auth0 } from "@/lib/auth0";
import LogoutButton from './LogoutButton';
import LoginButton from './LoginButton';
import { UserMenu } from './UserMenu';
import Image from 'next/image';

export default async function Navbar() {
    const session = await auth0.getSession();    
    const user = session?.user;
    
    return (
        <nav className="fixed w-full top-0 z-[1000] bg-white/95 backdrop-blur-[20px] border-b border-gray-200 shadow-soft">
            <div className="max-w-[1400px] mx-auto flex justify-between items-center">
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
                            className="no-underline text-navy/80 font-bold text-[15px] transition-all duration-300 hover:text-primary hover:-translate-y-0.5 relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-primary after:transition-all after:duration-300 hover:after:w-full"
                        >
                            Accueil
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="#fonctionnalites"
                            className="no-underline text-navy/80 font-bold text-[15px] transition-all duration-300 hover:text-primary hover:-translate-y-0.5 relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-primary after:transition-all after:duration-300 hover:after:w-full"
                        >
                            Fonctionnalités
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="#tarifs"
                            className="no-underline text-navy/80 font-bold text-[15px] transition-all duration-300 hover:text-primary hover:-translate-y-0.5 relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-primary after:transition-all after:duration-300 hover:after:w-full"
                        >
                            Tarifs
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="#contact"
                            className="no-underline text-navy/80 font-bold text-[15px] transition-all duration-300 hover:text-primary hover:-translate-y-0.5 relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-primary after:transition-all after:duration-300 hover:after:w-full"
                        >
                            Contact
                        </Link>
                    </li>
                </ul>

                {!user ? (
                    <LoginButton />
                ) : (
                    <UserMenu user={user} />
                )}

            </div>
        </nav>
    );
}