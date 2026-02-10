"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { STATUT_OPTIONS, StatutFormValues, statutSchema } from "@/lib/profile-schema";
import { cn } from "@/lib/utils";

interface StepStatutProps {
    defaultValues?: Partial<StatutFormValues>;
    onNext: (data: StatutFormValues) => void;
}

const STATUT_ICONS: Record<string, string> = {
    Salarié: "💼",
    Indépendant: "🚀",
    Mandataire: "🤝",
};

export function StepStatut({ defaultValues, onNext }: StepStatutProps) {
    const form = useForm<StatutFormValues>({
        resolver: zodResolver(statutSchema),
        defaultValues: { statut: defaultValues?.statut },
    });

    const selectedStatut = form.watch("statut");

    const handleSelect = (value: StatutFormValues["statut"]) => {
        form.setValue("statut", value, { shouldValidate: true });
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onNext)} id="step-form">
                <FormField
                    control={form.control}
                    name="statut"
                    render={() => (
                        <FormItem>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {STATUT_OPTIONS.map((option: any) => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => handleSelect(option.value)}
                                        className={cn(
                                            "relative px-6 py-8 rounded-2xl border-3 border-navy font-bold font-nunito",
                                            "transition-all duration-300 cursor-pointer text-center flex flex-col items-center gap-3",
                                            "hover:border-primary hover:-translate-y-1 hover:scale-[1.02] hover:shadow-primary",
                                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                                            selectedStatut === option.value
                                                ? "border-primary bg-gradient-to-br from-primary to-primary-light text-white shadow-primary scale-[1.03]"
                                                : "bg-white text-navy hover:bg-orange-50"
                                        )}
                                    >
                                        {selectedStatut === option.value && (
                                            <span className="absolute -top-3 -right-3 w-7 h-7 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white text-sm font-black shadow-soft">
                                                ✓
                                            </span>
                                        )}
                                        <span className="text-3xl">{STATUT_ICONS[option.value]}</span>
                                        <span className="text-base">{option.label}</span>
                                    </button>
                                ))}
                            </div>
                            <FormMessage className="text-center mt-3" />
                        </FormItem>
                    )}
                />
            </form>
        </Form>
    );
}