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

  // Create sample proyek pembangunan
  const proyek1 = await prisma.proyekPembangunan.create({
    data: {
      namaProyek: 'Proyek Pembangunan Jalan Desa',
      lokasiProyek: 'Desa Sukamaju',
      deskripsi: 'Pembangunan jalan desa sepanjang 2 km',
      statusProyek: 'PLANNING',
      tanggalMulai: new Date('2024-01-15'),
      tanggalSelesai: new Date('2024-06-15'),
      budgetTotal: 500000000,
      budgetTerpakai: 0,
      createdBy: admin.name,
    },
  })

  const proyek2 = await prisma.proyekPembangunan.create({
    data: {
      namaProyek: 'Proyek Irigasi Sawah',
      lokasiProyek: 'Desa Makmur',
      deskripsi: 'Pembangunan sistem irigasi untuk lahan pertanian',
      statusProyek: 'ONGOING',
      tanggalMulai: new Date('2024-02-01'),
      tanggalSelesai: new Date('2024-08-01'),
      budgetTotal: 750000000,
      budgetTerpakai: 250000000,
      createdBy: manager.name,
    },
  })

  const proyek3 = await prisma.proyekPembangunan.create({
    data: {
      namaProyek: 'Proyek Pasar Desa',
      lokasiProyek: 'Desa Sejahtera',
      deskripsi: 'Pembangunan pasar tradisional modern',
      statusProyek: 'COMPLETED',
      tanggalMulai: new Date('2023-06-01'),
      tanggalSelesai: new Date('2023-12-01'),
      budgetTotal: 1000000000,
      budgetTerpakai: 950000000,
      createdBy: admin.name,
    },
  })

  // Create sample pembelian sertifikat
  const entry1 = await prisma.tanahGarapanEntry.findFirst({
    where: { namaPemegangHak: 'Budi Santoso' }
  })

  const entry2 = await prisma.tanahGarapanEntry.findFirst({
    where: { namaPemegangHak: 'Siti Rahayu' }
  })

  const entry3 = await prisma.tanahGarapanEntry.findFirst({
    where: { namaPemegangHak: 'Ahmad Wijaya' }
  })

  if (entry1 && entry2 && entry3) {
    await prisma.pembelianSertifikat.create({
      data: {
        proyekId: proyek1.id,
        tanahGarapanId: entry1.id,
        namaWarga: 'Budi Santoso',
        alamatWarga: 'Desa Sukamaju RT 01 RW 02',
        noKtpWarga: '3201010101010001',
        noHpWarga: '081234567890',
        hargaBeli: 15000000,
        statusPembelian: 'NEGOTIATION',
        tanggalKontrak: new Date('2024-01-20'),
        metodePembayaran: 'CASH',
        keterangan: 'Pembelian untuk proyek jalan desa',
        createdBy: admin.name,
      },
    })

    await prisma.pembelianSertifikat.create({
      data: {
        proyekId: proyek2.id,
        tanahGarapanId: entry2.id,
        namaWarga: 'Siti Rahayu',
        alamatWarga: 'Desa Makmur RT 03 RW 01',
        noKtpWarga: '3201010101010002',
        noHpWarga: '081234567891',
        hargaBeli: 20000000,
        statusPembelian: 'AGREED',
        tanggalKontrak: new Date('2024-02-10'),
        metodePembayaran: 'TRANSFER',
        keterangan: 'Pembelian untuk proyek irigasi',
        createdBy: manager.name,
      },
    })

    await prisma.pembelianSertifikat.create({
      data: {
        proyekId: proyek3.id,
        tanahGarapanId: entry3.id,
        namaWarga: 'Ahmad Wijaya',
        alamatWarga: 'Desa Sejahtera RT 02 RW 03',
        noKtpWarga: '3201010101010003',
        noHpWarga: '081234567892',
        hargaBeli: 18000000,
        statusPembelian: 'PAID',
        tanggalKontrak: new Date('2023-07-15'),
        tanggalPembayaran: new Date('2023-08-01'),
        metodePembayaran: 'BANK_TRANSFER',
        nomorSertifikat: 'SHM-001/2023',
        statusSertifikat: 'ISSUED',
        keterangan: 'Pembelian untuk proyek pasar desa',
        createdBy: admin.name,
      },
    })
  }

  console.log(`Created users: ${developer.name}, ${admin.name}, ${manager.name}, ${user.name}`)
  console.log(`Created ${sampleEntries.length} sample tanah garapan entries`)
  console.log(`Created 3 sample proyek pembangunan`)
  console.log(`Created 3 sample pembelian sertifikat`)

  // Check existing proyek budget values
  const existingProyek = await prisma.proyekPembangunan.findMany({
    select: { id: true, namaProyek: true, budgetTotal: true, budgetTerpakai: true }
  })

  console.log('Existing proyek budget values:')
  existingProyek.forEach(p => {
    console.log(`${p.namaProyek}: budgetTotal=${p.budgetTotal}, budgetTerpakai=${p.budgetTerpakai}`)
  })
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
