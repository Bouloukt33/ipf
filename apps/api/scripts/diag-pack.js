const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const packId = 'cmpu5sys7000001ldxp5bk9os';
  console.log(`\n=== DIAGNOSTIC PACK: ${packId} ===`);
  
  const pack = await prisma.pack.findUnique({
    where: { id: packId },
    select: { id: true, name: true, categoryId: true, visibility: true, isActive: true }
  });

  if (!pack) {
    console.log('❌ PACK INTROUVABLE EN BASE');
    return;
  }

  console.log('✅ Pack trouvé:', JSON.stringify(pack, null, 2));

  const questionsCount = await prisma.question.count({
    where: { packId: packId }
  });
  console.log(`\nNombre de questions liées au pack (total): ${questionsCount}`);

  const activeQuestionsCount = await prisma.question.count({
    where: { packId: packId, isActive: true }
  });
  console.log(`Nombre de questions liées au pack (ACTIVES): ${activeQuestionsCount}`);

  if (questionsCount > 0) {
    const samples = await prisma.question.findMany({
      where: { packId: packId },
      take: 5,
      select: { id: true, text: true, isActive: true, categoryId: true }
    });
    console.log('\nÉchantillon de questions:');
    samples.forEach(q => console.log(`  - [${q.isActive ? 'ACTIVE' : 'INACTIVE'}] ID: ${q.id} | Cat: ${q.categoryId} | ${q.text.slice(0, 40)}...`));
  } else {
    console.log('\n❌ AUCUNE QUESTION n\'est liée à ce pack_id dans la table questions.');
    
    // Check if there are ANY questions in the category of the pack
    const catQuestions = await prisma.question.count({ where: { categoryId: pack.categoryId } });
    console.log(`Note: Il y a ${catQuestions} questions au total dans la catégorie ${pack.categoryId}.`);
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
