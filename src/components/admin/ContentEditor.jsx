import React, { useState, useEffect } from 'react'
import MDEditor from '@uiw/react-md-editor'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Badge } from '../ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import {
  Save,
  Eye,
  Upload,
  X,
  Plus,
  AlertCircle,
  CheckCircle,
  Clock,
  Trash2,
  RotateCcw,
  Send
} from '../icons'
import { useAuth } from '../../contexts/AuthContext'
import { cms } from '../../lib/supabase'
import { lessonCache } from '../../lib/contentCache'
import MediaLibrary from './MediaLibrary'
import VersionHistory from './VersionHistory'
import ContentPreview from './ContentPreview'
import PublishingWorkflow from './PublishingWorkflow'

const ContentEditor = ({
  type = 'lesson', // 'lesson', 'module', 'course'
  contentId = null, // null for new content
  initialData = null,
  onSave,
  onCancel,
  onDelete
}) => {
  const { user } = useAuth()
  const [content, setContent] = useState({
    title: '',
    slug: '',
    description: '',
    content: '',
    status: 'draft',
    order_index: 0,
    difficulty_level: 'beginner',
    estimated_duration: 30,
    learning_objectives: [],
    prerequisites: [],
    tags: [],
    featured_image_url: '',
    video_url: '',
    // Module-specific
    color: 'bg-blue-500',
    icon_name: 'BookOpen',
    // Course-specific
    subtitle: '',
    total_lessons: 0,
    total_modules: 0
  })

  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState(null) // 'saving', 'saved', 'error'
  const [validationErrors, setValidationErrors] = useState({})
  const [isDirty, setIsDirty] = useState(false)
  const [activeTab, setActiveTab] = useState('content')
  const [previewMode, setPreviewMode] = useState(false)
  const [showVersions, setShowVersions] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [showPublishWorkflow, setShowPublishWorkflow] = useState(false)

  // Auto-save functionality
  const [autoSaveTimeout, setAutoSaveTimeout] = useState(null)

  useEffect(() => {
    if (initialData) {
      setContent({ ...content, ...initialData })
    }
  }, [initialData])

  useEffect(() => {
    // Auto-save after 3 seconds of inactivity
    if (isDirty && contentId) {
      if (autoSaveTimeout) clearTimeout(autoSaveTimeout)

      const timeout = setTimeout(() => {
        handleAutoSave()
      }, 3000)

      setAutoSaveTimeout(timeout)
    }

    return () => {
      if (autoSaveTimeout) clearTimeout(autoSaveTimeout)
    }
  }, [content, isDirty])

  const handleInputChange = (field, value) => {
    setContent(prev => ({ ...prev, [field]: value }))
    setIsDirty(true)

    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: null }))
    }

    // Auto-generate slug from title
    if (field === 'title') {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
      setContent(prev => ({ ...prev, slug }))
    }
  }

  const handleArrayChange = (field, index, value) => {
    setContent(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }))
    setIsDirty(true)
  }

  const handleArrayAdd = (field) => {
    setContent(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }))
    setIsDirty(true)
  }

  const handleArrayRemove = (field, index) => {
    setContent(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }))
    setIsDirty(true)
  }

  const validateContent = () => {
    const errors = {}

    if (!content.title.trim()) {
      errors.title = 'Title is required'
    }

    if (!content.slug.trim()) {
      errors.slug = 'Slug is required'
    } else if (!/^[a-z0-9-]+$/.test(content.slug)) {
      errors.slug = 'Slug must contain only lowercase letters, numbers, and hyphens'
    }

    if (type === 'lesson' && !content.content.trim()) {
      errors.content = 'Content is required for lessons'
    }

    if (content.estimated_duration < 1) {
      errors.estimated_duration = 'Duration must be at least 1 minute'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleAutoSave = async () => {
    if (!contentId || !validateContent()) return

    setSaveStatus('saving')
    try {
      const saveData = {
        ...content,
        learning_objectives: content.learning_objectives.filter(Boolean),
        prerequisites: content.prerequisites.filter(Boolean),
        tags: content.tags.filter(Boolean),
        updated_by: user?.id
      }

      let result
      switch (type) {
        case 'lesson':
          result = await cms.lessons.update(contentId, saveData)
          // Update cache
          if (result.data) {
            lessonCache.set(contentId, result.data[0])
          }
          break
        case 'module':
          result = await cms.modules.update(contentId, saveData)
          break
        case 'course':
          result = await cms.courses.update(contentId, saveData)
          break
        default:
          throw new Error('Invalid content type')
      }

      if (result.error) throw result.error

      setSaveStatus('saved')
      setIsDirty(false)
      setTimeout(() => setSaveStatus(null), 2000)
    } catch (error) {
      console.error('Auto-save error:', error)
      setSaveStatus('error')
      setTimeout(() => setSaveStatus(null), 3000)
    }
  }

  const handleSave = async (publishNow = false) => {
    if (!validateContent()) return

    setSaving(true)
    try {
      const saveData = {
        ...content,
        status: publishNow ? 'published' : content.status,
        learning_objectives: content.learning_objectives.filter(Boolean),
        prerequisites: content.prerequisites.filter(Boolean),
        tags: content.tags.filter(Boolean),
        [contentId ? 'updated_by' : 'created_by']: user?.id,
        ...(publishNow && { published_at: new Date().toISOString() })
      }

      let result
      if (contentId) {
        // Update existing content
        switch (type) {
          case 'lesson':
            result = await cms.lessons.update(contentId, saveData)
            break
          case 'module':
            result = await cms.modules.update(contentId, saveData)
            break
          case 'course':
            result = await cms.courses.update(contentId, saveData)
            break
        }
      } else {
        // Create new content
        switch (type) {
          case 'lesson':
            result = await cms.lessons.create(saveData)
            break
          case 'module':
            result = await cms.modules.create(saveData)
            break
          case 'course':
            result = await cms.courses.create(saveData)
            break
        }
      }

      if (result.error) throw result.error

      // Clear cache for this content type
      if (type === 'lesson' && result.data) {
        lessonCache.set(result.data[0].id, result.data[0])
      }

      setIsDirty(false)
      onSave?.(result.data[0], publishNow)
    } catch (error) {
      console.error('Save error:', error)
      // Handle error (show toast, etc.)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!contentId || !onDelete) return

    if (!confirm('Are you sure you want to delete this content? This action cannot be undone.')) {
      return
    }

    try {
      let result
      switch (type) {
        case 'lesson':
          result = await cms.lessons.delete(contentId)
          lessonCache.remove(contentId)
          break
        case 'module':
          result = await cms.modules.delete(contentId)
          break
        case 'course':
          result = await cms.courses.delete(contentId)
          break
      }

      if (result.error) throw result.error

      onDelete(contentId)
    } catch (error) {
      console.error('Delete error:', error)
    }
  }

  const renderBasicFields = () => (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Title *</label>
        <Input
          value={content.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          className={validationErrors.title ? 'border-red-500' : ''}
        />
        {validationErrors.title && (
          <p className="text-sm text-red-600 mt-1">{validationErrors.title}</p>
        )}
      </div>

      <div>
        <label className="text-sm font-medium">Slug *</label>
        <Input
          value={content.slug}
          onChange={(e) => handleInputChange('slug', e.target.value)}
          className={validationErrors.slug ? 'border-red-500' : ''}
          placeholder="auto-generated-from-title"
        />
        {validationErrors.slug && (
          <p className="text-sm text-red-600 mt-1">{validationErrors.slug}</p>
        )}
      </div>

      <div>
        <label className="text-sm font-medium">Description</label>
        <Textarea
          value={content.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Status</label>
          <Select value={content.status} onValueChange={(value) => handleInputChange('status', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium">Order Index</label>
          <Input
            type="number"
            value={content.order_index}
            onChange={(e) => handleInputChange('order_index', parseInt(e.target.value) || 0)}
            min="0"
          />
        </div>
      </div>
    </div>
  )

  const renderContentEditor = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Content *</label>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPreviewMode(!previewMode)}
        >
          <Eye className="w-4 h-4 mr-1" />
          {previewMode ? 'Edit' : 'Preview'}
        </Button>
      </div>

      <div className="min-h-[400px]">
        <MDEditor
          value={content.content}
          onChange={(value) => handleInputChange('content', value || '')}
          preview={previewMode ? 'preview' : 'edit'}
          hideToolbar={previewMode}
          data-color-mode="light"
        />
      </div>

      {validationErrors.content && (
        <p className="text-sm text-red-600">{validationErrors.content}</p>
      )}
    </div>
  )

  const renderMetadataFields = () => (
    <div className="space-y-6">
      {type === 'lesson' && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Difficulty Level</label>
              <Select value={content.difficulty_level} onValueChange={(value) => handleInputChange('difficulty_level', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Estimated Duration (minutes)</label>
              <Input
                type="number"
                value={content.estimated_duration}
                onChange={(e) => handleInputChange('estimated_duration', parseInt(e.target.value) || 0)}
                min="1"
                className={validationErrors.estimated_duration ? 'border-red-500' : ''}
              />
              {validationErrors.estimated_duration && (
                <p className="text-sm text-red-600 mt-1">{validationErrors.estimated_duration}</p>
              )}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Learning Objectives</label>
            {content.learning_objectives.map((objective, index) => (
              <div key={index} className="flex gap-2 mt-2">
                <Input
                  value={objective}
                  onChange={(e) => handleArrayChange('learning_objectives', index, e.target.value)}
                  placeholder={`Learning objective ${index + 1}`}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleArrayRemove('learning_objectives', index)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleArrayAdd('learning_objectives')}
              className="mt-2"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Objective
            </Button>
          </div>

          <div>
            <label className="text-sm font-medium">Prerequisites</label>
            {content.prerequisites.map((prereq, index) => (
              <div key={index} className="flex gap-2 mt-2">
                <Input
                  value={prereq}
                  onChange={(e) => handleArrayChange('prerequisites', index, e.target.value)}
                  placeholder={`Prerequisite ${index + 1}`}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleArrayRemove('prerequisites', index)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleArrayAdd('prerequisites')}
              className="mt-2"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Prerequisite
            </Button>
          </div>
        </>
      )}

      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="text-sm font-medium">Featured Image URL</label>
          <Input
            value={content.featured_image_url}
            onChange={(e) => handleInputChange('featured_image_url', e.target.value)}
            placeholder="https://example.com/image.jpg"
          />
        </div>

        {type === 'lesson' && (
          <div>
            <label className="text-sm font-medium">Video URL</label>
            <Input
              value={content.video_url}
              onChange={(e) => handleInputChange('video_url', e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
            />
          </div>
        )}
      </div>
    </div>
  )

  const renderSaveStatus = () => {
    if (!saveStatus) return null

    const statusConfig = {
      saving: { icon: Clock, text: 'Auto-saving...', color: 'text-blue-600' },
      saved: { icon: CheckCircle, text: 'Auto-saved', color: 'text-green-600' },
      error: { icon: AlertCircle, text: 'Save failed', color: 'text-red-600' }
    }

    const { icon: Icon, text, color } = statusConfig[saveStatus]

    return (
      <div className={`flex items-center gap-1 text-sm ${color}`}>
        <Icon className="w-4 h-4" />
        <span>{text}</span>
      </div>
    )
  }

  if (showVersions) {
    return (
      <VersionHistory
        contentType={type}
        contentId={contentId}
        currentContent={content}
        onClose={() => setShowVersions(false)}
        onRestore={(restoredContent) => {
          setContent(prev => ({ ...prev, ...restoredContent }))
          setIsDirty(true)
          setShowVersions(false)
        }}
      />
    )
  }

  if (showPreview) {
    return (
      <ContentPreview
        content={content}
        contentType={type}
        onClose={() => setShowPreview(false)}
      />
    )
  }

  if (showPublishWorkflow) {
    return (
      <PublishingWorkflow
        content={content}
        contentType={type}
        onPublish={(publishedContent, isScheduled) => {
          setContent(prev => ({ ...prev, ...publishedContent }))
          setIsDirty(false)
          onSave?.(publishedContent, !isScheduled)
        }}
        onSchedule={(scheduledContent, scheduledDate) => {
          setContent(prev => ({ ...prev, ...scheduledContent }))
          setIsDirty(false)
          onSave?.(scheduledContent, false)
        }}
        onClose={() => setShowPublishWorkflow(false)}
      />
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                {contentId ? `Edit ${type}` : `Create New ${type}`}
              </CardTitle>
              <CardDescription>
                {contentId ? `Editing: ${content.title || 'Untitled'}` : `Create a new ${type}`}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {contentId && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPreview(true)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Preview
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowVersions(true)}
                  >
                    <RotateCcw className="w-4 h-4 mr-1" />
                    History
                  </Button>
                </>
              )}
              {renderSaveStatus()}
              {isDirty && <Badge variant="outline">Unsaved changes</Badge>}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="metadata">Metadata</TabsTrigger>
              {type === 'lesson' && <TabsTrigger value="media">Media</TabsTrigger>}
            </TabsList>

            <TabsContent value="content" className="space-y-6">
              {renderBasicFields()}
              {type === 'lesson' && renderContentEditor()}
            </TabsContent>

            <TabsContent value="metadata">
              {renderMetadataFields()}
            </TabsContent>

            {type === 'lesson' && (
              <TabsContent value="media">
                <MediaLibrary
                  selectionMode={true}
                  allowMultiple={true}
                  filter="images"
                  onSelect={(selectedMedia) => {
                    // Handle media selection for lesson content
                    console.log('Selected media:', selectedMedia)
                  }}
                  onCancel={() => {
                    // Handle cancel
                    setActiveTab('content')
                  }}
                />
              </TabsContent>
            )}
          </Tabs>

          <div className="flex items-center justify-between pt-6 border-t">
            <div className="flex gap-2">
              {contentId && onDelete && (
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  size="sm"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              )}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button
                onClick={() => handleSave(false)}
                disabled={saving}
              >
                <Save className="w-4 h-4 mr-1" />
                {saving ? 'Saving...' : 'Save Draft'}
              </Button>
              {contentId && (
                <Button
                  onClick={() => setShowPublishWorkflow(true)}
                  disabled={saving}
                >
                  <Send className="w-4 h-4 mr-1" />
                  Publish
                </Button>
              )}
              {!contentId && (
                <Button
                  onClick={() => handleSave(true)}
                  disabled={saving}
                >
                  {saving ? 'Publishing...' : 'Save & Publish'}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ContentEditor