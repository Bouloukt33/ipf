import { memo, useState, useCallback } from "react";
import { AvatarRow } from "./AvatarRow";
import type { IProfileData } from "@/lib/type";

const AGE_RANGES = [
    { value: 'AGE_18_25',   label: '18 – 24 ans' },
    { value: 'AGE_26_35',   label: '25 – 34 ans' },
    { value: 'AGE_36_45',   label: '35 – 44 ans' },
    { value: 'AGE_46_55',   label: '45 – 54 ans' },
    { value: 'AGE_56_PLUS', label: '55 ans et plus' },
];

const PRO_STATUSES = [
    { value: 'SALARIE',     label: 'Salarié' },
    { value: 'INDEPENDANT', label: 'Indépendant / Freelance' },
    { value: 'MANDATAIRE',  label: 'Mandataire' },
];

interface IAccountCardProps {
    profile: IProfileData | null;
    onSave: (data: Partial<IProfileData>) => Promise<void>;
}

export const AccountCard = memo(function AccountCard({ profile, onSave }: IAccountCardProps) {
    const [form,   setForm]   = useState<Partial<IProfileData>>(profile ?? {});
    const [saving, setSaving] = useState(false);
    const [saved,  setSaved]  = useState(false);

    const handleChange = useCallback(<K extends keyof IProfileData>(key: K, value: IProfileData[K]) => {
        setForm((prev) => ({ ...prev, [key]: value }));
        setSaved(false);
    }, []);

    const handleSave = useCallback(async () => {
        setSaving(true);
        try {
            await onSave(form);
            setSaved(true);
            setTimeout(() => setSaved(false), 2500);
        } finally {
            setSaving(false);
        }
    }, [form, onSave]);

    return (
        <div className="bg-white rounded-[18px] shadow-[0_2px_16px_rgba(23,46,66,0.08)] border-[1.5px] border-[rgba(23,46,66,0.06)] p-[28px_24px]">

            {/* Title */}
            <div className="flex items-center gap-2 text-[15px] font-[800] text-navy uppercase tracking-[0.5px] mb-[22px]">
                <svg className="w-[18px] h-[18px] fill-[#D27A2D] flex-shrink-0" viewBox="0 0 24 24">
                    <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                </svg>
                Détails du compte
            </div>

            <AvatarRow
                initial={profile?.displayName?.charAt(0)?.toUpperCase() ?? "U"}
                name={profile?.displayName ?? ""}
                email={profile?.email ?? ""}
                onChangePhoto={() => {}}
            />

            {/* Tranche d'âge */}
            <Field label="Tranche d'âge">
                <SelectField
                    options={AGE_RANGES}
                    value={form.ageRange ?? ""}
                    onChange={(v) => handleChange("ageRange", v)}
                />
            </Field>

            {/* Statut professionnel */}
            <Field label="Statut professionnel">
                <SelectField
                    options={PRO_STATUSES}
                    value={form.professionalStatus ?? ""}
                    onChange={(v) => handleChange("professionalStatus", v)}
                />
            </Field>

            {/* Secteur d'activité */}
            <Field label="Secteur d'activité">
                <SelectField
                    options={[
                        { value: 'immobilier',  label: 'Immobilier' },
                        { value: 'finance',     label: 'Finance & Banque' },
                        { value: 'droit',       label: 'Droit & Juridique' },
                        { value: 'commerce',    label: 'Commerce & Distribution' },
                        { value: 'tech',        label: 'Technologie' },
                        { value: 'autre',       label: 'Autre' },
                    ]}
                    value={form.sector ?? ""}
                    onChange={(v) => handleChange("sector", v)}
                />
            </Field>

            {/* Métier */}
            <Field label="Métier">
                <div className="relative flex items-center">
                    <input
                        type="text"
                        value={form.jobTitle ?? ""}
                        onChange={(e) => handleChange("jobTitle", e.target.value)}
                        placeholder="Votre métier"
                        className="w-full font-[600] text-[14px] text-navy bg-[#FAFAFA] border-[1.5px] border-[#D1D5DB] rounded-[12px] py-[11px] pl-[14px] pr-[38px] outline-none transition-all duration-200 placeholder:text-[#C0C0C0] placeholder:font-[600] focus:border-[#D27A2D] focus:shadow-[0_0_0_3px_rgba(210,122,45,0.12)] focus:bg-white cursor-text"
                    />
                    <span className="absolute right-[12px] pointer-events-none">
                        <svg className="w-[15px] h-[15px] fill-[#C0C0C0]" viewBox="0 0 24 24">
                            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                        </svg>
                    </span>
                </div>
            </Field>

            {/* Save button */}
            <div className="mt-5">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-br from-[#D27A2D] to-[#E89347] text-white text-[15px] font-[800] uppercase tracking-[0.5px] py-[14px] px-8 rounded-[16px] border-none cursor-pointer shadow-[0_4px_14px_rgba(210,122,45,0.35)] hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(210,122,45,0.5)] active:scale-[0.97] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                >
                    {saving ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : saved ? (
                        <>
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                            Enregistré !
                        </>
                    ) : (
                        <>
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                            Enregistrer
                        </>
                    )}
                </button>
            </div>
        </div>
    );
});

// ── Sub-components ────────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="mb-[14px] last:mb-0">
            <label className="block text-[11px] font-[800] text-[#6B7280] uppercase tracking-[0.6px] mb-[6px]">
                {label}
            </label>
            {children}
        </div>
    );
}

function SelectField({
    options, value, onChange,
}: {
    options: { value: string; label: string }[];
    value: string;
    onChange: (v: string) => void;
}) {
    return (
        <div className="relative flex items-center">
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full appearance-none font-[600] text-[14px] text-navy bg-[#FAFAFA] border-[1.5px] border-[#D1D5DB] rounded-[12px] py-[11px] pl-[14px] pr-[38px] outline-none transition-all duration-200 focus:border-[#D27A2D] focus:shadow-[0_0_0_3px_rgba(210,122,45,0.12)] focus:bg-white cursor-pointer"
            >
                {options.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                ))}
            </select>
            <span className="absolute right-[12px] pointer-events-none">
                <svg className="w-[15px] h-[15px] fill-[#C0C0C0]" viewBox="0 0 24 24">
                    <path d="M7 10l5 5 5-5z"/>
                </svg>
            </span>
        </div>
    );
}