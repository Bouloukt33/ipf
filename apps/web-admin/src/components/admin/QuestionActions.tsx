import { useRef, useState } from 'react';
import { Upload, Download } from 'lucide-react';
import type { IQuestionStats } from '../../lib/types';
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

const CSV_TEMPLATE =
    'categorie;niveau;question;optionA;optionB;optionC;optionD;bonneReponse;premium\n' +
    "bail-commercial;1;Quelle est la durée minimale d'un bail commercial ?;9 ans;3 ans;6 ans;1 an;A;non\n";

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

    const downloadTemplate = () => {
        // BOM en tête pour qu'Excel ouvre le fichier en UTF-8
        const blob = new Blob(['\uFEFF' + CSV_TEMPLATE], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'modele-import-questions.csv';
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            {/* Stats pills */}
            {stats && (
                <div className="flex flex-wrap items-center gap-2">
                    <StatPill
                        label="Total"
                        value={stats.total}
                        color="text-[#172E42] bg-[rgba(30,58,95,0.08)]"
                    />
                    <StatPill
                        label="Actifs"
                        value={stats.active}
                        color="text-[#10B981] bg-[rgba(16,185,129,0.1)]"
                    />
                    <StatPill
                        label="Suspendus"
                        value={stats.suspended}
                        color="text-[#F59E0B] bg-[rgba(245,158,11,0.1)]"
                    />
                    <StatPill
                        label="Archivés"
                        value={stats.archived}
                        color="text-[#6B7280] bg-[rgba(107,114,128,0.1)]"
                    />
                    <StatPill
                        label="Premium"
                        value={stats.premium}
                        color="text-[#7C3AED] bg-[rgba(124,58,237,0.1)]"
                    />
                    <InfoTip
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
                    onClick={downloadTemplate}
                    title="Télécharger un CSV pré-rempli, prêt pour Excel"
                    className="h-[42px] px-4 rounded-[12px] border-2 border-gray-200 bg-white
                      font-extrabold text-[13px] text-[#5a7a99] cursor-pointer font-nunito
                      flex items-center gap-2 transition-all hover:border-[#D27A2D] hover:text-[#D27A2D]"
                >
                    <Download size={15} />
                    Modèle
                </button>
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isImporting}
                    className="h-[42px] px-5 rounded-[12px] border-2 border-[#172E42] bg-white
                      font-extrabold text-[13px] text-[#172E42] cursor-pointer font-nunito
                      flex items-center gap-2 transition-all hover:bg-[#172E42] hover:text-white
                      disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isImporting
                        ? <div className="w-4 h-4 border-2 border-gray-300 border-t-[#172E42] rounded-full animate-spin" />
                        : <Upload size={15} />}
                    Importer CSV
                </button>
                <InfoTip
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
                    className="h-[42px] px-5 rounded-[12px] border-none
                      bg-gradient-to-br from-[#D27A2D] to-[#F59E0B]
                      font-extrabold text-[13px] text-white cursor-pointer font-nunito
                      flex items-center gap-2 transition-all hover:shadow-lg hover:shadow-[rgba(210,122,45,0.3)]
                      hover:-translate-y-px"
                >
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
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
    color,
}: {
    label: string;
    value: number;
    color: string;
}) {
    return (
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${color}`}>
            <span className="text-[13px] font-extrabold">{value}</span>
            <span className="text-[11px] font-bold">{label}</span>
        </div>
    );
}
