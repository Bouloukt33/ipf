import { z } from "zod";

export const ageSchema = z.object({
    age: z.enum(["18-25", "26-35", "36-45", "46-55", "56+"], {
        message: "Veuillez sélectionner une tranche d'âge",
    }),
});

export const statutSchema = z.object({
    statut: z.enum(["Salarié", "Indépendant", "Mandataire"], {
        message: "Veuillez sélectionner un statut professionnel",
    }),
});

export const metierSchema = z.object({
    secteur: z.string().min(1, "Veuillez sélectionner un secteur"),
    metier: z.string().min(1, "Veuillez sélectionner un métier"),
});

// Full profile schema combining all steps
export const profileSchema = ageSchema.merge(statutSchema).merge(metierSchema);

export type AgeFormValues = z.infer<typeof ageSchema>;
export type StatutFormValues = z.infer<typeof statutSchema>;
export type MetierFormValues = z.infer<typeof metierSchema>;
export type ProfileFormValues = z.infer<typeof profileSchema>;

// Secteur / Métier data
export const SECTEURS = [
    { value: "immo_transaction", label: "Immobilier — Transaction" },
    { value: "immo_gestion", label: "Immobilier — Gestion locative" },
    { value: "immo_expertise", label: "Immobilier — Expertise et conseil" },
    { value: "finance", label: "Finance et patrimoine" },
    { value: "comptabilite", label: "Comptabilité et gestion" },
    { value: "commerce", label: "Commerce et entrepreneuriat" },
    { value: "collectivites", label: "Collectivités et aménagement" },
] as const;

export const METIERS_BY_SECTEUR: Record<string, { value: string; label: string }[]> = {
    immo_transaction: [
        { value: "agent_transaction_pro", label: "Agent immobilier transaction pro/commercial" },
        { value: "agent_transaction_hab", label: "Agent immobilier transaction habitation" },
        { value: "assistant_commercial", label: "Assistant(e) commercial(e) agence immobilière" },
    ],
    immo_gestion: [
        { value: "gestionnaire_locatif_pro", label: "Gestionnaire locatif professionnel/commercial" },
        { value: "gestionnaire_locatif_hab", label: "Gestionnaire locatif habitation" },
    ],
    immo_expertise: [
        { value: "expert_immobilier", label: "Expert immobilier" },
        { value: "consultant_immobilier", label: "Consultant en immobilier d'entreprise" },
    ],
    finance: [
        { value: "cgp", label: "Conseiller en gestion de patrimoine (CGP)" },
        { value: "conseiller_bancaire", label: "Conseiller bancaire professionnels" },
    ],
    comptabilite: [
        { value: "expert_comptable", label: "Expert-comptable" },
        { value: "collaborateur_cabinet", label: "Collaborateur cabinet comptable" },
        { value: "controleur_gestion", label: "Contrôleur de gestion" },
    ],
    commerce: [
        { value: "commercant", label: "Commerçant indépendant" },
        { value: "franchise", label: "Franchisé" },
        { value: "createur", label: "Créateur/repreneur d'entreprise" },
        { value: "artisan", label: "Artisan avec local commercial" },
    ],
    collectivites: [
        { value: "charge_dev_eco", label: "Chargé de développement économique territorial" },
        { value: "gestionnaire_foncier", label: "Gestionnaire foncier collectivité" },
    ],
};

export const AGE_OPTIONS: { value: AgeFormValues["age"]; label: string }[] = [
    { value: "18-25", label: "18-25 ans" },
    { value: "26-35", label: "26-35 ans" },
    { value: "36-45", label: "36-45 ans" },
    { value: "46-55", label: "46-55 ans" },
    { value: "56+", label: "56 ans et plus" },
];

export const STATUT_OPTIONS: { value: StatutFormValues["statut"]; label: string }[] = [
    { value: "Salarié", label: "Salarié" },
    { value: "Indépendant", label: "Indépendant" },
    { value: "Mandataire", label: "Mandataire" },
];