import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create default users
  const hashedPassword = await bcrypt.hash('password123', 12)

  const developer = await prisma.user.upsert({
    where: { email: 'developer@example.com' },
    update: {},
    create: {
      email: 'developer@example.com',
      name: 'Developer User',
      password: hashedPassword,
      role: 'DEVELOPER',
    },
  })

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: hashedPassword,
      role: 'ADMIN',
    },
  })

  const manager = await prisma.user.upsert({
    where: { email: 'manager@example.com' },
    update: {},
    create: {
      email: 'manager@example.com',
      name: 'Manager User',
      password: hashedPassword,
      role: 'MANAGER',
    },
  })

  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      name: 'Regular User',
      password: hashedPassword,
      role: 'USER',
    },
  })

  // Create sample tanah garapan entries
  const sampleEntries = [
    {
      letakTanah: 'Desa Sukamaju, Kecamatan A',
      namaPemegangHak: 'Budi Santoso',
      letterC: 'C-001/2024',
      nomorSuratKeteranganGarapan: 'SKG-001/2024',
      luas: 1500,
      keterangan: 'Tanah garapan untuk pertanian padi',
    },
    {
      letakTanah: 'Desa Makmur, Kecamatan B',
      namaPemegangHak: 'Siti Rahayu',
      letterC: 'C-002/2024',
      nomorSuratKeteranganGarapan: 'SKG-002/2024',
      luas: 2000,
      keterangan: 'Tanah garapan untuk pertanian palawija',
    },
    {
      letakTanah: 'Desa Sejahtera, Kecamatan C',
      namaPemegangHak: 'Ahmad Wijaya',
      letterC: 'C-003/2024',
      nomorSuratKeteranganGarapan: 'SKG-003/2024',
      luas: 1200,
      keterangan: 'Tanah garapan untuk kebun sayur',
    },
  ]

  for (const entry of sampleEntries) {
    await prisma.tanahGarapanEntry.create({
      data: entry,
    })
  }

  console.log(`Created users: ${developer.name}, ${admin.name}, ${manager.name}, ${user.name}`)
  console.log(`Created ${sampleEntries.length} sample tanah garapan entries`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
