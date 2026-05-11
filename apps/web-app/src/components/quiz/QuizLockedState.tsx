import { CheckCircle, Lock, User } from 'lucide-react'
import Link from 'next/link'

const profileFields = [
    "Tranche d'âge",
    'Situation professionnelle',
    'Profil de poste',
]

export default function QuizLockedState() {
    return (
        <div className="relative overflow-hidden bg-background border border-gray-100 rounded-2xl p-10 max-w-md w-full text-center shadow-soft">

            {/* Cadenas décoratif en arrière-plan */}
            <div className="pointer-events-none absolute -bottom-6 -right-6 text-navy opacity-[0.04] select-none">
                <Lock size={180} strokeWidth={1.25} />
            </div>

            {/* Icône centrale */}
            <div className="mx-auto mb-6 w-14 h-14 rounded-full bg-surface border border-gray-200 flex items-center justify-center">
                <Lock size={22} className="text-text-muted" strokeWidth={1.75} />
            </div>

            {/* Titre */}
            <h1 className="text-xl font-extrabold text-text-primary mb-2">
                Complète ton profil pour continuer
            </h1>

            {/* Description */}
            <p className="text-sm text-text-muted leading-relaxed mb-8">
                Quelques informations supplémentaires sont nécessaires avant de pouvoir accéder aux quiz.
            </p>

            {/* Checklist */}
            <ul className="text-left space-y-3 mb-8">
                {profileFields.map((field) => (
                    <li key={field} className="flex items-center gap-3">
                        <CheckCircle size={16} className="text-gray-300 flex-shrink-0" />
                        <span className="text-sm text-text-muted">{field}</span>
                    </li>
                ))}
            </ul>

            {/* CTA */}
            <Link
                href="/dashboard/profile"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-primary text-white text-sm font-extrabold rounded-xl shadow-primary transition-all duration-200 hover:-translate-y-0.5 hover:shadow-primary-lg active:translate-y-0"
            >
                <User size={16} />
                Compléter mon profil
            </Link>
        </div>
    )
}