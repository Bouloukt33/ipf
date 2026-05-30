'use client'

import QuizLockedState from '@/components/quiz/QuizLockedState'
import QuizReadyState from '@/components/quiz/QuizReadyState'
import { api } from '@/lib/api'
import { useUser } from '@auth0/nextjs-auth0/client'
import { useEffect, useState } from 'react'
import FloatingBackground from '../components/FloatingBackground'

export default function QuizPage() {
    const [profileComplete, setProfileComplete] = useState<boolean | null>(null)
    const { user, isLoading: authLoading } = useUser()

    useEffect(() => {
        if (!user) {
            setProfileComplete(false)
            return
        }
        api.profile
            .get()
            .then((profile) => {
                setProfileComplete(!!(profile.ageRange && profile.professionalStatus && profile.jobProfileId))
            })
            .catch(() => setProfileComplete(false))
    }, [user])

    return (
        <main className="relative min-h-screen bg-surface flex items-center justify-center px-4 py-12 font-nunito overflow-hidden">
            <FloatingBackground />

            {/* Contenu centré par-dessus le fond */}
            <div className="relative z-10 flex items-center justify-center w-full">
                {authLoading || profileComplete === null ? (
                    <div className="w-6 h-6 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
                ) : profileComplete ? (
                    <QuizReadyState />
                ) : (
                    <QuizLockedState />
                )}
            </div>
        </main>
    )
}