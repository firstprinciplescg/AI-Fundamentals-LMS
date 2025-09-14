import React, { useState, useRef, useCallback } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Badge } from '../ui/badge'
import {
  Upload,
  X,
  Image,
  Video,
  FileText,
  Download,
  Eye,
  Trash2,
  Copy,
  Check,
  AlertCircle,
  Loader2
} from '../icons'
import { cms } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

const MediaUploader = ({
  onUploadComplete,
  context = 'general',
  contextId = null,
  maxFiles = 10,
  acceptedTypes = ['image/*', 'video/*', 'application/pdf', '.md', '.txt'],
  maxSize = 10 * 1024 * 1024 // 10MB default
}) => {
  const { user } = useAuth()
  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef(null)

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    setDragOver(false)
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragOver(false)

    const droppedFiles = Array.from(e.dataTransfer.files)
    handleFilesSelected(droppedFiles)
  }, [])

  const handleFilesSelected = (selectedFiles) => {
    const validFiles = selectedFiles.filter(file => {
      // Check file size
      if (file.size > maxSize) {
        alert(`File ${file.name} is too large. Maximum size is ${maxSize / 1024 / 1024}MB.`)
        return false
      }

      // Check file type
      const isValidType = acceptedTypes.some(type => {
        if (type.includes('*')) {
          return file.type.startsWith(type.replace('*', ''))
        }
        return file.type === type || file.name.endsWith(type)
      })

      if (!isValidType) {
        alert(`File ${file.name} has an unsupported format.`)
        return false
      }

      return true
    })

    if (files.length + validFiles.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed.`)
      return
    }

    const newFiles = validFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
      altText: '',
      caption: '',
      status: 'pending' // pending, uploading, uploaded, error
    }))

    setFiles(prev => [...prev, ...newFiles])
  }

  const handleFileSelect = () => {
    fileInputRef.current?.click()
  }

  const removeFile = (fileId) => {
    setFiles(prev => {
      const file = prev.find(f => f.id === fileId)
      if (file?.preview) {
        URL.revokeObjectURL(file.preview)
      }
      return prev.filter(f => f.id !== fileId)
    })
  }

  const updateFileMetadata = (fileId, field, value) => {
    setFiles(prev => prev.map(f =>
      f.id === fileId ? { ...f, [field]: value } : f
    ))
  }

  const uploadFiles = async () => {
    if (files.length === 0) return

    setUploading(true)
    const uploadResults = []

    try {
      for (const fileItem of files) {
        if (fileItem.status === 'uploaded') continue

        // Update status to uploading
        setFiles(prev => prev.map(f =>
          f.id === fileItem.id ? { ...f, status: 'uploading' } : f
        ))

        try {
          const result = await cms.media.upload(
            fileItem.file,
            context,
            contextId
          )

          if (result.error) throw result.error

          // Update metadata if provided
          if (fileItem.altText || fileItem.caption) {
            await cms.media.updateMetadata(result.data[0].id, {
              alt_text: fileItem.altText,
              caption: fileItem.caption
            })
          }

          // Update status to uploaded
          setFiles(prev => prev.map(f =>
            f.id === fileItem.id
              ? { ...f, status: 'uploaded', uploadedData: result.data[0] }
              : f
          ))

          uploadResults.push(result.data[0])
        } catch (error) {
          console.error('Upload error:', error)
          setFiles(prev => prev.map(f =>
            f.id === fileItem.id ? { ...f, status: 'error', error: error.message } : f
          ))
        }
      }

      onUploadComplete?.(uploadResults)
    } finally {
      setUploading(false)
    }
  }

  const getFileIcon = (file) => {
    if (file.type.startsWith('image/')) return Image
    if (file.type.startsWith('video/')) return Video
    return FileText
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-800'
      case 'uploading': return 'bg-blue-100 text-blue-800'
      case 'uploaded': return 'bg-green-100 text-green-800'
      case 'error': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload Media Files
          </CardTitle>
          <CardDescription>
            Drag and drop files here, or click to select files.
            Maximum {maxFiles} files, {formatFileSize(maxSize)} per file.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
              dragOver
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleFileSelect}
          >
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-700 mb-2">
              Drop files here or click to browse
            </p>
            <p className="text-sm text-gray-500">
              Supported formats: Images, Videos, PDFs, Text files
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={acceptedTypes.join(',')}
            onChange={(e) => handleFilesSelected(Array.from(e.target.files))}
            className="hidden"
          />
        </CardContent>
      </Card>

      {/* File List */}
      {files.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Files to Upload ({files.length})</CardTitle>
              <Button
                onClick={uploadFiles}
                disabled={uploading || files.every(f => f.status === 'uploaded')}
                className="flex items-center gap-2"
              >
                {uploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                {uploading ? 'Uploading...' : 'Upload All'}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {files.map((fileItem) => {
              const Icon = getFileIcon(fileItem.file)

              return (
                <div key={fileItem.id} className="border rounded-lg p-4">
                  <div className="flex items-start gap-4">
                    {/* File Preview/Icon */}
                    <div className="flex-shrink-0">
                      {fileItem.preview ? (
                        <img
                          src={fileItem.preview}
                          alt={fileItem.file.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Icon className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* File Details */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900 truncate">
                            {fileItem.file.name}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {formatFileSize(fileItem.file.size)} • {fileItem.file.type}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(fileItem.status)}>
                            {fileItem.status === 'uploading' && (
                              <Loader2 className="w-3 h-3 animate-spin mr-1" />
                            )}
                            {fileItem.status}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(fileItem.id)}
                            disabled={fileItem.status === 'uploading'}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Error Message */}
                      {fileItem.status === 'error' && (
                        <div className="flex items-center gap-2 text-red-600 text-sm">
                          <AlertCircle className="w-4 h-4" />
                          <span>{fileItem.error}</span>
                        </div>
                      )}

                      {/* Metadata Fields */}
                      {(fileItem.status === 'pending' || fileItem.status === 'error') && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs font-medium text-gray-700">
                              Alt Text
                            </label>
                            <Input
                              value={fileItem.altText}
                              onChange={(e) => updateFileMetadata(fileItem.id, 'altText', e.target.value)}
                              placeholder="Describe this image..."
                              size="sm"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-700">
                              Caption
                            </label>
                            <Input
                              value={fileItem.caption}
                              onChange={(e) => updateFileMetadata(fileItem.id, 'caption', e.target.value)}
                              placeholder="Optional caption..."
                              size="sm"
                            />
                          </div>
                        </div>
                      )}

                      {/* Upload Success Info */}
                      {fileItem.status === 'uploaded' && fileItem.uploadedData && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <div className="flex items-center gap-2 text-green-800 text-sm font-medium mb-2">
                            <Check className="w-4 h-4" />
                            Upload successful
                          </div>
                          <div className="space-y-1 text-sm">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-600">File ID:</span>
                              <code className="bg-gray-100 px-1 rounded text-xs">
                                {fileItem.uploadedData.id}
                              </code>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigator.clipboard.writeText(fileItem.uploadedData.id)}
                                className="h-6 px-2"
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-600">URL:</span>
                              <code className="bg-gray-100 px-1 rounded text-xs flex-1 truncate">
                                {fileItem.uploadedData.file_path}
                              </code>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default MediaUploader