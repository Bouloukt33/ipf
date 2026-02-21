'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

const TYPE_BAILS = [
    { id: 1, name: 'Bail Commercial', description: "Pour les locaux utilisés pour une activité commerciale, industrielle ou artisanale" },
    { id: 2, name: 'Bail Professionnel', description: "Pour l'exercice d'une profession libérale réglementée" },
    { id: 3, name: 'Bail Dérogatoire', description: "Bail de courte durée sans statut des baux commerciaux" },
    { id: 4, name: "Bail d'Habitation", description: "Pour la location d'un logement à usage d'habitation principale" },
]

export default function SelectionPage() {
    const router = useRouter()
    const [selected, setSelected] = useState<number | null>(null)
    const [loading, setLoading] = useState(false)

    function handleStart() {
        if (selected === null) return
        setLoading(true)
        const bail = TYPE_BAILS.find(b => b.id === selected)!
        const session = {
            sessionId: 'session_' + Date.now(),
            typeBail: bail,
            startTime: new Date().toISOString(),
        }
        localStorage.setItem('currentSession', JSON.stringify(session))
        router.push(`/quiz/play?sessionId=${session.sessionId}`)
    }

    return (
        <main className="max-w-5xl mx-auto px-4 sm:px-8 py-12 animate-fade-in-up opacity-0">

            {/* Header */}
            <div className="text-center mb-14">
                <div className="relative w-48 h-48 mx-auto mb-6 drop-shadow-[0_8px_20px_rgba(210,122,45,0.3)]">
                    <Image src="/mascots/joyeux.png" alt="Mascotte" fill className="object-contain" />
                </div>
                <h1 className="text-4xl font-extrabold text-navy mb-3">
                    Choisis ton <span className="text-primary">type de bail</span>
                </h1>
                <p className="text-lg font-semibold text-charcoal/80">
                    Sélectionne le type de bail que tu souhaites réviser
                </p>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                {TYPE_BAILS.map((bail) => {
                    const isSelected = selected === bail.id
                    return (
                        <button
                            key={bail.id}
                            onClick={() => setSelected(bail.id)}
                            className={`
                relative text-left bg-white border-[3px] rounded-2xl p-8
                transition-all duration-300 ease-out
                ${isSelected
                                    ? 'border-primary bg-primary/10 -translate-y-1 shadow-primary'
                                    : 'border-navy hover:border-primary hover:bg-primary/10 hover:-translate-y-1'
                                }
              `}
                        >
                            <span className={`
                absolute top-6 right-6 w-7 h-7 rounded-full border-[3px] transition-all duration-300
                ${isSelected ? 'border-primary bg-primary shadow-[inset_0_0_0_4px_white]' : 'border-navy'}
              `} />
                            <p className="text-xl font-extrabold text-navy mb-3 pr-10">{bail.name}</p>
                            <p className="text-base text-charcoal/85 leading-relaxed">{bail.description}</p>
                        </button>
                    )
                })}
            </div>

            {/* CTA */}
            <div className="border-t-2 border-navy/10 pt-8 flex justify-center">
                <button
                    onClick={handleStart}
                    disabled={selected === null || loading}
                    className="
            inline-flex items-center gap-3 px-12 py-5
            bg-gradient-primary text-white text-xl font-extrabold rounded-2xl
            transition-all duration-300
            hover:-translate-y-1 hover:shadow-primary-lg active:-translate-y-0.5
            disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none
          "
                >
                    {loading ? (
                        <>
                            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                            </svg>
                            Création de la session...
                        </>
                    ) : (
                        <>
                            <svg width="22" height="22" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                            </svg>
                            Commencer le Quiz
                        </>
                    )}
                </button>
            </div>

        </main>
    )
}