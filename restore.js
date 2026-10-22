const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function main() {
  console.log("Restoring database from db_dump.json...");
  
  const rawData = fs.readFileSync('db_dump.json');
  const data = JSON.parse(rawData);

  // Users
  for (const item of data.users) {
    await prisma.user.create({ data: item });
  }
  
  // SystemSettings
  for (const item of data.systemSettings) {
    await prisma.systemSettings.create({ data: item });
  }

  // Persons
  for (const item of data.persons) {
    await prisma.person.create({ data: item });
  }

  // Transactions
  for (const item of data.transactions) {
    await prisma.transaction.create({ data: item });
  }

  // Files
  for (const item of data.files) {
    await prisma.file.create({ data: item });
  }

  // Notes
  for (const item of data.notes) {
    await prisma.note.create({ data: item });
  }

  // RecurringExpenses
  for (const item of data.recurringExpenses) {
    await prisma.recurringExpense.create({ data: item });
  }

  // ExpensePayments
  for (const item of data.expensePayments) {
    await prisma.expensePayment.create({ data: item });
  }

  // AuditLogs
  for (const item of data.auditLogs) {
    await prisma.auditLog.create({ data: item });
  }

  console.log("Database restore complete!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
