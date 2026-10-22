const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.user.findMany().then(u => {
  u.forEach(x => console.log(`Username: ${x.username} | Role: ${x.role}`));
}).finally(() => p.$disconnect());
