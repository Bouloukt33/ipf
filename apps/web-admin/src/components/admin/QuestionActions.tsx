import { useRef, useState } from 'react';
import { Upload, Download } from 'lucide-react';
import type { IQuestionStats } from '../../lib/types';
import { downloadCsvTemplate } from '../../lib/csv-template';
import { InfoTip } from './InfoTip';

/** Aide au survol du bouton d'import — reflète docs/import-questions-csv.md. */
export function CsvFormatHelp() {
    return (
        <>
            <p className="font-extrabold mb-1.5">Format du fichier CSV</p>
            <code className="block bg-white/10 rounded-lg px-2 py-1.5 text-[11px] mb-2 break-words">
                categorie;niveau;question;optionA;optionB;optionC;optionD;bonneReponse;premium
            </code>
            <ul className="list-disc pl-4 space-y-0.5">
                <li>En-tête obligatoire, séparateur <b>;</b> ou <b>,</b>, encodage UTF-8 (Excel ok)</li>
                <li><b>categorie</b> : slug ou nom exact (ex. bail-commercial)</li>
                <li><b>niveau</b> : 1 à 4 — <b>bonneReponse</b> : A, B, C ou D</li>
                <li><b>premium</b> : oui/non (optionnel, défaut non)</li>
                <li>Taille max ~2 Mo ; les lignes invalides sont ignorées et rapportées</li>
            </ul>
            <p className="mt-2 text-white/70">Astuce : partez du bouton « Modèle » pour un fichier prêt à remplir.</p>
        </>
    );
}

interface QuestionActionsProps {
    stats: IQuestionStats | null;
    onCreateNew: () => void;
    onImportCsv: (file: File) => Promise<void>;
}

export function QuestionActions({ stats, onCreateNew, onImportCsv }: QuestionActionsProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isImporting, setIsImporting] = useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = ''; // permet de réimporter le même fichier
        if (!file) return;
        setIsImporting(true);
        try {
            await onImportCsv(file);
        } finally {
            setIsImporting(false);
        }
    };

    return (
        <div className="flex flex-wrap items-end justify-between gap-5">
            {/* Stats — chips verre dépoli sur le bandeau héros */}
            {stats && (
                <div className="flex flex-wrap items-center gap-2">
                    <StatPill label="Total" value={stats.total} dot="bg-white/60" />
                    <StatPill label="Actifs" value={stats.active} dot="bg-[#34D399]" />
                    <StatPill label="Suspendus" value={stats.suspended} dot="bg-[#FBBF24]" />
                    <StatPill label="Archivés" value={stats.archived} dot="bg-white/30" />
                    <StatPill label="Premium" value={stats.premium} dot="bg-[#A78BFA]" />
                    <InfoTip
                        onDark
                        label="Signification des statuts"
                        side="bottom"
                        widthClass="w-72"
                        content={
                            <ul className="space-y-1">
                                <li><b>Actifs</b> : questions jouables dans les quiz.</li>
                                <li><b>Suspendus</b> : retirées temporairement, réactivables.</li>
                                <li><b>Archivés</b> : sorties définitivement des quiz, gardées pour l'historique.</li>
                                <li><b>Premium</b> : réservées aux abonnés payants.</li>
                            </ul>
                        }
                    />
                </div>
            )}

            {/* CTA */}
            <div className="flex items-center gap-2">
                <button
                    onClick={downloadCsvTemplate}
                    title="Télécharger un CSV pré-rempli, prêt pour Excel"
                    className="h-[44px] px-4 rounded-2xl border border-white/20 bg-white/5 backdrop-blur
                      font-extrabold text-[13px] text-white/80 cursor-pointer font-nunito
                      flex items-center gap-2 transition-colors hover:bg-white/15 hover:text-white"
                >
                    <Download size={15} aria-hidden />
                    Modèle
                </button>
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isImporting}
                    className="h-[44px] px-5 rounded-2xl border border-white/30 bg-white/10 backdrop-blur
                      font-extrabold text-[13px] text-white cursor-pointer font-nunito
                      flex items-center gap-2 transition-colors hover:bg-white/20
                      disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isImporting
                        ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        : <Upload size={15} aria-hidden />}
                    Importer CSV
                </button>
                <InfoTip
                    onDark
                    label="Format CSV attendu"
                    side="bottom"
                    widthClass="w-80"
                    content={<CsvFormatHelp />}
                />
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,text/csv"
                    className="hidden"
                    onChange={handleFileChange}
                />
                <button
                    onClick={onCreateNew}
                    className="h-[44px] px-5 rounded-2xl border-none bg-gradient-primary shadow-primary
                      font-extrabold text-[13px] text-white cursor-pointer font-nunito
                      flex items-center gap-2 transition-transform
                      motion-safe:hover:scale-[1.03] motion-safe:active:scale-[0.97]"
                >
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    Nouvelle question
                </button>
            </div>
        </div>
    );
}

function StatPill({
    label,
    value,
    dot,
}: {
    label: string;
    value: number;
    dot: string;
}) {
    return (
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/10 border border-white/15 backdrop-blur">
            <span aria-hidden className={`w-2 h-2 rounded-full ${dot}`} />
            <span className="text-[13px] font-extrabold text-white tabular-nums">{value}</span>
            <span className="text-[11px] font-bold text-white/60">{label}</span>
        </div>
    );
}
