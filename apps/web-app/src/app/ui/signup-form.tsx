'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { signup } from '@/app/actions/auth'

function SubmitButton() {
    const { pending } = useFormStatus()
    
    return (
        <button 
            type="submit" 
            disabled={pending}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded disabled:opacity-50"
        >
            {pending ? 'Inscription...' : 'S\'inscrire'}
        </button>
    )
}

export function SignupForm() {
    const [state, formAction] = useFormState(signup, undefined)

    return (
        <form action={formAction} className="space-y-4">
            {state?.message && (
                <div className="p-4 bg-red-50 text-red-600 rounded">
                    {state.message}
                </div>
            )}

            <div>
                <label htmlFor="name" className="block mb-2">Nom</label>
                <input 
                    id="name" 
                    name="name" 
                    placeholder="Votre nom"
                    className="w-full border px-4 py-2 rounded"
                />
                {state?.errors?.name && (
                    <p className="text-red-600 text-sm mt-1">{state.errors.name[0]}</p>
                )}
            </div>

            <div>
                <label htmlFor="email" className="block mb-2">Email</label>
                <input 
                    id="email" 
                    name="email" 
                    type="email" 
                    placeholder="email@exemple.com"
                    className="w-full border px-4 py-2 rounded"
                />
                {state?.errors?.email && (
                    <p className="text-red-600 text-sm mt-1">{state.errors.email[0]}</p>
                )}
            </div>

            <div>
                <label htmlFor="password" className="block mb-2">Mot de passe</label>
                <input 
                    id="password" 
                    name="password" 
                    type="password"
                    className="w-full border px-4 py-2 rounded"
                />
                {state?.errors?.password && (
                    <p className="text-red-600 text-sm mt-1">{state.errors.password[0]}</p>
                )}
            </div>

            <SubmitButton />
        </form>
    )
}