import React, { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import {
  Search,
  Filter,
  Grid,
  List,
  Image,
  Video,
  FileText,
  Download,
  Eye,
  Trash2,
  Copy,
  Edit,
  MoreHorizontal,
  Calendar,
  User,
  HardDrive,
  X,
  Check,
  AlertCircle,
  Loader2,
  Upload
} from '../icons'
import { cms, supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import MediaUploader from './MediaUploader'

const MediaLibrary = ({
  selectionMode = false,
  allowMultiple = true,
  onSelect,
  onCancel,
  filter = null // 'images', 'videos', 'documents'
}) => {
  const { user } = useAuth()
  const [media, setMedia] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'
  const [selectedItems, setSelectedItems] = useState(new Set())
  const [showUploader, setShowUploader] = useState(false)
  const [filterType, setFilterType] = useState(filter || 'all')
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState('desc')

  useEffect(() => {
    loadMedia()
  }, [])

  const loadMedia = async () => {
    setLoading(true)
    try {
      const { data, error } = await cms.media.getAll()
      if (error) throw error
      setMedia(data || [])
    } catch (error) {
      console.error('Error loading media:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUploadComplete = (uploadedFiles) => {
    setMedia(prev => [...uploadedFiles, ...prev])
    setShowUploader(false)
  }

  const handleDelete = async (mediaId) => {
    if (!confirm('Are you sure you want to delete this file? This action cannot be undone.')) {
      return
    }

    try {
      const { error } = await cms.media.delete(mediaId)
      if (error) throw error

      setMedia(prev => prev.filter(item => item.id !== mediaId))
      setSelectedItems(prev => {
        const newSet = new Set(prev)
        newSet.delete(mediaId)
        return newSet
      })
    } catch (error) {
      console.error('Error deleting media:', error)
      alert('Error deleting file: ' + error.message)
    }
  }

  const handleSelect = (mediaItem) => {
    if (!selectionMode) return

    if (allowMultiple) {
      setSelectedItems(prev => {
        const newSet = new Set(prev)
        if (newSet.has(mediaItem.id)) {
          newSet.delete(mediaItem.id)
        } else {
          newSet.add(mediaItem.id)
        }
        return newSet
      })
    } else {
      onSelect?.(mediaItem)
    }
  }

  const handleConfirmSelection = () => {
    const selectedMedia = media.filter(item => selectedItems.has(item.id))
    onSelect?.(allowMultiple ? selectedMedia : selectedMedia[0])
  }

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      // Could add a toast notification here
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const getFileIcon = (mimeType) => {
    if (mimeType?.startsWith('image/')) return Image
    if (mimeType?.startsWith('video/')) return Video
    return FileText
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getPublicUrl = (filePath) => {
    const { data } = supabase.storage.from('media').getPublicUrl(filePath)
    return data.publicUrl
  }

  const filteredMedia = media
    .filter(item => {
      // Text search
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        return (
          item.original_filename?.toLowerCase().includes(searchLower) ||
          item.alt_text?.toLowerCase().includes(searchLower) ||
          item.caption?.toLowerCase().includes(searchLower)
        )
      }
      return true
    })
    .filter(item => {
      // Type filter
      switch (filterType) {
        case 'images':
          return item.mime_type?.startsWith('image/')
        case 'videos':
          return item.mime_type?.startsWith('video/')
        case 'documents':
          return !item.mime_type?.startsWith('image/') && !item.mime_type?.startsWith('video/')
        default:
          return true
      }
    })
    .sort((a, b) => {
      let aValue = a[sortBy]
      let bValue = b[sortBy]

      if (sortBy === 'created_at' || sortBy === 'updated_at') {
        aValue = new Date(aValue)
        bValue = new Date(bValue)
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
      return 0
    })

  const renderGridView = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
      {filteredMedia.map((item) => {
        const Icon = getFileIcon(item.mime_type)
        const isSelected = selectedItems.has(item.id)
        const publicUrl = getPublicUrl(item.file_path)

        return (
          <Card
            key={item.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              isSelected ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => handleSelect(item)}
          >
            <CardContent className="p-3">
              <div className="aspect-square mb-3 bg-gray-100 rounded-lg overflow-hidden relative">
                {item.mime_type?.startsWith('image/') ? (
                  <img
                    src={publicUrl}
                    alt={item.alt_text || item.original_filename}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Icon className="w-8 h-8 text-gray-400" />
                  </div>
                )}

                {selectionMode && (
                  <div className="absolute top-2 left-2">
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        isSelected
                          ? 'bg-blue-500 border-blue-500'
                          : 'bg-white border-gray-300'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {item.original_filename}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(item.file_size)}
                </p>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )

  const renderListView = () => (
    <div className="space-y-2">
      {filteredMedia.map((item) => {
        const Icon = getFileIcon(item.mime_type)
        const isSelected = selectedItems.has(item.id)
        const publicUrl = getPublicUrl(item.file_path)

        return (
          <Card
            key={item.id}
            className={`cursor-pointer transition-all hover:shadow-sm ${
              isSelected ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => handleSelect(item)}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                {selectionMode && (
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                      isSelected
                        ? 'bg-blue-500 border-blue-500'
                        : 'bg-white border-gray-300'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                  </div>
                )}

                <div className="flex-shrink-0">
                  {item.mime_type?.startsWith('image/') ? (
                    <img
                      src={publicUrl}
                      alt={item.alt_text || item.original_filename}
                      className="w-12 h-12 object-cover rounded"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                      <Icon className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {item.original_filename}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{formatFileSize(item.file_size)}</span>
                    <span>{new Date(item.created_at).toLocaleDateString()}</span>
                    <span>{item.mime_type}</span>
                  </div>
                  {item.alt_text && (
                    <p className="text-sm text-gray-600 truncate mt-1">
                      {item.alt_text}
                    </p>
                  )}
                </div>

                {!selectionMode && (
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        copyToClipboard(publicUrl)
                      }}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        window.open(publicUrl, '_blank')
                      }}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(item.id)
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )

  if (showUploader) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Upload Media</h2>
          <Button
            variant="outline"
            onClick={() => setShowUploader(false)}
          >
            <X className="w-4 h-4 mr-2" />
            Back to Library
          </Button>
        </div>
        <MediaUploader
          onUploadComplete={handleUploadComplete}
          context="general"
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Media Library</h2>
          <p className="text-gray-600">
            {filteredMedia.length} of {media.length} files
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selectionMode && (
            <>
              <Button
                variant="outline"
                onClick={onCancel}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmSelection}
                disabled={selectedItems.size === 0}
              >
                Select ({selectedItems.size})
              </Button>
            </>
          )}
          {!selectionMode && (
            <Button onClick={() => setShowUploader(true)}>
              <Upload className="w-4 h-4 mr-2" />
              Upload Files
            </Button>
          )}
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="all">All Files</option>
          <option value="images">Images</option>
          <option value="videos">Videos</option>
          <option value="documents">Documents</option>
        </select>

        <select
          value={`${sortBy}-${sortOrder}`}
          onChange={(e) => {
            const [field, order] = e.target.value.split('-')
            setSortBy(field)
            setSortOrder(order)
          }}
          className="px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="created_at-desc">Newest First</option>
          <option value="created_at-asc">Oldest First</option>
          <option value="original_filename-asc">Name A-Z</option>
          <option value="original_filename-desc">Name Z-A</option>
          <option value="file_size-desc">Largest First</option>
          <option value="file_size-asc">Smallest First</option>
        </select>

        <div className="flex items-center border rounded-md">
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : filteredMedia.length === 0 ? (
        <div className="text-center py-12">
          <Image className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {media.length === 0 ? 'No media files' : 'No files match your search'}
          </h3>
          <p className="text-gray-500 mb-4">
            {media.length === 0
              ? 'Upload your first media file to get started.'
              : 'Try adjusting your search or filter criteria.'
            }
          </p>
          {media.length === 0 && !selectionMode && (
            <Button onClick={() => setShowUploader(true)}>
              <Upload className="w-4 h-4 mr-2" />
              Upload Files
            </Button>
          )}
        </div>
      ) : (
        <div>
          {viewMode === 'grid' ? renderGridView() : renderListView()}
        </div>
      )}
    </div>
  )
}

export default MediaLibrary