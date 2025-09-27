const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('Checking for corrupted budget values...')

  // Find all proyek records with invalid budget values
  const corruptedProyek = await prisma.proyekPembangunan.findMany({
    where: {
      OR: [
        { budgetTotal: null },
        { budgetTerpakai: null },
        // Note: Prisma doesn't support NaN checks directly, so we'll handle this in JavaScript
      ]
    }
  })

  console.log(`Found ${corruptedProyek.length} proyek records with null budget values`)

  // Also check for NaN values by converting to numbers
  const allProyek = await prisma.proyekPembangunan.findMany()
  const corruptedWithNaN = allProyek.filter(proyek =>
    isNaN(Number(proyek.budgetTotal)) || isNaN(Number(proyek.budgetTerpakai))
  )

  console.log(`Found ${corruptedWithNaN.length} proyek records with NaN budget values`)

  const allCorrupted = [...corruptedProyek, ...corruptedWithNaN.filter(p =>
    !corruptedProyek.some(cp => cp.id === p.id)
  )]

  console.log(`Total corrupted records: ${allCorrupted.length}`)

  if (allCorrupted.length > 0) {
    for (const proyek of allCorrupted) {
      console.log(`Fixing proyek ${proyek.id}: budgetTotal=${proyek.budgetTotal}, budgetTerpakai=${proyek.budgetTerpakai}`)

      await prisma.proyekPembangunan.update({
        where: { id: proyek.id },
        data: {
          budgetTotal: 0,
          budgetTerpakai: 0
        }
      })
    }
    console.log('Fixed corrupted budget values')
  } else {
    console.log('No corrupted budget values found')
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
