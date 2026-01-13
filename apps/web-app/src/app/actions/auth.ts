'use server';

import { redirect } from 'next/navigation';
import { createToken, setSession, clearSession } from '@/lib/auth';
import { loginApi, registerApi, LoginCredentials, RegisterData } from '@/lib/api';
import { z } from 'zod';

// Schémas de validation
const loginSchema = z.object({
    email: z.string().email('Email invalide'),
    password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
});

const registerSchema = z.object({
    name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
    email: z.string().email('Email invalide'),
    password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
});

export type LoginState = {
    errors?: {
        email?: string[];
        password?: string[];
        _form?: string[];
    };
    success?: boolean;
};

export type RegisterState = {
    errors?: {
        name?: string[];
        email?: string[];
        password?: string[];
        confirmPassword?: string[];
        _form?: string[];
    };
    success?: boolean;
};

export async function login(
    prevState: LoginState,
    formData: FormData
): Promise<LoginState> {
    // Validation
    const validatedFields = loginSchema.safeParse({
        email: formData.get('email'),
        password: formData.get('password'),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    const { email, password } = validatedFields.data;

    try {
        // Appeler l'API (mock pour l'instant)
        const response = await loginApi({ email, password });

        // Créer des tokens JWT
        const accessToken = await createToken(
            { user: response.user },
            '1h'
        );
        const refreshToken = await createToken(
            { user: response.user },
            '7d'
        );

        // Sauvegarder la session
        await setSession({
            user: response.user,
            accessToken,
            refreshToken,
        });

        return { success: true };
    } catch (error) {
        return {
            errors: {
                _form: [error instanceof Error ? error.message : 'Une erreur est survenue'],
            },
        };
    }
}

export async function register(
    prevState: RegisterState,
    formData: FormData
): Promise<RegisterState> {
    // Validation
    const validatedFields = registerSchema.safeParse({
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password'),
        confirmPassword: formData.get('confirmPassword'),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
        };
    } 

    const { name, email, password } = validatedFields.data;

    try {
        // Appeler l'API (mock pour l'instant)
        const response = await registerApi({ name, email, password });

        // Créer des tokens JWT
        const accessToken = await createToken(
            { user: response.user },
            '1h'
        );
        const refreshToken = await createToken(
            { user: response.user },
            '7d'
        );

        // Sauvegarder la session
        await setSession({
            user: response.user,
            accessToken,
            refreshToken,
        });

        return { success: true };
    } catch (error) {
        return {
            errors: {
                _form: [error instanceof Error ? error.message : 'Une erreur est survenue'],
            },
        };
    }
}

export async function logout() {
    await clearSession();
    redirect('/');
}