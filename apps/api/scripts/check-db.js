const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- USERS ---');
  const users = await prisma.user.findMany({
    select: { id: true, email: true, auth0Id: true }
  });
  console.log(JSON.stringify(users, null, 2));

  console.log('\n--- PACKS ---');
  const packs = await prisma.pack.findMany({
    include: {
      category: { select: { name: true } },
      assignedUser: { select: { email: true } }
    }
  });
  console.log(JSON.stringify(packs, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
