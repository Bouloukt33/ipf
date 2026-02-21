import Image from 'next/image'
import Link from 'next/link'

const mascots = [
    { src: '/mascots/fais_confiance.png', alt: 'Fais-moi confiance', delay: '[animation-delay:0ms]' },
    { src: '/mascots/just_click.png', alt: "Il ne reste plus qu'à cliquer", delay: '[animation-delay:120ms]' },
    { src: '/mascots/pret.png', alt: "J'espère que tu es prêt", delay: '[animation-delay:240ms]' },
]

export default function QuizPage() {
    return (
        <main className="min-h-screen bg-background flex items-center justify-center px-4 py-12 font-nunito">
            <div className="max-w-4xl w-full text-center">

                {/* Mascots */}
                <div className="flex justify-center items-start gap-8 mb-14">
                    {mascots.map((m) => (
                        <div
                            key={m.src}
                            className={`animate-fade-in-up opacity-0 flex-none group ${m.delay}`}
                        >
                            <Image
                                src={m.src}
                                alt={m.alt}
                                width={280}
                                height={280}
                                className="transition-transform duration-300 ease-in-out group-hover:scale-105 group-hover:rotate-2"
                            />
                        </div>
                    ))}
                </div>

                {/* CTA */}
                <div className="animate-fade-in-up opacity-0 [animation-delay:350ms]">
                    <h1 className="text-4xl font-extrabold text-text-primary mb-3">
                        Prêt(e) à tester tes connaissances&nbsp;?
                    </h1>
                    <p className="text-lg text-text-secondary/75 mb-9">
                        Choisis ton type de bail et lance-toi dans l&apos;aventure&nbsp;!
                    </p>

                    <Link
                        href="/quiz/selection"
                        className="inline-flex items-center gap-3 px-12 py-5 bg-gradient-primary text-white text-xl font-extrabold rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-primary-lg active:-translate-y-0.5"
                    >
                        <svg width="22" height="22" fill="currentColor" viewBox="0 0 20 20">
                            <path
                                fillRule="evenodd"
                                d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                                clipRule="evenodd"
                            />
                        </svg>
                        Démarrer un quiz
                    </Link>
                </div>

            </div>
        </main>
    )
}