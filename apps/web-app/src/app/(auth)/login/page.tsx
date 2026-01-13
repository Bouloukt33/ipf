'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { login, LoginState } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <Button 
            type="submit" 
            className="w-full bg-gradient-primary hover:bg-gradient-primary hover:scale-105 transition-all duration-300 shadow-primary hover:shadow-primary-lg text-white font-black py-6 rounded-full text-lg" 
            disabled={pending}
        >
            {pending ? 'Connexion en cours...' : 'Se connecter'}
        </Button>
    );
}

export default function LoginPage() {
    const router = useRouter();
    const initialState: LoginState = {};
    const [state, formAction] = useFormState(login, initialState);

    useEffect(() => {
        if (state.success) {
            router.push('/dashboard');
            router.refresh();
        }
    }, [state.success, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-dark px-4 py-12 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute w-full h-full top-0 left-0 overflow-hidden opacity-30">
                <div className="absolute w-[300px] h-[300px] rounded-full bg-primary/20 top-[10%] right-[10%] animate-float-around" />
                <div className="absolute w-[200px] h-[200px] rounded-full bg-primary-light/20 bottom-[20%] left-[15%] animate-float-around [animation-delay:3s]" />
            </div>

            <div className="max-w-6xl w-full grid md:grid-cols-2 gap-12 items-center relative z-10">

                {/* Right Side - Form */}
                <div className="space-y-8">
                    <div className="text-center md:text-left">
                        <Link href="/">
                            <h1 className="text-4xl font-black text-white cursor-pointer hover:scale-105 transition-transform inline-block">
                                5 Secondes Chrono
                            </h1>
                        </Link>
                        <p className="mt-3 text-lg text-white/70 font-semibold">
                            Connectez-vous pour continuer votre apprentissage
                        </p>
                    </div>

                    <div className="bg-gradient-to-br from-primary/10 to-primary-light/5 backdrop-blur-lg py-10 px-8 shadow-2xl rounded-3xl border-2 border-primary/30">
                        <form action={formAction} className="space-y-6">
                            {state.errors?._form && (
                                <div className="bg-red-500/20 border-2 border-red-500/50 text-red-200 px-5 py-4 rounded-xl text-sm font-bold backdrop-blur-sm">
                                    {state.errors._form.join(', ')}
                                </div>
                            )}

                            <div className="space-y-3">
                                <Label htmlFor="email" className="text-white font-bold text-base">
                                    Adresse email
                                </Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    placeholder="vous@exemple.com"
                                    className="bg-dark-300/50 border-2 border-primary/30 text-white placeholder:text-white/40 focus:border-primary focus:ring-2 focus:ring-primary/50 rounded-xl py-6 font-semibold text-base"
                                />
                                {state.errors?.email && (
                                    <p className="text-sm text-red-300 font-bold">{state.errors.email.join(', ')}</p>
                                )}
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <Label htmlFor="password" className="text-white font-bold text-base">
                                        Mot de passe
                                    </Label>
                                    <Link 
                                        href="/forgot-password" 
                                        className="text-sm text-primary hover:text-primary-light font-bold transition-colors"
                                    >
                                        Mot de passe oublié ?
                                    </Link>
                                </div>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    placeholder="••••••••"
                                    className="bg-dark-300/50 border-2 border-primary/30 text-white placeholder:text-white/40 focus:border-primary focus:ring-2 focus:ring-primary/50 rounded-xl py-6 font-semibold text-base"
                                />
                                {state.errors?.password && (
                                    <p className="text-sm text-red-300 font-bold">{state.errors.password.join(', ')}</p>
                                )}
                            </div>

                            <div className="text-sm text-white/80 bg-primary/10 border-2 border-primary/30 p-4 rounded-xl backdrop-blur-sm">
                                <p className="font-bold mb-2 text-primary-light">🔑 Compte de test :</p>
                                <p className="font-semibold">Email: test@example.com</p>
                                <p className="font-semibold">Mot de passe: password</p>
                            </div>

                            <SubmitButton />

                            <div className="text-center pt-4">
                                <p className="text-white/70 font-semibold">
                                    Pas encore de compte ?{' '}
                                    <Link 
                                        href="/register" 
                                        className="text-primary hover:text-primary-light font-black transition-colors"
                                    >
                                        Créer un compte
                                    </Link>
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}