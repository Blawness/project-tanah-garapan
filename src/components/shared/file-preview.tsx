'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileText, Image, Download } from 'lucide-react'
import { toast } from 'sonner'

interface FilePreviewProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  fileUrl: string
  fileName?: string
}

export function FilePreview({ open, onOpenChange, fileUrl, fileName }: FilePreviewProps) {
  const [isLoading, setIsLoading] = useState(true)

  const getFileIcon = (url: string) => {
    const extension = url.split('.').pop()?.toLowerCase()
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
      return <Image className="h-8 w-8 text-blue-500" />
    }
    return <FileText className="h-8 w-8 text-gray-500" />
  }

  const getFileType = (url: string) => {
    const extension = url.split('.').pop()?.toLowerCase()
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
      return 'Image'
    }
    if (['pdf'].includes(extension || '')) {
      return 'PDF'
    }
    if (['doc', 'docx'].includes(extension || '')) {
      return 'Word Document'
    }
    return 'File'
  }

  const handleDownload = () => {
    try {
      const link = document.createElement('a')
      link.href = fileUrl
      link.download = fileName || 'download'
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success('File berhasil didownload')
    } catch (error) {
      toast.error('Gagal mendownload file')
    }
  }


  const isImage = () => {
    const extension = fileUrl.split('.').pop()?.toLowerCase()
    return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center space-x-2">
              {getFileIcon(fileUrl)}
              <span>{fileName || 'File Preview'}</span>
              <Badge variant="outline">{getFileType(fileUrl)}</Badge>
            </DialogTitle>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          {isImage() ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <img
                src={fileUrl}
                alt={fileName || 'Preview'}
                className="max-w-full max-h-full object-contain"
                onLoad={() => setIsLoading(false)}
                onError={() => {
                  setIsLoading(false)
                  toast.error('Gagal memuat preview file')
                }}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center min-h-[400px] border rounded-lg">
              <div className="text-center">
                {getFileIcon(fileUrl)}
                <p className="mt-2 text-sm text-gray-500">
                  Preview tidak tersedia untuk file {getFileType(fileUrl)}
                </p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={handleDownload}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download untuk melihat
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
