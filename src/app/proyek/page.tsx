import { AppLayout } from '@/components/layout/app-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Building2, DollarSign, TrendingUp, Calendar } from 'lucide-react'

// Temporary placeholder component until we fix the client-side issues
export default function ProyekPage() {
  const stats = {
    totalProyek: 0,
    totalBudget: 0,
    totalTerpakai: 0,
    proyekByStatus: {
      PLANNING: 0,
      ONGOING: 0,
      COMPLETED: 0,
      CANCELLED: 0
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
      PLANNING: 'bg-blue-100 text-blue-800',
      ONGOING: 'bg-green-100 text-green-800',
      COMPLETED: 'bg-gray-100 text-gray-800',
      CANCELLED: 'bg-red-100 text-red-800'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getStatusLabel = (status: string) => {
    const labels = {
      PLANNING: 'Planning',
      ONGOING: 'Ongoing',
      COMPLETED: 'Completed',
      CANCELLED: 'Cancelled'
    }
    return labels[status as keyof typeof labels] || status
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Proyek Pembangunan</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manajemen proyek pembangunan dan pembelian sertifikat tanah garapan
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Proyek</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProyek}</div>
              <p className="text-xs text-muted-foreground">
                Proyek pembangunan
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(Number(stats.totalBudget))}</div>
              <p className="text-xs text-muted-foreground">
                Budget keseluruhan
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Budget Terpakai</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(Number(stats.totalTerpakai))}</div>
              <p className="text-xs text-muted-foreground">
                Budget yang sudah digunakan
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status Proyek</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {Object.entries(stats.proyekByStatus).map(([status, count]) => (
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
        </div>

        {/* Coming Soon Message */}
        <Card>
          <CardHeader>
            <CardTitle>Fitur Sedang Dikembangkan</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Halaman proyek pembangunan sedang dalam pengembangan. 
              Fitur ini akan memungkinkan Anda untuk:
            </p>
            <ul className="mt-4 space-y-2 text-sm text-gray-600">
              <li>• Membuat dan mengelola proyek pembangunan</li>
              <li>• Melacak budget proyek</li>
              <li>• Membeli sertifikat tanah garapan dari warga</li>
              <li>• Mengelola kontrak dan pembayaran</li>
              <li>• Generate sertifikat kepemilikan</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}