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
const CONTENT_DIR = resolve(
  __dirname,
  '../../../../contenu_5_secondes_chrono',
);
const CSV_DIR = join(CONTENT_DIR, 'base de donnee csv');

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

// ── CSV Parsing ──
function parseCsv(filePath: string, categorySlug: string): Array<{
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

  // Strip UTF-8 BOM
  if (raw.charCodeAt(0) === 0xfeff) {
    raw = raw.slice(1);
  }

  const lines = raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) return [];

  // Detect format from header
  const header = lines[0].toLowerCase();
  const isEnrichedFormat = header.includes('id;categorie') || header.includes('id;') && header.includes('niveau');

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

  const cleanOption = (opt: string) =>
    opt.trim().replace(/^[A-D]\)\s*/, '');

  // CSV-aware field splitter: handles quoted fields with embedded semicolons and ""
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
            i++; // skip escaped quote
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

    let text: string, optA: string, optB: string, optC: string, optD: string, answer: string;
    let level: number | undefined;
    let theme: string | undefined;

    if (isEnrichedFormat) {
      // Enriched format: id;categorie;niveau;question;optionA;optionB;optionC;optionD;reponseCorrecte;...
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
      // Simple format: question;optionA;optionB;optionC;optionD;reponseCorrecte
      if (parts.length < 6) continue;
      text = parts[0].trim();
      optA = cleanOption(parts[1]);
      optB = cleanOption(parts[2]);
      optC = cleanOption(parts[3]);
      optD = cleanOption(parts[4]);
      answer = parts[5].trim().toUpperCase();
    }

    // Validate answer is a single letter A-D
    if (!text || !['A', 'B', 'C', 'D'].includes(answer)) {
      // Skip silently — these are malformed rows
      continue;
    }

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

// ── Main Seed ──
async function main() {
  console.log('🌱 Starting IPF seed...\n');

  // 1. Seed Categories
  console.log('📁 Seeding categories...');
  const categoryMap = new Map<string, string>();

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

  // 2. Seed Questions from CSV
  console.log('\n📝 Seeding questions from CSV...');
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

    let seeded = 0;
    for (const q of questions) {
      // Use text as unique identifier (upsert by text+category)
      const existing = await prisma.question.findFirst({
        where: { text: q.text, categoryId },
      });

      if (!existing) {
        await prisma.question.create({
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
        seeded++;
      }
    }

    console.log(`  ✅ ${seeded} new questions seeded for ${cat.name}`);
    totalSeeded += seeded;
  }

  console.log(`\n📊 Total questions seeded: ${totalSeeded}`);

  // 3. Seed Badges
  console.log('\n🏅 Seeding badges...');
  for (const badge of BADGES) {
    await prisma.badge.upsert({
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
    console.log(
      `  ✅ ${badge.name} ${badge.isSecret ? '(🔒 secret)' : ''}`,
    );
  }

  // 4. Seed Subscription Plans (placeholder for future)
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

  // 5. Seed Job Sectors & Profiles
  console.log('\n👔 Seeding job sectors & profiles...');
  const JOB_DATA: { sector: string; sectorSlug: string; order: number; profiles: { name: string; slug: string }[] }[] = [
    {
      sector: 'Immobilier — Transaction',
      sectorSlug: 'immobilier-transaction',
      order: 1,
      profiles: [
        { name: 'Agent immobilier transaction professionnel/commercial', slug: 'agent-immo-transaction-pro' },
        { name: 'Agent immobilier transaction habitation', slug: 'agent-immo-transaction-habitation' },
        { name: 'Assistant(e) commercial(e) agence immobilière', slug: 'assistant-commercial-agence' },
      ],
    },
    {
      sector: 'Immobilier — Gestion locative',
      sectorSlug: 'immobilier-gestion-locative',
      order: 2,
      profiles: [
        { name: 'Gestionnaire locatif professionnel/commercial', slug: 'gestionnaire-locatif-pro' },
        { name: 'Gestionnaire locatif habitation', slug: 'gestionnaire-locatif-habitation' },
      ],
    },
    {
      sector: 'Immobilier — Expertise et conseil',
      sectorSlug: 'immobilier-expertise-conseil',
      order: 3,
      profiles: [
        { name: 'Expert immobilier', slug: 'expert-immobilier' },
        { name: 'Consultant en immobilier d\'entreprise', slug: 'consultant-immo-entreprise' },
      ],
    },
    {
      sector: 'Finance et patrimoine',
      sectorSlug: 'finance-patrimoine',
      order: 4,
      profiles: [
        { name: 'Conseiller en gestion de patrimoine (CGP)', slug: 'cgp' },
        { name: 'Conseiller bancaire professionnels', slug: 'conseiller-bancaire-pro' },
      ],
    },
    {
      sector: 'Comptabilité et gestion',
      sectorSlug: 'comptabilite-gestion',
      order: 5,
      profiles: [
        { name: 'Expert-comptable', slug: 'expert-comptable' },
        { name: 'Collaborateur cabinet comptable', slug: 'collaborateur-cabinet-comptable' },
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
        { name: 'Créateur/repreneur d\'entreprise', slug: 'createur-repreneur-entreprise' },
        { name: 'Artisan avec local commercial', slug: 'artisan-local-commercial' },
      ],
    },
    {
      sector: 'Collectivités et aménagement',
      sectorSlug: 'collectivites-amenagement',
      order: 7,
      profiles: [
        { name: 'Chargé de développement économique territorial', slug: 'charge-dev-eco-territorial' },
        { name: 'Gestionnaire foncier collectivité', slug: 'gestionnaire-foncier-collectivite' },
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
        create: { sectorId: sector.id, name: p.name, slug: p.slug, order: i + 1 },
      });
      totalProfiles++;
    }
    console.log(`  ✅ ${s.sector}: ${s.profiles.length} profils`);
  }
  console.log(`  📊 Total: ${JOB_DATA.length} secteurs, ${totalProfiles} profils métiers`);

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
