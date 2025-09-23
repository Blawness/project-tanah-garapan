'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Upload, X, File, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'

interface FileUploadProps {
  value?: string
  onChange: (url: string) => void
  onRemove: () => void
  disabled?: boolean
  accept?: string
}

export function FileUpload({ 
  value, 
  onChange, 
  onRemove, 
  disabled = false,
  accept = "image/*,application/pdf,.doc,.docx"
}: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (result.success) {
        onChange(result.data.url)
        toast.success('File uploaded successfully')
      } else {
        toast.error(result.error || 'Upload failed')
      }
    } catch (error) {
      toast.error('Upload failed')
    } finally {
      setIsUploading(false)
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemove = () => {
    onRemove()
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const getFileName = (url: string) => {
    return url.split('/').pop() || 'Unknown file'
  }

  const getFileIcon = (url: string) => {
    const extension = url.split('.').pop()?.toLowerCase()
    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension || '')) {
      return (
        <img 
          src={url} 
          alt="Preview" 
          className="w-8 h-8 object-cover rounded"
        />
      )
    }
    return <File className="w-8 h-8 text-gray-400" />
  }

  return (
    <div className="space-y-2">
      <Label>File Upload (Optional)</Label>
      
      {value ? (
        <div className="flex items-center justify-between p-3 border rounded-md bg-gray-50">
          <div className="flex items-center space-x-3">
            {getFileIcon(value)}
            <div>
              <p className="text-sm font-medium">{getFileName(value)}</p>
              <p className="text-xs text-gray-500">File uploaded</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => window.open(value, '_blank')}
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              disabled={disabled}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center space-x-2">
          <Input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            disabled={disabled || isUploading}
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || isUploading}
          >
            <Upload className="w-4 h-4 mr-2" />
            {isUploading ? 'Uploading...' : 'Upload'}
          </Button>
        </div>
      )}
      
      <p className="text-xs text-gray-500">
        Supported formats: Images (JPG, PNG, GIF), PDF, Word documents. Max size: 5MB
      </p>
    </div>
  )
}
