import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const subjects = await prisma.subject.findMany({
    where: {
      status: 'DRAFT',
      googleDocsUrl: {
        not: null,
        // In Prisma, we can't easily check for empty string in MySQL with `not: ''` cleanly without multiple conditions, 
        // but we'll fetch them and filter
      }
    }
  })

  for (const subject of subjects) {
    if (subject.googleDocsUrl && subject.googleDocsUrl.trim() !== '') {
      await prisma.subject.update({
        where: { id: subject.id },
        data: { status: 'PROCESS' }
      })
      console.log(`Updated subject ${subject.name} to PROCESS`)
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect())
