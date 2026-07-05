'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import MascotDisplay from '@/components/quiz/MascotDisplay';
import LoginRequired from '@/components/quiz/LoginRequired';
import { api, type JobSectorData, type LabelValue } from '@/lib/api';
import { createLogger } from '@/lib/logger';

const logger = createLogger({ prefix: 'Onboarding' });

const STEPS = [
  {
    key: 'ageRange',
    mascotVariant: 'welcome',
    mascotMessage: 'Pour te proposer les meilleures questions, j\'ai besoin de mieux te connaître ! 🎯',
    title: 'Quelle est ta tranche d\'âge ?',
    subtitle: 'Ça m\'aide à personnaliser ton expérience',
  },
  {
    key: 'professionalStatus',
    mascotVariant: 'coach',
    mascotMessage: 'Super ! Maintenant, dis-moi un peu plus sur ta situation pro 💼',
    title: 'Quel est ton statut professionnel ?',
    subtitle: 'Je pourrai adapter le niveau de difficulté à ton expérience',
  },
  {
    key: 'jobProfile',
    mascotVariant: 'pedagogue',
    mascotMessage: 'Dernière étape ! Ça me permet de cibler les thèmes qui te concernent le plus 🎯',
    title: 'Quel est ton profil métier ?',
    subtitle: 'Choisis le métier qui se rapproche le plus du tien',
  },
] as const;

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useUser();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [animating, setAnimating] = useState(false);

  // Form values
  const [ageRange, setAgeRange] = useState<string | null>(null);
  const [professionalStatus, setProfessionalStatus] = useState<string | null>(null);
  const [jobProfileId, setJobProfileId] = useState<string | null>(null);
  const [selectedSector, setSelectedSector] = useState<string | null>(null);

  // Reference data
  const [ageRanges, setAgeRanges] = useState<LabelValue[]>([]);
  const [statuses, setStatuses] = useState<LabelValue[]>([]);
  const [sectors, setSectors] = useState<JobSectorData[]>([]);
  const [loadingRef, setLoadingRef] = useState(true);
  const [refError, setRefError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) return; // handled below
  }, [authLoading, user, router]);

  // Load reference data once user is available
  useEffect(() => {
    if (!user) return;
    Promise.all([
      api.reference.ageRanges(),
      api.reference.professionalStatuses(),
      api.reference.jobProfiles(),
    ])
      .then(([ages, stats, jobs]) => {
        setAgeRanges(ages);
        setStatuses(stats);
        setSectors(jobs);
        setRefError(null);
      })
      .catch((err) => {
        logger.error('Erreur chargement données de référence', err);
        setRefError('Impossible de charger les données. Veuillez rafraîchir la page.');
      })
      .finally(() => setLoadingRef(false));
  }, [user]);

  const currentStep = STEPS[step];

  const canProceed =
    (step === 0 && ageRange !== null) ||
    (step === 1 && professionalStatus !== null) ||
    (step === 2 && jobProfileId !== null);

  async function handleNext() {
    if (step < 2) {
      setAnimating(true);
      setTimeout(() => {
        setStep(step + 1);
        setAnimating(false);
      }, 300);
    } else {
      // Save profile then démarrer avec le pack VISITEUR
      setSaving(true);
      try {
        await api.profile.update({
          ageRange: ageRange!,
          professionalStatus: professionalStatus!,
          jobProfileId: jobProfileId!,
        });

        // Chercher le pack VISITEUR pour démarrer le premier quiz
        try {
          const visiteurPacks = await api.packs.list({ type: 'VISITEUR', isFree: true });
          if (visiteurPacks.length > 0) {
            const pack = visiteurPacks[0];
            const session = await api.quiz.start({ categoryId: pack.categoryId });
            router.push(`/quiz/session/${session.sessionId}`);
            return;
          }
        } catch {
          // Pas de pack VISITEUR en base → flow normal
        }

        router.push('/quiz/selection');
      } catch (err: any) {
        setSaving(false);
        alert('Erreur lors de la sauvegarde : ' + (err.message || 'Réessaie'));
      }
    }
  }

  if (authLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <MascotDisplay variant="welcome" size={160} className="mx-auto mb-6" />
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </main>
    );
  }

  if (!user) {
    return <LoginRequired returnTo="/quiz/onboarding" />;
  }

  if (loadingRef) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <MascotDisplay variant="welcome" size={160} className="mx-auto mb-6" />
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </main>
    );
  }

  if (refError) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <MascotDisplay variant="sad" size={150} className="mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-navy mb-2">Oops !</h2>
          <p className="text-charcoal/70 mb-6">{refError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-gradient-primary text-white font-bold rounded-xl hover:-translate-y-0.5 transition-all"
          >
            Rafraîchir
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      {/* Progress dots */}
      <div className="flex gap-3 mb-8">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={`h-2 rounded-full transition-all duration-500 ${
              i === step ? 'w-10 bg-primary' : i < step ? 'w-6 bg-primary/50' : 'w-6 bg-navy/15'
            }`}
          />
        ))}
      </div>

      {/* Mascot + speech bubble */}
      <div className={`transition-all duration-300 ${animating ? 'opacity-0 -translate-y-4' : 'opacity-100 translate-y-0'}`}>
        <div className="relative mx-auto mb-2" style={{ width: 180 }}>
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 bg-white px-5 py-3 rounded-[20px] border-[3px] border-primary min-w-[280px] max-w-[340px] z-10 shadow-lg">
            <p className="text-sm font-bold text-navy text-center leading-relaxed">
              {currentStep.mascotMessage}
            </p>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-r-[3px] border-b-[3px] border-primary rotate-45" />
          </div>
          <MascotDisplay variant={currentStep.mascotVariant} size={180} className="mx-auto" />
        </div>
      </div>

      {/* Title */}
      <div className={`text-center mb-8 transition-all duration-300 ${animating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
        <h1 className="text-2xl md:text-3xl font-extrabold text-navy mb-2">
          {currentStep.title}
        </h1>
        <p className="text-charcoal/60 font-semibold">{currentStep.subtitle}</p>
      </div>

      {/* Step content */}
      <div className={`w-full max-w-lg transition-all duration-300 ${animating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
        {/* Step 0: Age Range */}
        {step === 0 && (
          <div className="grid grid-cols-1 gap-3">
            {ageRanges.map((item) => (
              <button
                key={item.value}
                onClick={() => setAgeRange(item.value)}
                className={`
                  w-full text-left px-6 py-4 rounded-2xl border-[3px] font-bold text-lg transition-all duration-200
                  ${ageRange === item.value
                    ? 'border-primary bg-primary/10 text-primary -translate-y-0.5 shadow-md'
                    : 'border-navy/15 text-navy hover:border-primary/50 hover:bg-primary/5'
                  }
                `}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}

        {/* Step 1: Professional Status */}
        {step === 1 && (
          <div className="grid grid-cols-1 gap-3">
            {statuses.map((item) => (
              <button
                key={item.value}
                onClick={() => setProfessionalStatus(item.value)}
                className={`
                  w-full text-left px-6 py-4 rounded-2xl border-[3px] font-bold text-lg transition-all duration-200
                  ${professionalStatus === item.value
                    ? 'border-primary bg-primary/10 text-primary -translate-y-0.5 shadow-md'
                    : 'border-navy/15 text-navy hover:border-primary/50 hover:bg-primary/5'
                  }
                `}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}

        {/* Step 2: Job Profile (sector → job) */}
        {step === 2 && (
          <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
            {sectors.map((sector) => (
              <div key={sector.id}>
                <button
                  onClick={() => setSelectedSector(selectedSector === sector.id ? null : sector.id)}
                  className={`
                    w-full text-left px-5 py-3 rounded-xl font-extrabold text-base transition-all duration-200
                    ${selectedSector === sector.id
                      ? 'bg-primary/10 text-primary'
                      : 'bg-navy/5 text-navy hover:bg-primary/5'
                    }
                  `}
                >
                  <span className="flex items-center justify-between">
                    {sector.name}
                    <svg
                      className={`w-5 h-5 transition-transform duration-200 ${selectedSector === sector.id ? 'rotate-180' : ''}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </button>
                {selectedSector === sector.id && (
                  <div className="mt-2 ml-3 space-y-2 animate-fade-in-up">
                    {sector.jobProfiles?.map((job) => (
                      <button
                        key={job.id}
                        onClick={() => setJobProfileId(job.id)}
                        className={`
                          w-full text-left px-5 py-3 rounded-xl border-[2.5px] font-semibold transition-all duration-200
                          ${jobProfileId === job.id
                            ? 'border-primary bg-primary/10 text-primary shadow-sm'
                            : 'border-navy/10 text-charcoal hover:border-primary/40'
                          }
                        `}
                      >
                        {job.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      <div className="flex gap-4 mt-8">
        {step > 0 && (
          <button
            onClick={() => { setAnimating(true); setTimeout(() => { setStep(step - 1); setAnimating(false); }, 300); }}
            className="px-6 py-3 border-2 border-navy/20 text-navy font-bold rounded-xl hover:bg-navy/5 transition-all"
          >
            ← Retour
          </button>
        )}
        <button
          onClick={handleNext}
          disabled={!canProceed || saving}
          className="px-10 py-3 bg-gradient-primary text-white font-extrabold rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-primary-lg disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0"
        >
          {saving ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Enregistrement...
            </span>
          ) : step === 2 ? (
            'C\'est parti ! 🚀'
          ) : (
            'Continuer →'
          )}
        </button>
      </div>
    </main>
  );
}
