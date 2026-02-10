"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import type {
    AgeFormValues,
    StatutFormValues,
    MetierFormValues,
    ProfileFormValues,
} from "@/lib/profile-schema";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProgressDots } from "./ProgressDots";
import { StepAge } from "./StepAge";
import { StepStatut } from "./StepStatut";
import { StepMetier } from "./StepMetier";

const STEPS = [
    { id: 1, question: "Quelle est ta tranche d'âge ?" },
    { id: 2, question: "Quel est ton statut professionnel ?" },
    { id: 3, question: "Quel est ton profil métier ?" },
];

interface ProfileFormProps {
    /**
     * Appelé après validation de la dernière étape.
     * Si fourni, c'est le parent qui gère la redirection (ex: cookie puis push).
     * Si absent, le composant redirige directement vers /dashboard.
     */
    onDone?: () => Promise<void>;
}

export function ProfileForm({ onDone }: ProfileFormProps) {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [profile, setProfile] = useState<Partial<ProfileFormValues>>({});

    const handleAgeNext = (data: AgeFormValues) => {
        setProfile((prev) => ({ ...prev, ...data }));
        setCurrentStep(1);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleStatutNext = (data: StatutFormValues) => {
        setProfile((prev) => ({ ...prev, ...data }));
        setCurrentStep(2);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleMetierNext = async (data: MetierFormValues) => {
        const finalProfile = { ...profile, ...data } as ProfileFormValues;
        setIsSubmitting(true);

        // Sauvegarde locale (remplacer par appel API si besoin)
        localStorage.setItem("userProfile", JSON.stringify(finalProfile));

        await new Promise((r) => setTimeout(r, 400));

        if (onDone) {
            await onDone();
        } else {
            router.push("/dashboard");
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep((prev) => prev - 1);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    const handleNext = () => {
        const form = document.getElementById("step-form") as HTMLFormElement | null;
        if (form) form.requestSubmit();
    };

    return (
        <div className="animate-fade-in-up">
            <ProgressDots total={3} current={currentStep} />

            <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-black text-navy font-nunito mb-2">
                    Quelques informations pour personnaliser ton expérience
                </h2>
                <p className="text-text-muted font-nunito text-sm">
                    Ces informations nous permettent de mieux adapter le contenu à ton profil
                </p>
            </div>

            <div className="text-center mb-6">
                <span className="inline-block text-lg font-extrabold text-navy font-nunito">
                    {STEPS[currentStep].question}
                </span>
            </div>

            <div key={currentStep} className="animate-fade-in-up">
                {currentStep === 0 && (
                    <StepAge defaultValues={profile} onNext={handleAgeNext} />
                )}
                {currentStep === 1 && (
                    <StepStatut defaultValues={profile} onNext={handleStatutNext} />
                )}
                {currentStep === 2 && (
                    <StepMetier defaultValues={profile} onNext={handleMetierNext} />
                )}
            </div>

            <div
                className={cn(
                    "flex gap-4 mt-10 pt-6 border-t-2 border-navy/10",
                    currentStep === 0 ? "justify-center" : "justify-between"
                )}
            >
                {currentStep > 0 && (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleBack}
                        disabled={isSubmitting}
                        className="min-w-[140px] h-14 rounded-2xl border-[3px] border-navy text-navy font-extrabold font-nunito uppercase tracking-wide text-sm hover:bg-navy hover:text-white transition-all duration-300"
                    >
                        <ChevronLeft className="mr-1 h-5 w-5" />
                        Retour
                    </Button>
                )}

                <Button
                    type="button"
                    onClick={handleNext}
                    disabled={isSubmitting}
                    className="min-w-[180px] h-14 rounded-2xl font-extrabold font-nunito uppercase tracking-wide text-sm bg-gradient-to-r from-primary to-primary-light text-white shadow-primary hover:shadow-primary-lg hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Chargement…
                        </>
                    ) : (
                        <>
                            Continuer
                            <ChevronRight className="ml-1 h-5 w-5" />
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}