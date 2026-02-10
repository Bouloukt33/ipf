"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    SECTEURS,
    METIERS_BY_SECTEUR,
    MetierFormValues,
    metierSchema,
} from "@/lib/profile-schema";
import { cn } from "@/lib/utils";

interface StepMetierProps {
    defaultValues?: Partial<MetierFormValues>;
    onNext: (data: MetierFormValues) => void;
}

export function StepMetier({ defaultValues, onNext }: StepMetierProps) {
    const form = useForm<MetierFormValues>({
        resolver: zodResolver(metierSchema),
        defaultValues: {
            secteur: defaultValues?.secteur ?? "",
            metier: defaultValues?.metier ?? "",
        },
    });

    const selectedSecteur = form.watch("secteur");
    const metiers = selectedSecteur ? METIERS_BY_SECTEUR[selectedSecteur] ?? [] : [];

    // Reset metier when secteur changes
    useEffect(() => {
        form.setValue("metier", "", { shouldValidate: false });
    }, [selectedSecteur, form]);

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onNext)} id="step-form" className="space-y-6">
                {/* Secteur select */}
                <FormField
                    control={form.control}
                    name="secteur"
                    render={({ field } : { field: any }) => (
                        <FormItem>
                            <FormLabel className="text-xs font-bold uppercase tracking-wider text-text-muted font-nunito">
                                1. Choisis ton secteur
                            </FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                    <SelectTrigger
                                        className={cn(
                                            "w-full h-14 px-5 rounded-2xl border-[3px] border-navy font-bold font-nunito text-base",
                                            "bg-white focus:border-primary focus:ring-4 focus:ring-primary/20",
                                            "hover:border-primary hover:bg-orange-50 transition-all duration-300",
                                            "data-[state=open]:border-primary data-[state=open]:ring-4 data-[state=open]:ring-primary/20"
                                        )}
                                    >
                                        <SelectValue placeholder="— Sélectionne un secteur —" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent className="rounded-2xl border-[3px] border-navy shadow-card font-nunito">
                                    {SECTEURS.map((s) => (
                                        <SelectItem
                                            key={s.value}
                                            value={s.value}
                                            className="font-semibold py-3 cursor-pointer hover:bg-orange-50 focus:bg-orange-50 rounded-xl"
                                        >
                                            {s.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Métier select — appears when secteur is selected */}
                {selectedSecteur && (
                    <div className="animate-slide-up">
                        <FormField
                            control={form.control}
                            name="metier"
                            render={({ field } : { field: any }) => (
                                <FormItem>
                                    <FormLabel className="text-xs font-bold uppercase tracking-wider text-text-muted font-nunito">
                                        2. Précise ton métier
                                    </FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger
                                                className={cn(
                                                    "w-full h-14 px-5 rounded-2xl border-[3px] border-navy font-bold font-nunito text-base",
                                                    "bg-white focus:border-primary focus:ring-4 focus:ring-primary/20",
                                                    "hover:border-primary hover:bg-orange-50 transition-all duration-300",
                                                    "data-[state=open]:border-primary data-[state=open]:ring-4 data-[state=open]:ring-primary/20"
                                                )}
                                            >
                                                <SelectValue placeholder="— Sélectionne un métier —" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className="rounded-2xl border-[3px] border-navy shadow-card font-nunito">
                                            {metiers.map((m: any) => (
                                                <SelectItem
                                                    key={m.value}
                                                    value={m.value}
                                                    className="font-semibold py-3 cursor-pointer hover:bg-orange-50 focus:bg-orange-50 rounded-xl"
                                                >
                                                    {m.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                )}
            </form>
        </Form>
    );
}