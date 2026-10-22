const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function main() {
  console.log("Dumping SQLite database to JSON...");

  const data = {
    users: await prisma.user.findMany(),
    systemSettings: await prisma.systemSettings.findMany(),
    persons: await prisma.person.findMany(),
    transactions: await prisma.transaction.findMany(),
    files: await prisma.file.findMany(),
    notes: await prisma.note.findMany(),
    recurringExpenses: await prisma.recurringExpense.findMany(),
    expensePayments: await prisma.expensePayment.findMany(),
    auditLogs: await prisma.auditLog.findMany(),
  };

  fs.writeFileSync('db_dump.json', JSON.stringify(data, null, 2));
  console.log("Dump successful! Saved to db_dump.json");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
