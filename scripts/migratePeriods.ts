import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // 1. Create a default period if none exists
  let period = await prisma.period.findFirst({
    where: { isDefault: true }
  })

  if (!period) {
    period = await prisma.period.create({
      data: {
        name: '2024/2025 Ganjil',
        isDefault: true,
        isActive: true,
      }
    })
    console.log('Created default period:', period.name)
  }

  // 2. Link all classes without period to this period
  const result = await prisma.class.updateMany({
    where: { periodId: null as any },
    data: { periodId: period.id }
  })

  console.log(`Linked ${result.count} classes to period ${period.name}`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
