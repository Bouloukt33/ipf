"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AGE_OPTIONS, AgeFormValues, ageSchema } from "@/lib/profile-schema";
import { cn } from "@/lib/utils";

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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {AGE_OPTIONS.map((option) => (  
                    <button
                        key={option.value}
                        type="button"
                        onClick={() => handleSelect(option.value)}
                        className={cn(
                            "relative px-6 py-5 rounded-2xl border-3 border-navy font-bold text-navy font-nunito",
                            "transition-all duration-300 cursor-pointer text-center",
                            "hover:border-primary hover:-translate-y-1 hover:scale-[1.02] hover:shadow-primary",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                            selectedAge === option.value
                                ? "border-primary bg-gradient-to-br from-primary to-primary-light text-white shadow-primary scale-[1.03]"
                                : "bg-white hover:bg-orange-50"
                        )}
                    >
                        {selectedAge === option.value && (
                            <span className="absolute -top-3 -right-3 w-7 h-7 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white text-sm font-black shadow-soft">
                                ✓
                            </span>
                        )}
                        <span className="text-base">{option.label}</span>
                    </button>
                ))}
            </div>

            {errors.age && (
                <p className="text-center mt-3 text-sm font-medium text-destructive">
                    {errors.age.message}
                </p>
            )}
        </form>
    );
}