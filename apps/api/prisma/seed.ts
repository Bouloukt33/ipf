import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import { readFileSync, existsSync } from 'fs';
import { join, resolve } from 'path';
import 'dotenv/config';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ── Path to content data ──
const CONTENT_DIR =
  process.env.CONTENT_DIR ??
  resolve(__dirname, '../../../contenu_5_secondes_chrono');
const CSV_DIR = join(CONTENT_DIR, 'base de donnee csv');


if (!existsSync(CSV_DIR)) {
  console.error(`❌ Dossier CSV introuvable: ${CSV_DIR}`);
  //process.exit(1);
}

// ── Category definitions ──
const CATEGORIES = [
  {
    name: 'Bail commercial',
    slug: 'bail-commercial',
    description:
      'Questions sur le bail commercial : durée, loyer, renouvellement, résiliation.',
    color: '#D27A2D',
    order: 1,
    isPremium: false,
    csvFile: '1 QCM 214 Bail commercial.csv',
  },
  {
    name: 'Bail professionnel',
    slug: 'bail-professionnel',
    description:
      'Questions sur le bail professionnel : professions libérales, durée, fiscalité.',
    color: '#1CB0F6',
    order: 2,
    isPremium: true,
    csvFile: '2 QCM 151 Bail professionnel (1).csv',
  },
  {
    name: 'Bail de courte durée',
    slug: 'bail-courte-duree',
    description:
      'Questions sur le bail de courte durée : conditions, renouvellement, limites.',
    color: '#58CC02',
    order: 3,
    isPremium: true,
    csvFile: '3 QCM  151 Bail de court-durée.csv',
  },
  {
    name: 'Bail dérogatoire',
    slug: 'bail-derogatoire',
    description:
      'Questions sur le bail dérogatoire : durée max, requalification, fin de bail.',
    color: '#CE82FF',
    order: 4,
    isPremium: true,
    csvFile: '4 QCM 151 Bail derogatoire.csv',
  },
  {
    name: 'Bail précaire',
    slug: 'bail-precaire',
    description:
      'Questions sur le bail précaire : conditions, droits du locataire, résiliation.',
    color: '#FF4B4B',
    order: 5,
    isPremium: true,
    csvFile: '5 QCM 151 Bail precaire (1).csv',
  },
  {
    name: 'Bail sous-location',
    slug: 'bail-sous-location',
    description:
      'Questions sur la sous-location : autorisation, obligations, risques.',
    color: '#FFC800',
    order: 6,
    isPremium: true,
    csvFile: '6 QCM 150 Bail sous location.csv',
  },
];

// ── Theme definitions (per category) ──
const THEMES: Record<
  string,
  { name: string; slug: string; description?: string; order: number }[]
> = {
  'bail-commercial': [
    {
      name: 'Durée et renouvellement',
      slug: 'duree-renouvellement',
      description: 'Durée légale, tacite reconduction et renouvellement.',
      order: 1,
    },
    {
      name: 'Loyer et révision',
      slug: 'loyer-revision',
      description: 'Fixation du loyer, indices et révision triennale.',
      order: 2,
    },
    {
      name: 'Résiliation et congé',
      slug: 'resiliation-conge',
      description: 'Conditions de résiliation et procédures de congé.',
      order: 3,
    },
  ],
  'bail-professionnel': [
    {
      name: "Conditions d'accès",
      slug: 'conditions-acces',
      description: 'Qui peut conclure un bail professionnel.',
      order: 1,
    },
    {
      name: 'Fiscalité',
      slug: 'fiscalite',
      description: 'TVA, charges et régime fiscal.',
      order: 2,
    },
  ],
  'bail-courte-duree': [
    {
      name: 'Conditions et limites',
      slug: 'conditions-limites',
      description: 'Durée maximale et conditions de validité.',
      order: 1,
    },
  ],
  'bail-derogatoire': [
    {
      name: 'Requalification',
      slug: 'requalification',
      description: 'Risques de requalification en bail commercial.',
      order: 1,
    },
  ],
  'bail-precaire': [
    {
      name: 'Droits du locataire',
      slug: 'droits-locataire',
      description: 'Protections et limites pour le locataire précaire.',
      order: 1,
    },
  ],
  'bail-sous-location': [
    {
      name: 'Autorisation et obligations',
      slug: 'autorisation-obligations',
      description: "Conditions d'autorisation et obligations des parties.",
      order: 1,
    },
  ],
};

// ── Badge definitions ──
const BADGES = [
  {
    name: 'Première Session',
    slug: 'first-session',
    description: 'Complétez votre première session de quiz',
    conditionType: 'FIRST_SESSION',
    conditionValue: 1,
    xpReward: 50,
    order: 1,
  },
  {
    name: 'Flamme de 7 jours',
    slug: 'streak-7',
    description: 'Maintenez une série de 7 jours consécutifs',
    conditionType: 'STREAK_DAYS',
    conditionValue: 7,
    xpReward: 100,
    order: 2,
  },
  {
    name: 'Flamme de 30 jours',
    slug: 'streak-30',
    description: 'Maintenez une série de 30 jours consécutifs',
    conditionType: 'STREAK_DAYS',
    conditionValue: 30,
    xpReward: 300,
    order: 3,
  },
  {
    name: 'Sans faute',
    slug: 'perfect-session',
    description: 'Obtenez 10/10 dans une session',
    conditionType: 'PERFECT_SESSION',
    conditionValue: 1,
    xpReward: 150,
    order: 4,
  },
  {
    name: 'Série de 5',
    slug: 'correct-streak-5',
    description: '5 bonnes réponses consécutives',
    conditionType: 'CORRECT_STREAK',
    conditionValue: 5,
    xpReward: 75,
    order: 5,
  },
  {
    name: 'Éclair',
    slug: 'fast-answer',
    description: 'Répondez correctement en moins de 2 secondes',
    conditionType: 'FAST_ANSWER',
    conditionValue: 2000,
    xpReward: 50,
    order: 6,
  },
  {
    name: 'Maître du bail',
    slug: 'category-mastery',
    description: 'Atteignez 90% de maîtrise dans une catégorie',
    conditionType: 'CATEGORY_MASTERY',
    conditionValue: 90,
    xpReward: 200,
    order: 7,
  },
  {
    name: 'Centurion',
    slug: 'total-questions-100',
    description: 'Répondez à 100 questions',
    conditionType: 'TOTAL_QUESTIONS',
    conditionValue: 100,
    xpReward: 100,
    order: 8,
  },
  {
    name: 'Millionnaire XP',
    slug: 'total-xp-1000',
    description: 'Accumulez 1000 XP',
    conditionType: 'TOTAL_XP',
    conditionValue: 1000,
    xpReward: 150,
    order: 9,
  },
  {
    name: 'Champion hebdo',
    slug: 'weekly-champion',
    description: 'Terminez premier du classement hebdomadaire',
    conditionType: 'WEEKLY_CHAMPION',
    conditionValue: 1,
    xpReward: 250,
    order: 10,
    isSecret: true,
  },
];

// ── Real user (ton compte Google Auth0) ──
// Toutes les données utilisateur sont rattachées à ce seul compte.
const REAL_USER_AUTH0_ID = 'google-oauth2|114633448715825913167';

const DEV_USERS = [
  {
    auth0Id: REAL_USER_AUTH0_ID,
    email: 'admin@dev.local',
    role: 'ADMIN' as const,
    displayName: 'Admin Dev',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AdminDev&backgroundColor=b6e3f4',
    xpTotal: 2400,
    level: 8,
    streakDays: 14,
    bestStreak: 21,
    eloScore: 1450,
  },
];

// ── CSV Parsing ──
function parseCsv(
  filePath: string,
  _categorySlug: string,
): Array<{
  text: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  level?: number;
  theme?: string;
}> {
  let raw = readFileSync(filePath, 'utf-8');
  if (raw.charCodeAt(0) === 0xfeff) raw = raw.slice(1);

  const lines = raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) return [];

  const header = lines[0].toLowerCase();
  const isEnrichedFormat =
    header.includes('id;categorie') ||
    (header.includes('id;') && header.includes('niveau'));

  const dataLines = lines.slice(1);
  const questions: Array<{
    text: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctAnswer: string;
    level?: number;
    theme?: string;
  }> = [];

  const cleanOption = (opt: string) => opt.trim().replace(/^[A-D]\)\s*/, '');

  const splitCsvLine = (line: string, delimiter = ';'): string[] => {
    const fields: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (inQuotes) {
        if (ch === '"') {
          if (i + 1 < line.length && line[i + 1] === '"') {
            current += '"';
            i++;
          } else {
            inQuotes = false;
          }
        } else {
          current += ch;
        }
      } else {
        if (ch === '"') {
          inQuotes = true;
        } else if (ch === delimiter) {
          fields.push(current);
          current = '';
        } else {
          current += ch;
        }
      }
    }
    fields.push(current);
    return fields;
  };

  for (const line of dataLines) {
    const parts = splitCsvLine(line);
    let text: string,
      optA: string,
      optB: string,
      optC: string,
      optD: string,
      answer: string;
    let level: number | undefined;
    let theme: string | undefined;

    if (isEnrichedFormat) {
      if (parts.length < 9) continue;
      theme = parts[1]?.trim() || undefined;
      level = parseInt(parts[2]) || undefined;
      text = parts[3].trim();
      optA = cleanOption(parts[4]);
      optB = cleanOption(parts[5]);
      optC = cleanOption(parts[6]);
      optD = cleanOption(parts[7]);
      answer = parts[8].trim().toUpperCase();
    } else {
      if (parts.length < 6) continue;
      text = parts[0].trim();
      optA = cleanOption(parts[1]);
      optB = cleanOption(parts[2]);
      optC = cleanOption(parts[3]);
      optD = cleanOption(parts[4]);
      answer = parts[5].trim().toUpperCase();
    }

    if (!text || !['A', 'B', 'C', 'D'].includes(answer)) continue;

    questions.push({
      text,
      optionA: optA,
      optionB: optB,
      optionC: optC,
      optionD: optD,
      correctAnswer: answer,
      level,
      theme,
    });
  }

  return questions;
}

// ── Helpers ──
function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ── Main Seed ──
async function main() {
  console.log('🌱 Starting seed...\n');

  // ─────────────────────────────────────────────
  // 1. Categories
  // ─────────────────────────────────────────────
  console.log('📁 Seeding categories...');
  const categoryMap = new Map<string, string>(); // slug → id

  for (const cat of CATEGORIES) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        description: cat.description,
        color: cat.color,
        order: cat.order,
        isPremium: cat.isPremium,
      },
      create: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        color: cat.color,
        order: cat.order,
        isPremium: cat.isPremium,
      },
    });
    categoryMap.set(cat.slug, created.id);
    console.log(
      `  ✅ ${cat.name} (${cat.isPremium ? '🔒 Premium' : '🆓 Gratuit'})`,
    );
  }

  // ─────────────────────────────────────────────
  // 2. Themes
  // ─────────────────────────────────────────────
  console.log('\n🏷  Seeding themes...');
  const themeMap = new Map<string, string>(); // `${catSlug}/${themeSlug}` → themeId

  for (const [catSlug, themes] of Object.entries(THEMES)) {
    const categoryId = categoryMap.get(catSlug);
    if (!categoryId) continue;

    for (const t of themes) {
      const created = await prisma.theme.upsert({
        where: { categoryId_slug: { categoryId, slug: t.slug } },
        update: { name: t.name, description: t.description, order: t.order },
        create: {
          categoryId,
          name: t.name,
          slug: t.slug,
          description: t.description,
          order: t.order,
        },
      });
      themeMap.set(`${catSlug}/${t.slug}`, created.id);
      console.log(`  ✅ [${catSlug}] ${t.name}`);
    }
  }

  // ─────────────────────────────────────────────
  // 3. Questions from CSV
  // ─────────────────────────────────────────────
  console.log('\n📝 Seeding questions from CSV...');
  const questionIdsByCat = new Map<string, string[]>();
  let totalSeeded = 0;

  for (const cat of CATEGORIES) {
    const csvPath = join(CSV_DIR, cat.csvFile);
    if (!existsSync(csvPath)) {
      console.warn(`  ⚠ CSV not found: ${cat.csvFile}`);
      continue;
    }

    const categoryId = categoryMap.get(cat.slug)!;
    const questions = parseCsv(csvPath, cat.slug);
    console.log(`  📂 ${cat.name}: ${questions.length} questions found`);

    const ids: string[] = [];
    let seeded = 0;

    for (const q of questions) {
      const existing = await prisma.question.findFirst({
        where: { text: q.text, categoryId },
        select: { id: true },
      });

      if (existing) {
        ids.push(existing.id);
        continue;
      }

      const created = await prisma.question.create({
        data: {
          categoryId,
          text: q.text,
          optionA: q.optionA,
          optionB: q.optionB,
          optionC: q.optionC,
          optionD: q.optionD,
          correctAnswer: q.correctAnswer,
          level: q.level ?? 1,
          isPremium: cat.isPremium,
          isActive: true,
          sourceFile: cat.csvFile,
        },
      });
      ids.push(created.id);
      seeded++;
    }

    questionIdsByCat.set(cat.slug, ids);
    console.log(`  ✅ ${seeded} new questions seeded for ${cat.name}`);
    totalSeeded += seeded;
  }

  console.log(`\n📊 Total questions seeded: ${totalSeeded}`);

  // ─────────────────────────────────────────────
  // 4. QuestionStats
  // ─────────────────────────────────────────────
  console.log('\n📈 Seeding question stats...');
  let statsSeeded = 0;

  for (const ids of questionIdsByCat.values()) {
    for (const questionId of ids.slice(0, 30)) {
      const existing = await prisma.questionStats.findUnique({
        where: { questionId },
      });
      if (existing) continue;

      const totalAttempts = randomInt(20, 200);
      const correctAttempts = Math.floor(
        totalAttempts * (Math.random() * 0.5 + 0.4),
      );

      await prisma.questionStats.create({
        data: {
          questionId,
          totalAttempts,
          correctAttempts,
          avgResponseTimeMs: randomInt(1800, 8000),
          difficultyComputed: parseFloat(
            (1 - correctAttempts / totalAttempts).toFixed(2),
          ),
        },
      });
      statsSeeded++;
    }
  }
  console.log(`  ✅ ${statsSeeded} question stats created`);

  // ─────────────────────────────────────────────
  // 5. Badges
  // ─────────────────────────────────────────────
  console.log('\n🏅 Seeding badges...');
  const badgeMap = new Map<string, string>(); // slug → id

  for (const badge of BADGES) {
    const created = await prisma.badge.upsert({
      where: { slug: badge.slug },
      update: {
        name: badge.name,
        description: badge.description,
        conditionType: badge.conditionType as any,
        conditionValue: badge.conditionValue,
        xpReward: badge.xpReward,
        order: badge.order,
        isSecret: badge.isSecret ?? false,
      },
      create: {
        name: badge.name,
        slug: badge.slug,
        description: badge.description,
        conditionType: badge.conditionType as any,
        conditionValue: badge.conditionValue,
        xpReward: badge.xpReward,
        order: badge.order,
        isSecret: badge.isSecret ?? false,
      },
    });
    badgeMap.set(badge.slug, created.id);
    console.log(`  ✅ ${badge.name} ${badge.isSecret ? '(🔒 secret)' : ''}`);
  }

  // ─────────────────────────────────────────────
  // 6. Subscription Plans
  // ─────────────────────────────────────────────
  console.log('\n💳 Seeding subscription plans...');
  const plans = [
    {
      name: 'Apprenti',
      slug: 'apprenti',
      description: 'Accès gratuit — Bail commercial uniquement',
      price: 0,
      features: JSON.stringify([
        'Bail commercial',
        '10 questions/session',
        'Mode Practice',
      ]),
      order: 1,
    },
    {
      name: 'Compagnon',
      slug: 'compagnon',
      description: 'Accès à toutes les catégories + Daily quiz',
      price: 9.99,
      features: JSON.stringify([
        'Toutes les catégories',
        'Mode Daily',
        'Vidéos explicatives',
        'Coaching personnalisé',
      ]),
      order: 2,
    },
    {
      name: 'Réussite',
      slug: 'reussite',
      description: 'Accès complet + IA coaching + support prioritaire',
      price: 19.99,
      features: JSON.stringify([
        'Tout Compagnon',
        'IA Coaching avancé',
        'Support prioritaire',
        'Stats avancées',
      ]),
      order: 3,
    },
  ];

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { slug: plan.slug },
      update: {
        name: plan.name,
        description: plan.description,
        price: plan.price,
        features: plan.features,
        order: plan.order,
      },
      create: {
        name: plan.name,
        slug: plan.slug,
        description: plan.description,
        price: plan.price,
        features: plan.features,
        order: plan.order,
      },
    });
    console.log(
      `  ✅ Plan "${plan.name}" — ${plan.price === 0 ? 'Gratuit' : plan.price + '€/mois'}`,
    );
  }

  // ─────────────────────────────────────────────
  // 7. Job Sectors & Profiles
  // ─────────────────────────────────────────────
  console.log('\n👔 Seeding job sectors & profiles...');
  const JOB_DATA: {
    sector: string;
    sectorSlug: string;
    order: number;
    profiles: { name: string; slug: string }[];
  }[] = [
    {
      sector: 'Immobilier — Transaction',
      sectorSlug: 'immobilier-transaction',
      order: 1,
      profiles: [
        {
          name: 'Agent immobilier transaction professionnel/commercial',
          slug: 'agent-immo-transaction-pro',
        },
        {
          name: 'Agent immobilier transaction habitation',
          slug: 'agent-immo-transaction-habitation',
        },
        {
          name: 'Assistant(e) commercial(e) agence immobilière',
          slug: 'assistant-commercial-agence',
        },
      ],
    },
    {
      sector: 'Immobilier — Gestion locative',
      sectorSlug: 'immobilier-gestion-locative',
      order: 2,
      profiles: [
        {
          name: 'Gestionnaire locatif professionnel/commercial',
          slug: 'gestionnaire-locatif-pro',
        },
        {
          name: 'Gestionnaire locatif habitation',
          slug: 'gestionnaire-locatif-habitation',
        },
      ],
    },
    {
      sector: 'Immobilier — Expertise et conseil',
      sectorSlug: 'immobilier-expertise-conseil',
      order: 3,
      profiles: [
        { name: 'Expert immobilier', slug: 'expert-immobilier' },
        {
          name: "Consultant en immobilier d'entreprise",
          slug: 'consultant-immo-entreprise',
        },
      ],
    },
    {
      sector: 'Finance et patrimoine',
      sectorSlug: 'finance-patrimoine',
      order: 4,
      profiles: [
        {
          name: 'Conseiller en gestion de patrimoine (CGP)',
          slug: 'cgp',
        },
        {
          name: 'Conseiller bancaire professionnels',
          slug: 'conseiller-bancaire-pro',
        },
      ],
    },
    {
      sector: 'Comptabilité et gestion',
      sectorSlug: 'comptabilite-gestion',
      order: 5,
      profiles: [
        { name: 'Expert-comptable', slug: 'expert-comptable' },
        {
          name: 'Collaborateur cabinet comptable',
          slug: 'collaborateur-cabinet-comptable',
        },
        { name: 'Contrôleur de gestion', slug: 'controleur-gestion' },
      ],
    },
    {
      sector: 'Commerce et entrepreneuriat',
      sectorSlug: 'commerce-entrepreneuriat',
      order: 6,
      profiles: [
        { name: 'Commerçant indépendant', slug: 'commercant-independant' },
        { name: 'Franchisé', slug: 'franchise' },
        {
          name: "Créateur/repreneur d'entreprise",
          slug: 'createur-repreneur-entreprise',
        },
        {
          name: 'Artisan avec local commercial',
          slug: 'artisan-local-commercial',
        },
      ],
    },
    {
      sector: 'Collectivités et aménagement',
      sectorSlug: 'collectivites-amenagement',
      order: 7,
      profiles: [
        {
          name: 'Chargé de développement économique territorial',
          slug: 'charge-dev-eco-territorial',
        },
        {
          name: 'Gestionnaire foncier collectivité',
          slug: 'gestionnaire-foncier-collectivite',
        },
      ],
    },
  ];

  let totalProfiles = 0;
  for (const s of JOB_DATA) {
    const sector = await prisma.jobSector.upsert({
      where: { slug: s.sectorSlug },
      update: { name: s.sector, order: s.order },
      create: { name: s.sector, slug: s.sectorSlug, order: s.order },
    });

    for (let i = 0; i < s.profiles.length; i++) {
      const p = s.profiles[i];
      await prisma.jobProfile.upsert({
        where: { slug: p.slug },
        update: { name: p.name, order: i + 1 },
        create: {
          sectorId: sector.id,
          name: p.name,
          slug: p.slug,
          order: i + 1,
        },
      });
      totalProfiles++;
    }
    console.log(`  ✅ ${s.sector}: ${s.profiles.length} profils`);
  }
  console.log(
    `  📊 Total: ${JOB_DATA.length} secteurs, ${totalProfiles} profils métiers`,
  );

  // ─────────────────────────────────────────────
  // 8. User + Profile + Ranking + Subscription
  // ─────────────────────────────────────────────
  console.log('\n👤 Seeding dev users...');
  const userMap = new Map<string, string>(); // auth0Id → userId
  const planIds = await prisma.plan.findMany({
    select: { id: true, slug: true },
  });
  const compagnonPlanId = planIds.find((p) => p.slug === 'compagnon')?.id;

  for (const u of DEV_USERS) {
    const user = await prisma.user.upsert({
      where: { auth0Id: u.auth0Id },
      update: { email: u.email, role: u.role },
      create: { auth0Id: u.auth0Id, email: u.email, role: u.role },
    });
    userMap.set(u.auth0Id, user.id);

    // UserProfile
    await prisma.userProfile.upsert({
        where: { userId: user.id },
        update: {
            displayName: u.displayName,
            avatarUrl: u.avatarUrl,        
            xpTotal: u.xpTotal,
            level: u.level,
            streakDays: u.streakDays,
            bestStreak: u.bestStreak,
            lastPlayedAt: daysAgo(1),
        },
        create: {
            userId: user.id,
            displayName: u.displayName,
            avatarUrl: u.avatarUrl,        
            xpTotal: u.xpTotal,
            level: u.level,
            streakDays: u.streakDays,
            bestStreak: u.bestStreak,
            lastPlayedAt: daysAgo(1),
        },
    });

    // UserRanking
    await prisma.userRanking.upsert({
      where: { userId: user.id },
      update: { eloScore: u.eloScore, totalGames: 20, totalWins: 12 },
      create: {
        userId: user.id,
        eloScore: u.eloScore,
        totalGames: 20,
        totalWins: 12,
      },
    });

    // Subscription — plan Compagnon
    if (compagnonPlanId) {
      const existing = await prisma.subscription.findUnique({
        where: { userId: user.id },
      });
      if (!existing) {
        await prisma.subscription.create({
          data: {
            userId: user.id,
            planId: compagnonPlanId,
            status: 'ACTIVE',
            currentPeriodStart: daysAgo(15),
            currentPeriodEnd: new Date(
              Date.now() + 15 * 24 * 60 * 60 * 1000,
            ),
          },
        });
      }
    }

    console.log(`  ✅ ${u.displayName} (${u.email}) — ${u.auth0Id}`);
  }

  // ─────────────────────────────────────────────
  // 9. QuizSessions + QuizAnswers
  // ─────────────────────────────────────────────
  console.log('\n🎮 Seeding quiz sessions...');
  const catSlugs = ['bail-commercial', 'bail-professionnel'];

  for (const [auth0Id, userId] of userMap.entries()) {
    for (const catSlug of catSlugs) {
      const categoryId = categoryMap.get(catSlug);
      const questionIds = questionIdsByCat.get(catSlug) ?? [];
      if (!categoryId || questionIds.length < 5) continue;

      for (let i = 0; i < 3; i++) {
        const sessionQuestions = questionIds.slice(i * 5, i * 5 + 5);
        const completedAt = daysAgo(randomInt(1, 28));
        const correctAnswers = randomInt(2, 5);

        const session = await prisma.quizSession.create({
          data: {
            userId,
            categoryId,
            mode: 'PRACTICE',
            totalQuestions: sessionQuestions.length,
            correctAnswers,
            score: correctAnswers * 10,
            xpEarned: correctAnswers * 15,
            durationMs: randomInt(60_000, 300_000),
            livesRemaining: 5 - (sessionQuestions.length - correctAnswers),
            status: 'COMPLETED',
            startedAt: new Date(
              completedAt.getTime() - randomInt(60_000, 300_000),
            ),
            completedAt,
            questionOrder: sessionQuestions,
          },
        });

        for (let qi = 0; qi < sessionQuestions.length; qi++) {
          const questionId = sessionQuestions[qi];
          const question = await prisma.question.findUnique({
            where: { id: questionId },
            select: { correctAnswer: true },
          });
          if (!question) continue;

          const isCorrect = qi < correctAnswers;
          const options = ['A', 'B', 'C', 'D'];
          const wrongOptions = options.filter(
            (o) => o !== question.correctAnswer,
          );
          const userAnswer = isCorrect
            ? question.correctAnswer
            : wrongOptions[randomInt(0, wrongOptions.length - 1)];

          await prisma.quizAnswer.create({
            data: {
              sessionId: session.id,
              questionId,
              userAnswer,
              isCorrect,
              responseTimeMs: randomInt(1500, 9000),
              xpEarned: isCorrect ? 15 : 0,
              answeredAt: new Date(
                session.startedAt.getTime() + qi * randomInt(15_000, 60_000),
              ),
            },
          });
        }
      }
    }
    console.log(`  ✅ Sessions created for user ${auth0Id}`);
  }

  // ─────────────────────────────────────────────
  // 10. UserMastery
  // ─────────────────────────────────────────────
  console.log('\n🧠 Seeding user mastery...');

  const masteryData = [
    {
      auth0Id: REAL_USER_AUTH0_ID,
      catSlug: 'bail-commercial',
      themeSlug: 'duree-renouvellement',
      masteryLevel: 0.88,
      questionsSeen: 80,
      correctCount: 70,
    },
    {
      auth0Id: REAL_USER_AUTH0_ID,
      catSlug: 'bail-commercial',
      themeSlug: 'loyer-revision',
      masteryLevel: 0.72,
      questionsSeen: 50,
      correctCount: 36,
    },
    {
      auth0Id: REAL_USER_AUTH0_ID,
      catSlug: 'bail-commercial',
      themeSlug: 'resiliation-conge',
      masteryLevel: 0.50,
      questionsSeen: 20,
      correctCount: 10,
    },
    {
      auth0Id: REAL_USER_AUTH0_ID,
      catSlug: 'bail-professionnel',
      themeSlug: 'conditions-acces',
      masteryLevel: 0.60,
      questionsSeen: 30,
      correctCount: 18,
    },
    {
      auth0Id: REAL_USER_AUTH0_ID,
      catSlug: 'bail-professionnel',
      themeSlug: 'fiscalite',
      masteryLevel: 0.35,
      questionsSeen: 20,
      correctCount: 7,
    },
  ];

  for (const m of masteryData) {
    const userId = userMap.get(m.auth0Id);
    const categoryId = categoryMap.get(m.catSlug);
    const themeId = themeMap.get(`${m.catSlug}/${m.themeSlug}`);
    if (!userId || !categoryId) continue;

    await prisma.userMastery.upsert({
      where: {
        userId_categoryId_themeId: {
          userId,
          categoryId,
          themeId: themeId ?? '1',
        },
      },
      update: {
        masteryLevel: m.masteryLevel,
        questionsSeen: m.questionsSeen,
        correctCount: m.correctCount,
        lastPracticedAt: daysAgo(randomInt(1, 7)),
      },
      create: {
        userId,
        categoryId,
        themeId: themeId ?? '1',
        masteryLevel: m.masteryLevel,
        questionsSeen: m.questionsSeen,
        correctCount: m.correctCount,
        lastPracticedAt: daysAgo(randomInt(1, 7)),
      },
    });
  }
  console.log(`  ✅ ${masteryData.length} mastery records seeded`);

  // ─────────────────────────────────────────────
  // 11. UserBadges
  // ─────────────────────────────────────────────
  console.log('\n🎖  Seeding user badges...');

  const userBadgeAssignments = [
    {
      auth0Id: REAL_USER_AUTH0_ID,
      badgeSlugs: [
        'first-session',
        'streak-7',
        'perfect-session',
        'correct-streak-5',
        'category-mastery',
        'fast-answer',
      ],
    },
  ];

  for (const { auth0Id, badgeSlugs } of userBadgeAssignments) {
    const userId = userMap.get(auth0Id);
    if (!userId) continue;

    for (const slug of badgeSlugs) {
      const badgeId = badgeMap.get(slug);
      if (!badgeId) continue;

      await prisma.userBadge.upsert({
        where: { userId_badgeId: { userId, badgeId } },
        update: {},
        create: {
          userId,
          badgeId,
          unlockedAt: daysAgo(randomInt(1, 20)),
        },
      });
    }
    console.log(`  ✅ Badges assigned to ${auth0Id}`);
  }

  // ─────────────────────────────────────────────
  // 12. Leaderboards + Entries
  // ─────────────────────────────────────────────
  console.log('\n🏆 Seeding leaderboards...');
  const now = new Date();

  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const leaderboardDefs = [
    {
      type: 'GLOBAL' as const,
      categoryId: null,
      periodStart: null,
      periodEnd: null,
    },
    {
      type: 'WEEKLY' as const,
      categoryId: null,
      periodStart: startOfWeek,
      periodEnd: endOfWeek,
    },
    {
      type: 'MONTHLY' as const,
      categoryId: null,
      periodStart: startOfMonth,
      periodEnd: endOfMonth,
    },
    {
      type: 'CATEGORY' as const,
      categoryId: categoryMap.get('bail-commercial')!,
      periodStart: null,
      periodEnd: null,
    },
  ];

  const userScores: Record<string, number> = {
    [REAL_USER_AUTH0_ID]: 2400,
  };

  for (const lb of leaderboardDefs) {
    const existing = await prisma.leaderboard.findFirst({
      where: { type: lb.type, categoryId: lb.categoryId ?? null },
    });

    const leaderboard =
      existing ??
      (await prisma.leaderboard.create({
        data: {
          type: lb.type,
          categoryId: lb.categoryId ?? null,
          periodStart: lb.periodStart,
          periodEnd: lb.periodEnd,
          isActive: true,
        },
      }));

    const ranked = Object.entries(userScores).sort((a, b) => b[1] - a[1]);
    let rank = 1;

    for (const [auth0Id, score] of ranked) {
      const userId = userMap.get(auth0Id);
      if (!userId) continue;

      await prisma.leaderboardEntry.upsert({
        where: {
          leaderboardId_userId: { leaderboardId: leaderboard.id, userId },
        },
        update: { score, rank },
        create: { leaderboardId: leaderboard.id, userId, score, rank },
      });
      rank++;
    }

    console.log(
      `  ✅ Leaderboard [${lb.type}] with ${ranked.length} entries`,
    );
  }

  // ─────────────────────────────────────────────
  // 13. AiRecommendations
  // ─────────────────────────────────────────────
  console.log('\n🤖 Seeding AI recommendations...');

  const recommendations = [
    {
      auth0Id: REAL_USER_AUTH0_ID,
      type: 'REVIEW' as const,
      catSlug: 'bail-commercial',
      themeSlug: 'loyer-revision',
      message:
        'Votre taux de réussite sur la révision du loyer est en baisse. Révisez ce thème.',
      priority: 2,
    },
    {
      auth0Id: REAL_USER_AUTH0_ID,
      type: 'WEAK_AREA' as const,
      catSlug: 'bail-professionnel',
      themeSlug: 'fiscalite',
      message:
        'La fiscalité du bail professionnel est votre point faible. Entraînez-vous davantage.',
      priority: 3,
    },
    {
      auth0Id: REAL_USER_AUTH0_ID,
      type: 'STREAK_RISK' as const,
      catSlug: null,
      themeSlug: null,
      message:
        "Votre série est en danger ! Connectez-vous aujourd'hui pour la maintenir.",
      priority: 1,
    },
    {
      auth0Id: REAL_USER_AUTH0_ID,
      type: 'NEW_CONTENT' as const,
      catSlug: 'bail-professionnel',
      themeSlug: null,
      message:
        'De nouveaux contenus sont disponibles sur le bail professionnel.',
      priority: 1,
    },
  ];

  for (const rec of recommendations) {
    const userId = userMap.get(rec.auth0Id);
    const categoryId = rec.catSlug ? categoryMap.get(rec.catSlug) : null;
    const themeId =
      rec.catSlug && rec.themeSlug
        ? themeMap.get(`${rec.catSlug}/${rec.themeSlug}`)
        : null;
    if (!userId) continue;

    await prisma.aiRecommendation.create({
      data: {
        userId,
        type: rec.type,
        categoryId: categoryId ?? null,
        themeId: themeId ?? null,
        message: rec.message,
        priority: rec.priority,
        isRead: false,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
    console.log(`  ✅ [${rec.type}] → ${rec.auth0Id}`);
  }

  console.log('\n🎉 Seed completed successfully!\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });