const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const packId = 'cmpu5sys7000001ldxp5bk9os';
  console.log(`--- Checking Pack: ${packId} ---`);
  
  const pack = await prisma.pack.findUnique({
    where: { id: packId },
    include: {
      category: true,
      _count: { select: { questions: true } }
    }
  });

  if (!pack) {
    console.log('Pack not found!');
    return;
  }

  console.log('Pack Details:', JSON.stringify(pack, null, 2));

  const questions = await prisma.question.findMany({
    where: { packId: packId },
    select: { id: true, text: true, isActive: true }
  });

  console.log(`\nQuestions found linked to this pack (${questions.length}):`);
  questions.forEach(q => console.log(`  - [${q.isActive ? 'ACTIVE' : 'INACTIVE'}] ${q.text.slice(0, 50)}...`));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
