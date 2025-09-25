import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ShoppingCart, DollarSign, TrendingUp, Users } from 'lucide-react'

// Temporary placeholder component until we fix the client-side issues
export default function PembelianPage() {
  const stats = {
    totalPembelian: 0,
    totalHarga: 0,
    pembelianByStatus: {
      NEGOTIATION: 0,
      AGREED: 0,
      CONTRACT_SIGNED: 0,
      PAID: 0,
      CERTIFICATE_ISSUED: 0,
      COMPLETED: 0,
      CANCELLED: 0
    },
    pembayaranByStatus: {
      PENDING: 0,
      VERIFIED: 0,
      REJECTED: 0
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    const colors = {
      NEGOTIATION: 'bg-yellow-100 text-yellow-800',
      AGREED: 'bg-blue-100 text-blue-800',
      CONTRACT_SIGNED: 'bg-purple-100 text-purple-800',
      PAID: 'bg-green-100 text-green-800',
      CERTIFICATE_ISSUED: 'bg-indigo-100 text-indigo-800',
      COMPLETED: 'bg-gray-100 text-gray-800',
      CANCELLED: 'bg-red-100 text-red-800'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getStatusLabel = (status: string) => {
    const labels = {
      NEGOTIATION: 'Negotiation',
      AGREED: 'Agreed',
      CONTRACT_SIGNED: 'Contract Signed',
      PAID: 'Paid',
      CERTIFICATE_ISSUED: 'Certificate Issued',
      COMPLETED: 'Completed',
      CANCELLED: 'Cancelled'
    }
    return labels[status as keyof typeof labels] || status
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pembelian Sertifikat</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manajemen pembelian sertifikat tanah garapan dari warga
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pembelian</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPembelian}</div>
              <p className="text-xs text-muted-foreground">
                Pembelian sertifikat
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Harga</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(Number(stats.totalHarga))}</div>
              <p className="text-xs text-muted-foreground">
                Total nilai pembelian
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status Pembelian</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {Object.entries(stats.pembelianByStatus).slice(0, 3).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <Badge className={getStatusColor(status)}>
                      {getStatusLabel(status)}
                    </Badge>
                    <span className="text-sm font-medium">{count as number}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status Pembayaran</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {Object.entries(stats.pembayaranByStatus).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <Badge className={
                      status === 'VERIFIED' ? 'bg-green-100 text-green-800' :
                      status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }>
                      {status}
                    </Badge>
                    <span className="text-sm font-medium">{count as number}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Coming Soon Message */}
        <Card>
          <CardHeader>
            <CardTitle>Fitur Sedang Dikembangkan</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Halaman pembelian sertifikat sedang dalam pengembangan. 
              Fitur ini akan memungkinkan Anda untuk:
            </p>
            <ul className="mt-4 space-y-2 text-sm text-gray-600">
              <li>• Memilih tanah garapan yang tersedia untuk dibeli</li>
              <li>• Input data warga pemilik tanah</li>
              <li>• Proses negosiasi harga dengan warga</li>
              <li>• Generate kontrak pembelian</li>
              <li>• Melacak pembayaran bertahap (DP, cicilan, pelunasan)</li>
              <li>• Generate sertifikat kepemilikan</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}