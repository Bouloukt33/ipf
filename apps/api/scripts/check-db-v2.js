const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- DATABASE CHECK ---');
  
  const users = await prisma.user.findMany({
    select: { id: true, email: true, auth0Id: true }
  });
  console.log('Users found:', users.length);
  users.forEach(u => console.log(`  - ${u.email} (${u.id}) [${u.auth0Id}]`));

  const packs = await prisma.pack.findMany({
    include: {
      category: { select: { name: true } },
      assignedUser: { select: { email: true } }
    }
  });
  console.log('\nPacks found:', packs.length);
  packs.forEach(p => {
    console.log(`  - ${p.name} (ID: ${p.id})`);
    console.log(`    Visibility: ${p.visibility}`);
    console.log(`    IsActive: ${p.isActive}`);
    console.log(`    AssignedUser: ${p.assignedUser?.email || 'NONE'}`);
    console.log(`    AssignedUserId: ${p.assignedUserId || 'NONE'}`);
  });
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
