const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const p = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('N5110', 10);
  const user = await p.user.upsert({
    where: { username: 'Fazal' },
    update: { password: hashedPassword, role: 'ADMIN' },
    create: { username: 'Fazal', password: hashedPassword, role: 'ADMIN' }
  });
  console.log('Admin account created: Fazal (ADMIN)');
}

main().finally(() => p.$disconnect());
