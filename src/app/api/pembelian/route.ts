import { NextRequest, NextResponse } from 'next/server'
import { getPembelianSertifikat, addPembelianSertifikat, updatePembelianSertifikat, PembelianFormData } from '@/lib/server-actions/pembelian'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')
    const proyekId = searchParams.get('proyekId')

    const result = await getPembelianSertifikat(page, pageSize, proyekId || undefined)

    if (result.success) {
      return NextResponse.json(result)
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const url = new URL(request.url)
    const pathSegments = url.pathname.split('/')
    const id = pathSegments[pathSegments.length - 1]

    if (!id || id === 'pembelian') {
      return NextResponse.json(
        { error: 'Pembelian ID is required' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const pembelianData: PembelianFormData = {
      proyekId: body.proyekId,
      tanahGarapanId: body.tanahGarapanId,
      namaWarga: body.namaWarga,
      alamatWarga: body.alamatWarga,
      noKtpWarga: body.noKtpWarga,
      noHpWarga: body.noHpWarga,
      hargaBeli: Number(body.hargaBeli),
      statusPembelian: body.statusPembelian || 'NEGOTIATION',
      tanggalKontrak: body.tanggalKontrak || null,
      tanggalPembayaran: body.tanggalPembayaran || null,
      metodePembayaran: body.metodePembayaran || null,
      buktiPembayaran: body.buktiPembayaran || null,
      keterangan: body.keterangan || null,
      nomorSertifikat: body.nomorSertifikat || null,
      fileSertifikat: body.fileSertifikat || null,
      statusSertifikat: body.statusSertifikat || 'PENDING'
    }

    const result = await updatePembelianSertifikat(id, pembelianData)

    if (result.success) {
      return NextResponse.json(result)
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const pembelianData: PembelianFormData = {
      proyekId: body.proyekId,
      tanahGarapanId: body.tanahGarapanId,
      namaWarga: body.namaWarga,
      alamatWarga: body.alamatWarga,
      noKtpWarga: body.noKtpWarga,
      noHpWarga: body.noHpWarga,
      hargaBeli: Number(body.hargaBeli),
      statusPembelian: body.statusPembelian || 'NEGOTIATION',
      tanggalKontrak: body.tanggalKontrak || null,
      tanggalPembayaran: body.tanggalPembayaran || null,
      metodePembayaran: body.metodePembayaran || null,
      buktiPembayaran: body.buktiPembayaran || null,
      keterangan: body.keterangan || null,
      nomorSertifikat: body.nomorSertifikat || null,
      fileSertifikat: body.fileSertifikat || null,
      statusSertifikat: body.statusSertifikat || 'PENDING'
    }

    const result = await addPembelianSertifikat(pembelianData)

    if (result.success) {
      return NextResponse.json(result)
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
