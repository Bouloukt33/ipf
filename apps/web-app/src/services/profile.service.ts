import { API_ENDPOINTS } from '@/lib/api.config';
import { apiFetch } from '@/lib/api.fetch';
import { IProfileData, IPaymentMethod, IPlan } from '@/lib/type';

export const profileService = {
    /**
     * Récupère le profil complet de l'utilisateur connecté.
     */
    getProfile: (): Promise<IProfileData> =>
        apiFetch(API_ENDPOINTS.profile.me, {}),

    /**
     * Met à jour les informations du profil.
     */
    updateProfile: (data: Partial<IProfileData>): Promise<IProfileData> =>
        apiFetch(API_ENDPOINTS.profile.update, {
            method: 'PATCH',
            body: JSON.stringify(data),
        }),

    /**
     * Récupère le moyen de paiement actif de l'utilisateur.
     */
    getPaymentMethod: (): Promise<IPaymentMethod | null> =>
        apiFetch(API_ENDPOINTS.profile.paymentMethod, {}),

    /**
     * Récupère les plans d'abonnement disponibles + celui de l'utilisateur.
     */
    getPlans: (): Promise<IPlan[]> =>
        apiFetch(API_ENDPOINTS.profile.plans, {}),

    /**
     * Change le plan d'abonnement de l'utilisateur.
     */
    choosePlan: (slug: string): Promise<void> =>
        apiFetch(API_ENDPOINTS.profile.choosePlan, {
            method: 'POST',
            body: JSON.stringify({ slug }),
        }),

    /**
     * Résilie l'abonnement actuel.
     */
    cancelSubscription: (): Promise<void> =>
        apiFetch(API_ENDPOINTS.profile.cancelSubscription, {
            method: 'POST',
        }),
};