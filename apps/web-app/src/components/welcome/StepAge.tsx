"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AGE_OPTIONS, AgeFormValues, ageSchema } from "@/lib/profile-schema";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface StepAgeProps {
    defaultValues?: Partial<AgeFormValues>;
    onNext: (data: AgeFormValues) => void;
}

export function StepAge({ defaultValues, onNext }: StepAgeProps) {
    const {
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<AgeFormValues>({
        resolver: zodResolver(ageSchema),
        defaultValues: { age: defaultValues?.age },
    });

    const selectedAge = watch("age");

    const handleSelect = (value: AgeFormValues["age"]) => {
        setValue("age", value, { shouldValidate: true });
    };

    return (
        <form onSubmit={handleSubmit(onNext)} id="step-form">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {AGE_OPTIONS.map((option) => (
                    <button
                        key={option.value}
                        type="button"
                        onClick={() => handleSelect(option.value)}
                        className={cn(
                            "relative h-16 px-6 rounded-2xl border-[3px] font-bold text-base font-nunito",
                            "transition-all duration-300 cursor-pointer",
                            "hover:bg-orange-50 hover:text-navy",
                            selectedAge === option.value
                                ? "border-navy bg-navy text-white"
                                : "border-primary bg-white text-primary"
                        )}
                    >
                        {selectedAge === option.value && (
                            <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
                                <Check className="w-4 h-4 text-white stroke-[3]" />
                            </span>
                        )}
                        {option.label}
                    </button>
                ))}
            </div>

            {errors.age && (
                <p className="text-center mt-4 text-sm font-semibold text-red-600 font-nunito">
                    {errors.age.message}
                </p>
            )}
        </form>
    );
}