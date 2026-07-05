/** Modèle d'import CSV de questions — voir docs/import-questions-csv.md. */
export const CSV_HEADER =
    'categorie;niveau;question;optionA;optionB;optionC;optionD;bonneReponse;premium';

const CSV_TEMPLATE =
    CSV_HEADER +
    '\n' +
    "bail-commercial;1;Quelle est la durée minimale d'un bail commercial ?;9 ans;3 ans;6 ans;1 an;A;non\n";

/** Taille maximale acceptée par l'API (voir bodyParser 2 Mo côté NestJS). */
export const CSV_MAX_SIZE_BYTES = 2 * 1024 * 1024;

export function downloadCsvTemplate() {
    // BOM en tête pour qu'Excel ouvre le fichier en UTF-8
    const blob = new Blob(['\uFEFF' + CSV_TEMPLATE], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'modele-import-questions.csv';
    link.click();
    URL.revokeObjectURL(url);
}
