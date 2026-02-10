"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { STATUT_OPTIONS, StatutFormValues, statutSchema } from "@/lib/profile-schema";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface StepStatutProps {
    defaultValues?: Partial<StatutFormValues>;
    onNext: (data: StatutFormValues) => void;
}

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
                                            "relative px-2 py-2 rounded-2xl border-[3px] font-bold font-nunito",
                                            "transition-all duration-300 cursor-pointer text-center flex flex-col items-center gap-3",
                                            "hover:bg-orange-50 hover:text-navy",
                                            selectedStatut === option.value
                                                ? "border-navy bg-navy text-white"
                                                : "border-primary bg-white text-primary"
                                        )}
                                    >
                                        {selectedStatut === option.value && (
                                            <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
                                                <Check className="w-4 h-4 text-white stroke-[3]" />
                                            </span>
                                        )}
                                        <span className="text-base">{option.label}</span>
                                    </button>
                                ))}
                            </div>
                            <FormMessage className="text-center mt-4 font-nunito font-semibold" />
                        </FormItem>
                    )}
                />
            </form>
        </Form>
    );
}