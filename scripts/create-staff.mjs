import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('Z26071980', 10)
  
  const user = await prisma.user.upsert({
    where: { username: 'Rehman' },
    update: {
      password: hashedPassword,
      role: 'VIEWER'
    },
    create: {
      username: 'Rehman',
      password: hashedPassword,
      role: 'VIEWER'
    }
  })

  // Create singleton settings row
  await prisma.systemSettings.upsert({
    where: { id: 'singleton' },
    update: {},
    create: {
      id: 'singleton'
    }
  })

  console.log('Successfully created user Rehman as VIEWER.')
  console.log('Successfully initialized SystemSettings.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
