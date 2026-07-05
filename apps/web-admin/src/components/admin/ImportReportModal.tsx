import { useEffect } from 'react';
import { AlertTriangle, Download, X, XCircle } from 'lucide-react';
import type { IImportReport } from '../../services/questions.service';
import { downloadCsvTemplate } from '../../lib/csv-template';
import { CsvFormatHelp } from './QuestionActions';

/** Résultat d'import à afficher : rapport ligne à ligne ou échec global. */
export type ImportModalData =
    | { kind: 'report'; report: IImportReport }
    | { kind: 'failure'; message: string };

interface ImportReportModalProps {
    data: ImportModalData | null;
    onClose: () => void;
}

export function ImportReportModal({ data, onClose }: ImportReportModalProps) {
    useEffect(() => {
        if (!data) return;
        const onKeyDown = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [data, onClose]);

    if (!data) return null;

    const report = data.kind === 'report' ? data.report : null;
    // Rouge si rien n'a pu être importé, ambre si import partiel
    const isTotalFailure = data.kind === 'failure' || report?.imported === 0;

    return (
        <div
            className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-navy/70 backdrop-blur"
            onClick={onClose}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="import-report-title"
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-xl max-h-[85vh] flex flex-col bg-white rounded-[28px] shadow-card
                  p-7 motion-safe:animate-scale-in"
            >
                {/* En-tête */}
                <div className="flex items-start gap-4 mb-5">
                    <span
                        aria-hidden
                        className={`flex items-center justify-center w-12 h-12 rounded-2xl flex-shrink-0
                          ${isTotalFailure ? 'bg-red-50 text-[#EF4444]' : 'bg-amber-50 text-[#B45309]'}`}
                    >
                        {isTotalFailure ? <XCircle size={24} /> : <AlertTriangle size={24} />}
                    </span>
                    <div className="flex-1 min-w-0">
                        <h2 id="import-report-title" className="text-[19px] font-black text-text-primary">
                            {isTotalFailure ? 'Import impossible' : 'Import partiel'}
                        </h2>
                        <p className="text-[13px] font-semibold text-text-muted">
                            {report
                                ? `${report.imported}/${report.total} question${report.total > 1 ? 's' : ''} importée${report.imported > 1 ? 's' : ''} — ` +
                                  `${report.errors.length} ligne${report.errors.length > 1 ? 's' : ''} ignorée${report.errors.length > 1 ? 's' : ''}`
                                : 'Aucune question n’a été importée.'}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        aria-label="Fermer"
                        className="w-9 h-9 rounded-xl border-none bg-surface text-text-muted cursor-pointer
                          flex items-center justify-center flex-shrink-0 transition-colors hover:bg-ink-100 hover:text-text-primary"
                    >
                        <X size={17} />
                    </button>
                </div>

                {/* Détail des erreurs */}
                <div className="flex-1 overflow-y-auto min-h-0">
                    {data.kind === 'failure' && (
                        <p
                            className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-100
                              text-[13px] font-bold text-[#B91C1C]"
                        >
                            {data.message}
                        </p>
                    )}

                    {report && report.errors.length > 0 && (
                        <ul className="mb-5 space-y-1.5">
                            {report.errors.map((e) => (
                                <li
                                    key={`${e.line}-${e.message}`}
                                    className="flex items-baseline gap-2.5 px-4 py-2 rounded-xl bg-amber-50/60
                                      text-[13px] font-semibold text-[#92400E]"
                                >
                                    <span className="font-black flex-shrink-0">Ligne {e.line}</span>
                                    <span className="min-w-0">{e.message}</span>
                                </li>
                            ))}
                        </ul>
                    )}

                    {/* Rappel du format attendu */}
                    <div className="bg-navy text-white rounded-2xl px-5 py-4 text-[12px] font-semibold leading-relaxed">
                        <CsvFormatHelp />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2 pt-5">
                    <button
                        onClick={downloadCsvTemplate}
                        className="h-[44px] px-5 rounded-[14px] border-2 border-gray-200 bg-white
                          font-extrabold text-[13px] text-text-muted cursor-pointer font-nunito
                          flex items-center gap-2 transition-colors hover:border-primary hover:text-primary"
                    >
                        <Download size={15} />
                        Télécharger le modèle
                    </button>
                    <button
                        onClick={onClose}
                        className="h-[44px] px-7 rounded-[14px] border-none bg-navy text-white
                          font-extrabold text-[13px] cursor-pointer font-nunito
                          transition-colors hover:bg-charcoal"
                    >
                        Fermer
                    </button>
                </div>
            </div>
        </div>
    );
}
