import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import {
  createQuestion,
  fetchMeta,
  fetchQuestion,
  fetchQuestions,
  getAccessToken,
  updateQuestion,
  updateQuestionStatus,
} from '../lib/api';
import { questionFormSchema } from '../lib/schemas';
import type {
  MetaPayload,
  QuestionListMeta,
  QuestionRecord,
  QuestionStatus,
  Theme,
} from '../lib/types';

const LEVEL_OPTIONS = [
  { value: 1, label: 'Facile' },
  { value: 2, label: 'Moyen' },
  { value: 3, label: 'Difficile' },
  { value: 4, label: 'Etude de cas' },
];

const STATUS_OPTIONS: Array<{ value: QuestionStatus; label: string }> = [
  { value: 'ACTIVE', label: 'Actif' },
  { value: 'SUSPENDED', label: 'Suspendu' },
  { value: 'ARCHIVED', label: 'Archive' },
];

const TIME_OPTIONS = Array.from({ length: 26 }, (_, idx) => 5 + idx);

interface FormState {
  id?: string;
  categoryId: string;
  themeId: string;
  packId: string;
  videoId: string;
  text: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  level: number;
  timeToRead: number;
  status: QuestionStatus;
  isPremium: boolean;
}

const emptyForm = (): FormState => ({
  categoryId: '',
  themeId: '',
  packId: '',
  videoId: '',
  text: '',
  optionA: '',
  optionB: '',
  optionC: '',
  optionD: '',
  correctAnswer: 'A',
  level: 1,
  timeToRead: 5,
  status: 'ACTIVE',
  isPremium: false,
});

export function AdminDashboard() {
  const { user, logout, getAccessTokenSilently } = useAuth0();
  const [meta, setMeta] = useState<MetaPayload | null>(null);
  const [questions, setQuestions] = useState<QuestionRecord[]>([]);
  const [listMeta, setListMeta] = useState<QuestionListMeta | null>(null);
  const [filters, setFilters] = useState({
    categoryId: '',
    themeId: '',
    level: '',
    status: '',
  });
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formState, setFormState] = useState<FormState>(emptyForm);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [editingBase, setEditingBase] = useState<{
    categoryId: string;
    themeId: string | null;
    level: number;
  } | null>(null);

  const loadMeta = useCallback(async () => {
    const token = await getAccessToken(getAccessTokenSilently);
    const data = await fetchMeta(token);
    setMeta(data);
  }, [getAccessTokenSilently]);

  const appliedFilters = useMemo(() => {
    return {
      categoryId: filters.categoryId || undefined,
      themeId: filters.themeId || undefined,
      level: filters.level ? Number(filters.level) : undefined,
      status: (filters.status as QuestionStatus) || undefined,
      page,
      limit: 50,
    };
  }, [filters, page]);

  const loadQuestions = useCallback(async () => {
    setIsLoading(true);
    setActionMessage(null);
    try {
      const token = await getAccessToken(getAccessTokenSilently);
      const data = await fetchQuestions(token, appliedFilters);
      console.log('[AdminDashboard] Questions loaded:', data.data.length, 'total:', data.meta.total);
      setQuestions(data.data);
      setListMeta(data.meta);
    } catch (err) {
      console.error('Error loading questions:', err);
      setActionMessage(err instanceof Error ? `Erreur: ${err.message}` : 'Erreur lors du chargement des questions');
    } finally {
      setIsLoading(false);
    }
  }, [appliedFilters, getAccessTokenSilently]);

  useEffect(() => {
    loadMeta().catch((err: Error) => setActionMessage(err.message));
  }, [loadMeta]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  const filteredThemes = useMemo(() => {
    if (!meta) return [] as Theme[];
    if (filters.categoryId) {
      return (
        meta.categories.find((cat) => cat.id === filters.categoryId)?.themes ||
        []
      );
    }
    return meta.categories.flatMap((cat) => cat.themes || []);
  }, [meta, filters.categoryId]);

  const formThemes = useMemo(() => {
    if (!meta) return [] as Theme[];
    if (!formState.categoryId) return [] as Theme[];
    return (
      meta.categories.find((cat) => cat.id === formState.categoryId)?.themes ||
      []
    );
  }, [meta, formState.categoryId]);

  const previewCodification = useMemo(() => {
    if (!meta || !formState.categoryId) return '---';
    const category = meta.categories.find(
      (item) => item.id === formState.categoryId,
    );
    if (!category) return '---';
    const theme = meta.categories
      .flatMap((item) => item.themes || [])
      .find((item) => item.id === formState.themeId);

    const typeCode = toCode3(category.slug || category.name);
    const themeCode = theme ? toCode3(theme.slug || theme.name) : 'COM';
    const levelCode = levelToCode(formState.level);

    return `${typeCode}${themeCode}${levelCode}###`;
  }, [meta, formState.categoryId, formState.themeId, formState.level]);

  const onFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      ...(key === 'categoryId' ? { themeId: '' } : null),
    }));
    setPage(1);
  };

  const onFormChange = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
  };

  const resetForm = () => {
    setFormMode('create');
    setFormErrors({});
    setEditingBase(null);
    setFormState(emptyForm());
  };

  const handleEdit = async (id: string) => {
    const token = await getAccessToken(getAccessTokenSilently);
    const question = await fetchQuestion(token, id);

    setFormMode('edit');
    setEditingBase({
      categoryId: question.categoryId,
      themeId: question.themeId || null,
      level: question.level,
    });

    setFormState({
      id: question.id,
      categoryId: question.categoryId,
      themeId: question.themeId || '',
      packId: question.packId || '',
      videoId: question.videoId || '',
      text: question.text,
      optionA: question.optionA,
      optionB: question.optionB,
      optionC: question.optionC,
      optionD: question.optionD,
      correctAnswer: question.correctAnswer as FormState['correctAnswer'],
      level: question.level,
      timeToRead: question.timeToRead || 5,
      status: question.status,
      isPremium: question.isPremium,
    });
  };

  const submitForm = async () => {
    const parsed = questionFormSchema.safeParse({
      ...formState,
      themeId: formState.themeId || undefined,
      packId: formState.packId || undefined,
      videoId: formState.videoId || undefined,
    });

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const [key, messages] of Object.entries(
        parsed.error.flatten().fieldErrors,
      )) {
        if (messages?.[0]) fieldErrors[key] = messages[0];
      }
      setFormErrors(fieldErrors);
      return;
    }

    setFormErrors({});

    const payload = {
      categoryId: formState.categoryId,
      themeId: formState.themeId || null,
      packId: formState.packId || null,
      videoId: formState.videoId || null,
      text: formState.text,
      optionA: formState.optionA,
      optionB: formState.optionB,
      optionC: formState.optionC,
      optionD: formState.optionD,
      correctAnswer: formState.correctAnswer,
      level: formState.level,
      timeToRead: formState.timeToRead,
      status: formState.status,
      isPremium: formState.isPremium,
    };

    try {
      const token = await getAccessToken(getAccessTokenSilently);

      if (formMode === 'create') {
        await createQuestion(token, payload);
        setActionMessage('Question creee');
      } else if (formState.id) {
        const regenerateCodification = editingBase
          ? editingBase.categoryId !== formState.categoryId ||
            editingBase.themeId !== (formState.themeId || null) ||
            editingBase.level !== formState.level
          : false;

        await updateQuestion(token, formState.id, {
          ...payload,
          regenerateCodification,
        });
        setActionMessage('Question mise a jour');
      }

      await loadQuestions();
      resetForm();
    } catch (err) {
      setActionMessage(
        err instanceof Error ? err.message : 'Erreur lors de la sauvegarde',
      );
    }
  };

  const setStatus = async (id: string, status: QuestionStatus) => {
    try {
      const token = await getAccessToken(getAccessTokenSilently);
      await updateQuestionStatus(token, id, status);
      const msg = 
        status === 'ACTIVE' ? 'Question activee' : 
        status === 'SUSPENDED' ? 'Question desactivee' : 'Question archivee';
      setActionMessage(msg);
      await loadQuestions();
    } catch (err) {
      setActionMessage(
        err instanceof Error ? err.message : 'Erreur lors du changement',
      );
    }
  };

  const logoutUser = () => {
    logout({ logoutParams: { returnTo: window.location.origin } });
  };

  const totalQuestions = listMeta?.total ?? 0;

  return (
    <div className="min-h-screen px-6 pb-16 pt-10 lg:px-12">
      <div className="mx-auto flex max-w-7xl flex-col gap-10">
        <header className="relative overflow-hidden rounded-3xl border border-ink-100 bg-white/80 p-8 shadow-soft">
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gradient-to-br from-tide-200 via-transparent to-copper-200 opacity-70 blur-2xl" />
          <div className="relative flex flex-wrap items-center justify-between gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-ink-500">
                IPF Admin
              </p>
              <h1 className="mt-2 text-3xl font-semibold text-ink-900">
                Dashboard Questions
              </h1>
              <p className="mt-2 text-sm text-ink-600">
                Gestion securisee des questions, par categorie et niveau.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <div className="rounded-2xl border border-ink-100 bg-ink-50 px-4 py-3 text-sm">
                <p className="text-xs uppercase tracking-[0.25em] text-ink-500">
                  Utilisateur
                </p>
                <p className="mt-1 font-semibold text-ink-900">
                  {user?.email || 'Admin'}
                </p>
              </div>
              <button
                className="rounded-full border border-ink-200 px-5 py-2 text-sm font-semibold text-ink-700 transition hover:-translate-y-0.5"
                onClick={logoutUser}
              >
                Deconnexion
              </button>
            </div>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="glass-panel rounded-3xl p-6 shadow-soft">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-ink-500">
                  Memo
                </p>
                <p className="mt-2 text-sm text-ink-700">
                  Pensez a demander le nouveau CSV au client si la structure change.
                </p>
              </div>
              <div className="rounded-2xl border border-ink-100 bg-white/70 px-4 py-3 text-sm">
                <p className="text-xs uppercase tracking-[0.25em] text-ink-500">
                  Total questions
                </p>
                <p className="mt-1 text-lg font-semibold text-ink-900">
                  {totalQuestions}
                </p>
              </div>
            </div>
          </div>
          <div className="glass-panel rounded-3xl p-6 shadow-soft">
            <p className="text-xs uppercase tracking-[0.25em] text-ink-500">
              Codification
            </p>
            <p className="mt-2 text-2xl font-semibold text-ink-900">
              {previewCodification}
            </p>
            <p className="mt-2 text-sm text-ink-600">
              Generation automatique basee sur type de bail, categorie et niveau.
            </p>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[2fr_1.1fr]">
          <div className="glass-panel rounded-3xl p-6 shadow-soft">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-ink-900">Questions</h2>
                <p className="text-sm text-ink-600">
                  Filtrez par type de bail, categorie et niveau.
                </p>
              </div>
              <button
                className="rounded-full bg-ink-900 px-5 py-2 text-sm font-semibold text-white shadow-glow transition hover:-translate-y-0.5"
                onClick={resetForm}
              >
                Nouvelle question
              </button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <FilterSelect
                label="Type de bail"
                value={filters.categoryId}
                onChange={(value) => onFilterChange('categoryId', value)}
                options={meta?.categories || []}
                placeholder="Tous"
              />
              <FilterSelect
                label="Categorie"
                value={filters.themeId}
                onChange={(value) => onFilterChange('themeId', value)}
                options={filteredThemes}
                placeholder="Toutes"
              />
              <FilterSelect
                label="Niveau"
                value={filters.level}
                onChange={(value) => onFilterChange('level', value)}
                options={LEVEL_OPTIONS}
                placeholder="Tous"
              />
              <FilterSelect
                label="Status"
                value={filters.status}
                onChange={(value) => onFilterChange('status', value)}
                options={STATUS_OPTIONS}
                placeholder="Tous"
              />
            </div>

            <div className="mt-6 overflow-x-auto scrollbar-thin">
              <table className="min-w-full text-left text-sm">
                <thead className="text-xs uppercase tracking-[0.25em] text-ink-500">
                  <tr>
                    <th className="py-3">Code</th>
                    <th className="py-3">Question</th>
                    <th className="py-3">Type</th>
                    <th className="py-3">Categorie</th>
                    <th className="py-3">Niveau</th>
                    <th className="py-3">Status</th>
                    <th className="py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-100">
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="py-6 text-center text-ink-500">
                        Chargement...
                      </td>
                    </tr>
                  ) : questions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-6 text-center text-ink-500">
                        Aucune question trouvee.
                      </td>
                    </tr>
                  ) : (
                    questions.map((question) => (
                      <tr key={question.id} className="hover:bg-ink-50/50">
                        <td className="py-4 pr-4 font-mono text-xs text-ink-700">
                          {question.codification || '---'}
                        </td>
                        <td className="py-4 pr-4">
                          <p className="font-semibold text-ink-900">
                            {question.text}
                          </p>
                          <p className="text-xs text-ink-500">
                            {question.timeToRead ? `${question.timeToRead}s` : 'N/A'}
                          </p>
                        </td>
                        <td className="py-4 pr-4 text-ink-700">
                          {question.category?.name || '---'}
                        </td>
                        <td className="py-4 pr-4 text-ink-700">
                          {question.theme?.name || '---'}
                        </td>
                        <td className="py-4 pr-4 text-ink-700">
                          {levelLabel(question.level)}
                        </td>
                        <td className="py-4 pr-4">
                          <StatusPill status={question.status} />
                        </td>
                        <td className="py-4 pr-4">
                          <div className="flex flex-wrap gap-2">
                            <button
                              className="rounded-full border border-ink-200 px-3 py-1 text-xs font-semibold text-ink-700 transition hover:-translate-y-0.5"
                              onClick={() => handleEdit(question.id)}
                            >
                              Modifier
                            </button>
                            {question.status === 'ACTIVE' ? (
                              <button
                                className="rounded-full border border-ink-200 px-3 py-1 text-xs font-semibold text-ink-700 transition hover:-translate-y-0.5"
                                onClick={() =>
                                  setStatus(question.id, 'SUSPENDED')
                                }
                              >
                                Desactiver
                              </button>
                            ) : (
                              <button
                                className="rounded-full border border-tide-200 bg-tide-50 px-3 py-1 text-xs font-semibold text-tide-700 transition hover:-translate-y-0.5"
                                onClick={() =>
                                  setStatus(question.id, 'ACTIVE')
                                }
                              >
                                Activer
                              </button>
                            )}
                            <button
                              className="rounded-full border border-copper-200 bg-copper-50 px-3 py-1 text-xs font-semibold text-copper-700 transition hover:-translate-y-0.5"
                              onClick={() =>
                                setStatus(question.id, 'ARCHIVED')
                              }
                            >
                              Supprimer
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
              <p className="text-xs uppercase tracking-[0.25em] text-ink-500">
                Page {listMeta?.page || 1} / {listMeta?.totalPages || 1}
              </p>
              <div className="flex gap-3">
                <button
                  className="rounded-full border border-ink-200 px-4 py-2 text-xs font-semibold text-ink-700 disabled:opacity-50"
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={!listMeta || listMeta.page <= 1}
                >
                  Precedent
                </button>
                <button
                  className="rounded-full border border-ink-200 px-4 py-2 text-xs font-semibold text-ink-700 disabled:opacity-50"
                  onClick={() =>
                    setPage((prev) =>
                      listMeta ? Math.min(listMeta.totalPages, prev + 1) : prev,
                    )
                  }
                  disabled={!listMeta || listMeta.page >= listMeta.totalPages}
                >
                  Suivant
                </button>
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-3xl p-6 shadow-soft">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-ink-900">
                  {formMode === 'create' ? 'Creation' : 'Edition'}
                </h2>
                <p className="text-sm text-ink-600">
                  {formMode === 'create'
                    ? 'Nouvelle question admin.'
                    : 'Mettez a jour les champs.'}
                </p>
              </div>
              {formMode === 'edit' ? (
                <button
                  className="text-xs uppercase tracking-[0.3em] text-ink-500"
                  onClick={resetForm}
                >
                  Reset
                </button>
              ) : null}
            </div>

            <div className="mt-6 grid gap-4">
              <FilterSelect
                label="Type de bail"
                value={formState.categoryId}
                onChange={(value) => onFormChange('categoryId', value)}
                options={meta?.categories || []}
                placeholder="Selection"
                error={formErrors.categoryId}
              />
              <FilterSelect
                label="Categorie"
                value={formState.themeId}
                onChange={(value) => onFormChange('themeId', value)}
                options={formThemes}
                placeholder="Optionnel"
                error={formErrors.themeId}
              />
              <FilterSelect
                label="Pack"
                value={formState.packId}
                onChange={(value) => onFormChange('packId', value)}
                options={meta?.packs || []}
                placeholder="Optionnel"
              />
              <FilterSelect
                label="Video pedagogique"
                value={formState.videoId}
                onChange={(value) => onFormChange('videoId', value)}
                options={meta?.videos || []}
                placeholder="Optionnel"
                renderOption={(video) =>
                  `${video.title} ${video.category?.name ? `- ${video.category.name}` : ''}`
                }
              />

              <TextArea
                label="Texte de la question"
                value={formState.text}
                onChange={(value) => onFormChange('text', value)}
                error={formErrors.text}
              />

              <div className="grid gap-3 sm:grid-cols-2">
                <TextInput
                  label="Option A"
                  value={formState.optionA}
                  onChange={(value) => onFormChange('optionA', value)}
                  error={formErrors.optionA}
                />
                <TextInput
                  label="Option B"
                  value={formState.optionB}
                  onChange={(value) => onFormChange('optionB', value)}
                  error={formErrors.optionB}
                />
                <TextInput
                  label="Option C"
                  value={formState.optionC}
                  onChange={(value) => onFormChange('optionC', value)}
                  error={formErrors.optionC}
                />
                <TextInput
                  label="Option D"
                  value={formState.optionD}
                  onChange={(value) => onFormChange('optionD', value)}
                  error={formErrors.optionD}
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <FilterSelect
                  label="Bonne reponse"
                  value={formState.correctAnswer}
                  onChange={(value) =>
                    onFormChange('correctAnswer', value as FormState['correctAnswer'])
                  }
                  options={[
                    { value: 'A', label: 'A' },
                    { value: 'B', label: 'B' },
                    { value: 'C', label: 'C' },
                    { value: 'D', label: 'D' },
                  ]}
                  placeholder="Choisir"
                  error={formErrors.correctAnswer}
                />
                <FilterSelect
                  label="Niveau"
                  value={String(formState.level)}
                  onChange={(value) => onFormChange('level', Number(value))}
                  options={LEVEL_OPTIONS}
                  placeholder="Selection"
                  error={formErrors.level}
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <FilterSelect
                  label="Duree"
                  value={String(formState.timeToRead)}
                  onChange={(value) => onFormChange('timeToRead', Number(value))}
                  options={TIME_OPTIONS.map((value) => ({
                    value,
                    label: `${value}s`,
                  }))}
                  placeholder="Selection"
                  error={formErrors.timeToRead}
                />
                <FilterSelect
                  label="Status"
                  value={formState.status}
                  onChange={(value) =>
                    onFormChange('status', value as QuestionStatus)
                  }
                  options={STATUS_OPTIONS}
                  placeholder="Selection"
                />
              </div>

              <label className="flex items-center gap-3 rounded-2xl border border-ink-100 bg-white/70 px-4 py-3 text-sm text-ink-700">
                <input
                  type="checkbox"
                  checked={formState.isPremium}
                  onChange={(event) =>
                    onFormChange('isPremium', event.target.checked)
                  }
                  className="h-4 w-4 rounded border-ink-300 text-ink-900"
                />
                Question premium
              </label>

              <div className="flex flex-wrap gap-3">
                <button
                  className="rounded-full bg-ink-900 px-5 py-2 text-sm font-semibold text-white shadow-glow transition hover:-translate-y-0.5"
                  onClick={submitForm}
                >
                  {formMode === 'create' ? 'Creer' : 'Mettre a jour'}
                </button>
                <button
                  className="rounded-full border border-ink-200 px-5 py-2 text-sm font-semibold text-ink-700 transition hover:-translate-y-0.5"
                  onClick={resetForm}
                >
                  Nettoyer
                </button>
              </div>

              {actionMessage ? (
                <div className="rounded-2xl border border-tide-200 bg-tide-50 px-4 py-3 text-sm text-tide-700">
                  {actionMessage}
                </div>
              ) : null}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: QuestionStatus }) {
  const styles: Record<QuestionStatus, string> = {
    ACTIVE: 'bg-tide-50 text-tide-700 border-tide-200',
    SUSPENDED: 'bg-ink-50 text-ink-700 border-ink-200',
    ARCHIVED: 'bg-copper-50 text-copper-700 border-copper-200',
  };
  const labels: Record<QuestionStatus, string> = {
    ACTIVE: 'Actif',
    SUSPENDED: 'Suspendu',
    ARCHIVED: 'Archive',
  };

  return (
    <span
      className={`status-pill inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}

function FilterSelect<T extends { id?: string; name?: string; label?: string }>(
  props: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: Array<T | { value: string | number; label: string }>;
    placeholder?: string;
    error?: string;
    renderOption?: (option: T) => string;
  },
) {
  return (
    <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.25em] text-ink-500">
      <span>{props.label}</span>
      <select
        value={props.value}
        onChange={(event) => props.onChange(event.target.value)}
        className="rounded-2xl border border-ink-100 bg-white/70 px-3 py-2 text-sm normal-case text-ink-800 shadow-sm focus:border-ink-300 focus:outline-none"
      >
        <option value="">{props.placeholder || 'Selection'}</option>
        {props.options.map((option) => {
          const value =
            'value' in option ? String(option.value) : String(option.id);
          const label =
            'label' in option
              ? option.label
              : props.renderOption
                ? props.renderOption(option as T)
                : String(option.name);
          return (
            <option key={value} value={value}>
              {label}
            </option>
          );
        })}
      </select>
      {props.error ? (
        <span className="text-xs normal-case text-copper-600">
          {props.error}
        </span>
      ) : null}
    </label>
  );
}

function TextInput({
  label,
  value,
  onChange,
  error,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  return (
    <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.25em] text-ink-500">
      <span>{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-2xl border border-ink-100 bg-white/70 px-3 py-2 text-sm normal-case text-ink-800 shadow-sm focus:border-ink-300 focus:outline-none"
      />
      {error ? (
        <span className="text-xs normal-case text-copper-600">{error}</span>
      ) : null}
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  error,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  return (
    <label className="flex flex-col gap-2 text-xs uppercase tracking-[0.25em] text-ink-500">
      <span>{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={3}
        className="rounded-2xl border border-ink-100 bg-white/70 px-3 py-2 text-sm normal-case text-ink-800 shadow-sm focus:border-ink-300 focus:outline-none"
      />
      {error ? (
        <span className="text-xs normal-case text-copper-600">{error}</span>
      ) : null}
    </label>
  );
}

function levelLabel(level: number) {
  const option = LEVEL_OPTIONS.find((item) => item.value === level);
  return option ? option.label : `Niveau ${level}`;
}

function levelToCode(level: number) {
  const mapping: Record<number, string> = { 1: 'F', 2: 'M', 3: 'D', 4: 'E' };
  return mapping[level] || 'F';
}

function toCode3(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .padEnd(3, 'X')
    .slice(0, 3);
}
