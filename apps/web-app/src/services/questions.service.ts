import { generateQuestionCode, getNextIndex } from "@/lib/generateCode";
import { IQuestion, IQuestionFilters, IQuestionFormData, IQuestionStats } from "@/lib/question.types";

// ── Mock data ─────────────────────────────────────────────────────────────────
const MOCK_QUESTIONS: IQuestion[] = [
  {
    id: '1',
    code: 'COMCOMF001',
    text: 'Quelle est la durée minimale légale d\'un bail commercial en France ?',
    optionA: '3 ans',
    optionB: '6 ans',
    optionC: '9 ans',
    optionD: '12 ans',
    correctAnswer: 'C',
    leaseType: 'COM',
    categoryId: 'cat-1',
    categoryName: 'Durée & Renouvellement',
    difficulty: 'FACILE',
    timeToRead: 5,
    packId: 'PACK-DECOUVERTE',
    status: 'ACTIVE',
    isPremium: false,
    explanation: 'La durée minimale légale est de 9 ans selon l\'article L145-4 du Code de commerce.',
    successRate: 72,
    avgResponseTime: '3.1s',
    createdAt: '2025-01-10T10:00:00Z',
    updatedAt: '2025-01-10T10:00:00Z',
  },
  {
    id: '2',
    code: 'COMCOMM002',
    text: 'À quelle fréquence le loyer d\'un bail commercial peut-il être révisé ?',
    optionA: 'Tous les ans',
    optionB: 'Tous les 2 ans',
    optionC: 'Tous les 3 ans',
    optionD: 'Tous les 5 ans',
    correctAnswer: 'C',
    leaseType: 'COM',
    categoryId: 'cat-2',
    categoryName: 'Loyer & Révision',
    difficulty: 'MOYEN',
    timeToRead: 8,
    packId: 'PACK-COMPAGNON',
    status: 'ACTIVE',
    isPremium: false,
    explanation: 'Le loyer peut être révisé tous les 3 ans selon la règle triennale (ILC ou ILAT).',
    successRate: 58,
    avgResponseTime: '4.2s',
    createdAt: '2025-01-11T10:00:00Z',
    updatedAt: '2025-01-11T10:00:00Z',
  },
  {
    id: '3',
    code: 'COMCOMM003',
    text: 'Quel est le délai de préavis pour un congé donné par le bailleur à l\'échéance du bail ?',
    optionA: '3 mois',
    optionB: '6 mois',
    optionC: '9 mois',
    optionD: '12 mois',
    correctAnswer: 'B',
    leaseType: 'COM',
    categoryId: 'cat-1',
    categoryName: 'Durée & Renouvellement',
    difficulty: 'MOYEN',
    timeToRead: 8,
    status: 'ACTIVE',
    isPremium: false,
    explanation: 'Le bailleur doit donner congé au moins 6 mois avant l\'échéance (art. L145-9 C. com.).',
    successRate: 61,
    avgResponseTime: '3.8s',
    createdAt: '2025-01-12T10:00:00Z',
    updatedAt: '2025-01-12T10:00:00Z',
  },
  {
    id: '4',
    code: 'COMCOMD001',
    text: 'Qu\'est-ce que le déplafonnement du loyer ?',
    optionA: 'L\'augmentation libre du loyer',
    optionB: 'La possibilité de dépasser la variation de l\'indice lors du renouvellement',
    optionC: 'La suppression du loyer',
    optionD: 'Le gel du loyer',
    correctAnswer: 'B',
    leaseType: 'COM',
    categoryId: 'cat-2',
    categoryName: 'Loyer & Révision',
    difficulty: 'DIFFICILE',
    timeToRead: 15,
    status: 'ACTIVE',
    isPremium: true,
    explanation: 'Le déplafonnement permet de demander un loyer supérieur à la variation de l\'indice légal lors du renouvellement.',
    successRate: 39,
    avgResponseTime: '4.7s',
    createdAt: '2025-01-13T10:00:00Z',
    updatedAt: '2025-01-13T10:00:00Z',
  },
  {
    id: '5',
    code: 'DERCOMF001',
    text: 'Quelle est la durée maximale d\'un bail dérogatoire ?',
    optionA: '1 an',
    optionB: '2 ans',
    optionC: '3 ans',
    optionD: '5 ans',
    correctAnswer: 'C',
    leaseType: 'DER',
    categoryId: 'cat-3',
    categoryName: 'Types de Baux',
    difficulty: 'FACILE',
    timeToRead: 5,
    status: 'ACTIVE',
    isPremium: false,
    explanation: 'Le bail dérogatoire (ou précaire) ne peut excéder 3 ans au total.',
    successRate: 55,
    avgResponseTime: '4.0s',
    createdAt: '2025-01-14T10:00:00Z',
    updatedAt: '2025-01-14T10:00:00Z',
  },
  {
    id: '6',
    code: 'PROCOMF001',
    text: 'Un bail professionnel s\'applique aux professions libérales : vrai ou faux ?',
    optionA: 'Vrai',
    optionB: 'Faux',
    optionC: 'Uniquement pour les médecins',
    optionD: 'Uniquement si activité non commerciale',
    correctAnswer: 'A',
    leaseType: 'PRO',
    categoryId: 'cat-3',
    categoryName: 'Types de Baux',
    difficulty: 'FACILE',
    timeToRead: 5,
    status: 'ACTIVE',
    isPremium: false,
    explanation: 'Le bail professionnel est spécifiquement réservé aux professions libérales et activités non commerciales.',
    successRate: 81,
    avgResponseTime: '2.5s',
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-01-15T10:00:00Z',
  },
  {
    id: '7',
    code: 'FONCOMF001',
    text: 'Quel est le montant minimum du fonds de commerce pour être cédé ?',
    optionA: 'Aucun minimum légal',
    optionB: '10 000 €',
    optionC: '50 000 €',
    optionD: '100 000 €',
    correctAnswer: 'A',
    leaseType: 'FON',
    categoryId: 'cat-4',
    categoryName: 'Cession & Transmission',
    difficulty: 'FACILE',
    timeToRead: 5,
    status: 'SUSPENDED',
    isPremium: false,
    explanation: 'Il n\'existe pas de montant minimum légal pour la cession d\'un fonds de commerce.',
    successRate: 33,
    avgResponseTime: '4.9s',
    createdAt: '2025-01-16T10:00:00Z',
    updatedAt: '2025-02-01T10:00:00Z',
  },
  {
    id: '8',
    code: 'COMCOMF002',
    text: 'La clause de destination permet de définir :',
    optionA: 'Le loyer',
    optionB: 'L\'activité autorisée dans les locaux',
    optionC: 'La durée',
    optionD: 'Le dépôt de garantie',
    correctAnswer: 'B',
    leaseType: 'COM',
    categoryId: 'cat-5',
    categoryName: 'Clauses & Obligations',
    difficulty: 'FACILE',
    timeToRead: 5,
    status: 'ACTIVE',
    isPremium: false,
    explanation: 'La clause de destination précise la nature de l\'activité que le locataire est autorisé à exercer dans les locaux.',
    successRate: 76,
    avgResponseTime: '2.9s',
    createdAt: '2025-01-17T10:00:00Z',
    updatedAt: '2025-01-17T10:00:00Z',
  },
  {
    id: '9',
    code: 'COMCOMEC001',
    text: 'Un fonds de commerce peut-il faire l\'objet d\'un nantissement sans accord du bailleur ? Analysez les conditions légales applicables et les effets sur les parties au contrat de bail.',
    optionA: 'Oui, sans restriction ni formalité particulière',
    optionB: 'Non, l\'accord du bailleur est toujours obligatoire',
    optionC: 'Oui, mais notification obligatoire au bailleur dans les 15 jours',
    optionD: 'Uniquement si le bail le prévoit expressément',
    correctAnswer: 'C',
    leaseType: 'COM',
    categoryId: 'cat-4',
    categoryName: 'Cession & Transmission',
    difficulty: 'ETUDE_DE_CAS',
    timeToRead: 30,
    packId: 'PACK-REUSSITE',
    status: 'ACTIVE',
    isPremium: true,
    explanation: 'Le nantissement du fonds de commerce est possible sans accord du bailleur mais doit lui être notifié dans les 15 jours (art. L142-1 C. com.).',
    successRate: 28,
    avgResponseTime: '18.3s',
    createdAt: '2025-01-18T10:00:00Z',
    updatedAt: '2025-01-18T10:00:00Z',
  },
  {
    id: '10',
    code: 'COMCOMD002',
    text: 'Quelle est la différence entre la résiliation judiciaire et la résiliation de plein droit du bail commercial ?',
    optionA: 'Il n\'y a aucune différence',
    optionB: 'La résiliation judiciaire nécessite l\'intervention d\'un juge',
    optionC: 'La résiliation de plein droit est automatique, la judiciaire requiert un jugement',
    optionD: 'La résiliation de plein droit est impossible en bail commercial',
    correctAnswer: 'C',
    leaseType: 'COM',
    categoryId: 'cat-5',
    categoryName: 'Clauses & Obligations',
    difficulty: 'DIFFICILE',
    timeToRead: 20,
    status: 'ARCHIVED',
    isPremium: true,
    explanation: 'La clause résolutoire opère de plein droit après commandement resté infructueux, tandis que la résiliation judiciaire requiert une décision du tribunal.',
    successRate: 41,
    avgResponseTime: '9.1s',
    createdAt: '2025-01-19T10:00:00Z',
    updatedAt: '2025-03-01T10:00:00Z',
  },
];

// ── In-memory store (replace with real API calls) ─────────────────────────────
let questionsStore: IQuestion[] = [...MOCK_QUESTIONS];

// ── Service ───────────────────────────────────────────────────────────────────
export const questionsService = {
  /**
   * Fetch all questions, with optional filtering
   */
  async getAll(filters?: Partial<IQuestionFilters>): Promise<IQuestion[]> {
    await delay(200);
    let result = [...questionsStore];

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (x) =>
          x.text.toLowerCase().includes(q) ||
          x.code.toLowerCase().includes(q)
      );
    }
    if (filters?.leaseType) {
      result = result.filter((x) => x.leaseType === filters.leaseType);
    }
    if (filters?.categoryId) {
      result = result.filter((x) => x.categoryId === filters.categoryId);
    }
    if (filters?.difficulty) {
      result = result.filter((x) => x.difficulty === filters.difficulty);
    }
    if (filters?.status) {
      result = result.filter((x) => x.status === filters.status);
    }

    return result;
  },

  /**
   * Get a single question by ID
   */
  async getById(id: string): Promise<IQuestion | null> {
    await delay(100);
    return questionsStore.find((q) => q.id === id) ?? null;
  },

  /**
   * Create a new question
   */
  async create(data: IQuestionFormData): Promise<IQuestion> {
    await delay(300);
    const existingCodes = questionsStore.map((q) => q.code);
    const index = getNextIndex(existingCodes, data.leaseType, data.difficulty);
    const code = generateQuestionCode(data.leaseType, data.difficulty, index);
    const now = new Date().toISOString();
    const newQuestion: IQuestion = {
      id: crypto.randomUUID(),
      code,
      ...data,
      successRate: 0,
      createdAt: now,
      updatedAt: now,
    };
    questionsStore = [newQuestion, ...questionsStore];
    return newQuestion;
  },

  /**
   * Update an existing question
   */
  async update(id: string, data: Partial<IQuestionFormData>): Promise<IQuestion> {
    await delay(300);
    const idx = questionsStore.findIndex((q) => q.id === id);
    if (idx === -1) throw new Error('Question not found');
    const updated: IQuestion = {
      ...questionsStore[idx],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    questionsStore = questionsStore.map((q) => (q.id === id ? updated : q));
    return updated;
  },

  /**
   * Delete a question
   */
  async delete(id: string): Promise<void> {
    await delay(200);
    questionsStore = questionsStore.filter((q) => q.id !== id);
  },

  /**
   * Suspend a question
   */
  async suspend(id: string): Promise<IQuestion> {
    return questionsService.update(id, { status: 'SUSPENDED' });
  },

  /**
   * Archive a question
   */
  async archive(id: string): Promise<IQuestion> {
    return questionsService.update(id, { status: 'ARCHIVED' });
  },

  /**
   * Restore a suspended/archived question to active
   */
  async restore(id: string): Promise<IQuestion> {
    return questionsService.update(id, { status: 'ACTIVE' });
  },

  /**
   * Get aggregated stats
   */
  async getStats(): Promise<IQuestionStats> {
    await delay(100);
    return {
      total: questionsStore.length,
      active: questionsStore.filter((q) => q.status === 'ACTIVE').length,
      suspended: questionsStore.filter((q) => q.status === 'SUSPENDED').length,
      archived: questionsStore.filter((q) => q.status === 'ARCHIVED').length,
      premium: questionsStore.filter((q) => q.isPremium).length,
    };
  },
};

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
