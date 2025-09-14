import React, { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import {
  History,
  RotateCcw,
  Eye,
  User,
  Calendar,
  GitBranch,
  ArrowLeft,
  ArrowRight,
  X,
  CheckCircle,
  AlertTriangle,
  Loader2
} from '../icons'
import { cms } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import MDEditor from '@uiw/react-md-editor'

const VersionHistory = ({
  contentType = 'lesson',
  contentId,
  currentContent,
  onClose,
  onRestore
}) => {
  const { user } = useAuth()
  const [versions, setVersions] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedVersions, setSelectedVersions] = useState([null, null]) // [left, right] for comparison
  const [restoring, setRestoring] = useState(false)
  const [compareMode, setCompareMode] = useState(false)

  useEffect(() => {
    if (contentId) {
      loadVersions()
    }
  }, [contentId])

  const loadVersions = async () => {
    setLoading(true)
    try {
      const { data, error } = await cms.versions.getByLesson(contentId)
      if (error) throw error

      // Add current version as the first item
      const allVersions = [
        {
          id: 'current',
          version_number: (currentContent.version || 1),
          title: currentContent.title,
          content: currentContent.content,
          description: currentContent.description,
          created_at: currentContent.updated_at || new Date().toISOString(),
          created_by: user?.id,
          change_summary: 'Current version',
          is_current: true
        },
        ...(data || [])
      ]

      setVersions(allVersions)
    } catch (error) {
      console.error('Error loading versions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRestore = async (versionNumber) => {
    if (!confirm(`Are you sure you want to restore to version ${versionNumber}? This will create a new version with the restored content.`)) {
      return
    }

    setRestoring(true)
    try {
      const { data, error } = await cms.versions.restore(contentId, versionNumber)
      if (error) throw error

      onRestore?.(data[0])
      onClose?.()
    } catch (error) {
      console.error('Error restoring version:', error)
      alert('Error restoring version: ' + error.message)
    } finally {
      setRestoring(false)
    }
  }

  const handleVersionSelect = (version, position) => {
    if (!compareMode) return

    setSelectedVersions(prev => {
      const newSelection = [...prev]
      newSelection[position] = version
      return newSelection
    })
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString()
  }

  const renderVersionCard = (version, index) => {
    const isSelected = selectedVersions.includes(version)
    const selectionPosition = selectedVersions.indexOf(version)

    return (
      <Card
        key={version.id}
        className={`cursor-pointer transition-all ${
          isSelected ? 'ring-2 ring-blue-500' : 'hover:shadow-md'
        } ${compareMode ? 'cursor-pointer' : ''}`}
        onClick={() => compareMode && handleVersionSelect(version, selectedVersions[0] ? 1 : 0)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <GitBranch className="w-5 h-5 text-blue-500" />
                {version.is_current && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"></div>
                )}
              </div>
              <div>
                <CardTitle className="text-lg">
                  Version {version.version_number}
                  {version.is_current && (
                    <Badge className="ml-2 bg-green-100 text-green-800">
                      Current
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription className="text-sm">
                  {formatDate(version.created_at)}
                </CardDescription>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {compareMode && (
                <div className="flex items-center gap-1">
                  {selectionPosition === 0 && (
                    <Badge className="bg-blue-100 text-blue-800">A</Badge>
                  )}
                  {selectionPosition === 1 && (
                    <Badge className="bg-orange-100 text-orange-800">B</Badge>
                  )}
                </div>
              )}

              {!version.is_current && !compareMode && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRestore(version.version_number)
                  }}
                  disabled={restoring}
                >
                  {restoring ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RotateCcw className="w-4 h-4" />
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-3">
            {version.change_summary && (
              <p className="text-sm text-gray-600">
                <strong>Changes:</strong> {version.change_summary}
              </p>
            )}

            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Title</p>
              <p className="text-sm text-gray-900">{version.title}</p>
            </div>

            {version.description && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Description</p>
                <p className="text-sm text-gray-600 line-clamp-2">{version.description}</p>
              </div>
            )}

            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">Content Preview</p>
              <div className="text-sm text-gray-600 line-clamp-3 font-mono bg-gray-50 p-2 rounded">
                {version.content?.substring(0, 150)}
                {version.content?.length > 150 && '...'}
              </div>
            </div>

            {version.created_by && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <User className="w-4 h-4" />
                <span>Modified by User</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderComparison = () => {
    const [leftVersion, rightVersion] = selectedVersions

    if (!leftVersion || !rightVersion) {
      return (
        <div className="text-center py-12 text-gray-500">
          <GitBranch className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Select Two Versions to Compare
          </h3>
          <p>Click on two different versions to see their differences.</p>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-100 text-blue-800">A</Badge>
              <span className="font-medium">Version {leftVersion.version_number}</span>
              <span className="text-sm text-gray-500">
                {formatDate(leftVersion.created_at)}
              </span>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400" />
            <div className="flex items-center gap-2">
              <Badge className="bg-orange-100 text-orange-800">B</Badge>
              <span className="font-medium">Version {rightVersion.version_number}</span>
              <span className="text-sm text-gray-500">
                {formatDate(rightVersion.created_at)}
              </span>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => setSelectedVersions([null, null])}
          >
            Clear Selection
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Version A */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge className="bg-blue-100 text-blue-800">A</Badge>
                Version {leftVersion.version_number}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Title</p>
                  <p className="text-sm">{leftVersion.title}</p>
                </div>
                {leftVersion.description && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Description</p>
                    <p className="text-sm text-gray-600">{leftVersion.description}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Content</p>
                  <div className="max-h-96 overflow-y-auto">
                    <MDEditor.Markdown
                      source={leftVersion.content}
                      style={{ whiteSpace: 'pre-wrap' }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Version B */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge className="bg-orange-100 text-orange-800">B</Badge>
                Version {rightVersion.version_number}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Title</p>
                  <p className="text-sm">{rightVersion.title}</p>
                </div>
                {rightVersion.description && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Description</p>
                    <p className="text-sm text-gray-600">{rightVersion.description}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Content</p>
                  <div className="max-h-96 overflow-y-auto">
                    <MDEditor.Markdown
                      source={rightVersion.content}
                      style={{ whiteSpace: 'pre-wrap' }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Version History</h1>
          <p className="text-gray-600">
            {versions.length} versions • {contentType} content
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setCompareMode(!compareMode)}
          >
            <GitBranch className="w-4 h-4 mr-2" />
            {compareMode ? 'Exit Compare' : 'Compare Versions'}
          </Button>
          <Button variant="outline" onClick={onClose}>
            <X className="w-4 h-4 mr-2" />
            Close
          </Button>
        </div>
      </div>

      {compareMode ? (
        <Tabs defaultValue="compare" className="space-y-6">
          <TabsList>
            <TabsTrigger value="compare">Comparison</TabsTrigger>
            <TabsTrigger value="versions">All Versions</TabsTrigger>
          </TabsList>

          <TabsContent value="compare">
            {renderComparison()}
          </TabsContent>

          <TabsContent value="versions">
            <div className="space-y-4">
              {versions.map((version, index) => renderVersionCard(version, index))}
            </div>
          </TabsContent>
        </Tabs>
      ) : (
        <div className="space-y-4">
          {versions.map((version, index) => renderVersionCard(version, index))}

          {versions.length === 1 && (
            <div className="text-center py-8 text-gray-500">
              <History className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p>No previous versions available.</p>
              <p className="text-sm">Version history will appear here after you make changes.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default VersionHistory