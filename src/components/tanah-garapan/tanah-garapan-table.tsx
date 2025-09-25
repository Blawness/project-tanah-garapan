'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { deleteTanahGarapanEntry } from '@/lib/server-actions/tanah-garapan'
import { canManageData } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { TanahGarapanForm } from './tanah-garapan-form'
import { FilePreview } from '@/components/shared/file-preview'
import { MoreHorizontal, Edit, Trash2, ExternalLink, Printer, FileText, Eye } from 'lucide-react'
import { toast } from 'sonner'

interface TanahGarapanTableProps {
  entries: any[]
  onRefresh: () => void
  selectedIds: string[]
  onSelectionChange: (ids: string[]) => void
}

export function TanahGarapanTable({ 
  entries, 
  onRefresh, 
  selectedIds, 
  onSelectionChange 
}: TanahGarapanTableProps) {
  const { data: session } = useSession()
  const [editEntry, setEditEntry] = useState<any>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [previewFile, setPreviewFile] = useState<{url: string, name: string} | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  const canManage = session?.user && canManageData(session.user.role)

  const handleSelectAll = () => {
    if (selectedIds.length === entries.length) {
      onSelectionChange([])
    } else {
      onSelectionChange(entries.map(entry => entry.id))
    }
  }

  const handleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter(selectedId => selectedId !== id))
    } else {
      onSelectionChange([...selectedIds, id])
    }
  }

  const handleEdit = (entry: any) => {
    setEditEntry(entry)
    setIsEditDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus data ini?')) {
      return
    }

    setIsDeleting(id)
    try {
      const result = await deleteTanahGarapanEntry(id)
      if (result.success) {
        toast.success(result.message || 'Entry deleted successfully')
        onRefresh()
      } else {
        toast.error(result.error || 'Failed to delete entry')
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
    } finally {
      setIsDeleting(null)
    }
  }

  const handlePrintSingle = (id: string) => {
    const printWindow = window.open(`/garapan/${id}/print`, '_blank')
    if (printWindow) {
      printWindow.focus()
    }
  }

  const handlePreviewFile = (fileUrl: string, fileName: string) => {
    setPreviewFile({ url: fileUrl, name: fileName })
    setIsPreviewOpen(true)
  }


  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('id-ID')
  }

  const formatNumber = (num: number) => {
    return num.toLocaleString('id-ID')
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={selectedIds.length === entries.length && entries.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Letak Tanah</TableHead>
              <TableHead>Pemegang Hak</TableHead>
              <TableHead>Letter C</TableHead>
              <TableHead>No. SKG</TableHead>
              <TableHead className="text-right">Luas (m²)</TableHead>
              <TableHead>File</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
                  Tidak ada data tanah garapan.
                </TableCell>
              </TableRow>
            ) : (
              entries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.includes(entry.id)}
                      onCheckedChange={() => handleSelectOne(entry.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    <div>
                      <div className="font-medium">{entry.letakTanah}</div>
                      {entry.keterangan && (
                        <div className="text-sm text-muted-foreground">
                          {entry.keterangan}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{entry.namaPemegangHak}</TableCell>
                  <TableCell>{entry.letterC}</TableCell>
                  <TableCell>{entry.nomorSuratKeteranganGarapan}</TableCell>
                  <TableCell className="text-right">
                    {formatNumber(entry.luas)}
                  </TableCell>
                  <TableCell>
                    {entry.file_url ? (
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePreviewFile(entry.file_url, `file-${entry.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(entry.file_url, '_blank')}
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>{formatDate(entry.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handlePrintSingle(entry.id)}
                        >
                          <Printer className="mr-2 h-4 w-4" />
                          Print
                        </DropdownMenuItem>
                        
                        {entry.file_url && (
                          <DropdownMenuItem
                            onClick={() => window.open(entry.file_url, '_blank')}
                          >
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Lihat File
                          </DropdownMenuItem>
                        )}
                        
                        {canManage && (
                          <>
                            <DropdownMenuItem
                              onClick={() => handleEdit(entry)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(entry.id)}
                              disabled={isDeleting === entry.id}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              {isDeleting === entry.id ? 'Menghapus...' : 'Hapus'}
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <TanahGarapanForm
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        entry={editEntry}
        onSuccess={() => {
          onRefresh()
          setEditEntry(null)
        }}
      />

      {previewFile && (
        <FilePreview
          open={isPreviewOpen}
          onOpenChange={setIsPreviewOpen}
          fileUrl={previewFile.url}
          fileName={previewFile.name}
        />
      )}
    </>
  )
}
