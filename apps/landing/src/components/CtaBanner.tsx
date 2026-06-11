import Image from 'next/image';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';

export default function CtaBanner() {
    return (
        <section className="py-20 px-6 bg-navy relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px]" />
            </div>

            {/* Mascotte go — calée à droite */}
            <div
                className="absolute bottom-0 right-8 md:right-24 w-52 pointer-events-none hidden lg:block"
            >
                <Image
                    src="/mascotte/no_bg/go.png"
                    alt="Mascotte go"
                    width={208}
                    height={260}
                    className="object-contain w-full"
                />
            </div>

            <div className="max-w-3xl mx-auto text-center relative">
                <h2 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
                    Prêt à maîtriser
                    <span className="block gradient-text-animate">l'immobilier en 5 secondes ?</span>
                </h2>
                <p className="text-white/60 font-semibold text-lg mb-10">
                    Rejoignez 500+ professionnels qui progressent chaque jour.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <a
                        href={`${APP_URL}/auth/login`}
                        className="px-10 py-4 bg-gradient-primary text-white rounded-2xl font-black text-lg no-underline btn-press"
                    >
                        Commencer gratuitement
                    </a>
                    <a
                        href={`${APP_URL}/auth/login`}
                        className="px-10 py-4 bg-white/10 text-white border border-white/20 rounded-2xl font-bold text-lg hover:bg-white/20 transition-colors no-underline btn-press"
                    >
                        J'ai déjà un compte
                    </a>
                </div>
            </div>
        </section>
    );
}
