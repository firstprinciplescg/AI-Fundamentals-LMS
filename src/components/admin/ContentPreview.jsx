import React, { useState } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import {
  Eye,
  EyeOff,
  Monitor,
  Smartphone,
  Tablet,
  X,
  Settings,
  Clock,
  User,
  BookOpen,
  CheckCircle,
  Play
} from '../icons'
import MDEditor from '@uiw/react-md-editor'
import { useAuth } from '../../contexts/AuthContext'

const ContentPreview = ({
  content,
  contentType = 'lesson',
  onClose,
  showSettings = true
}) => {
  const { user } = useAuth()
  const [viewMode, setViewMode] = useState('student') // 'student' or 'instructor'
  const [deviceMode, setDeviceMode] = useState('desktop') // 'desktop', 'tablet', 'mobile'
  const [showMetadata, setShowMetadata] = useState(false)

  const getDeviceClass = () => {
    switch (deviceMode) {
      case 'mobile':
        return 'max-w-sm mx-auto'
      case 'tablet':
        return 'max-w-2xl mx-auto'
      default:
        return 'max-w-4xl mx-auto'
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatDuration = (minutes) => {
    if (minutes < 60) return `${minutes} min`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  const renderLessonPreview = () => (
    <div className="space-y-6">
      {/* Lesson Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <BookOpen className="w-6 h-6 text-blue-500" />
          <span className="text-sm font-medium text-blue-600 uppercase tracking-wide">
            Lesson
          </span>
        </div>

        <h1 className="text-3xl font-bold text-gray-900">
          {content.title || 'Untitled Lesson'}
        </h1>

        {content.description && (
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {content.description}
          </p>
        )}

        <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
          {content.estimated_duration && (
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{content.estimated_duration} minutes</span>
            </div>
          )}

          {content.difficulty_level && (
            <Badge
              className={
                content.difficulty_level === 'beginner'
                  ? 'bg-green-100 text-green-800'
                  : content.difficulty_level === 'intermediate'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }
            >
              {content.difficulty_level}
            </Badge>
          )}
        </div>
      </div>

      {/* Learning Objectives */}
      {content.learning_objectives && content.learning_objectives.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Learning Objectives</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {content.learning_objectives
                .filter(Boolean)
                .map((objective, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{objective}</span>
                  </li>
                ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Prerequisites */}
      {content.prerequisites && content.prerequisites.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Prerequisites</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {content.prerequisites
                .filter(Boolean)
                .map((prereq, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-5 h-5 border-2 border-gray-300 rounded mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{prereq}</span>
                  </li>
                ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Video */}
      {content.video_url && (
        <Card>
          <CardContent className="p-0">
            <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center space-y-2">
                <Play className="w-12 h-12 text-gray-400 mx-auto" />
                <p className="text-sm text-gray-500">Video Player</p>
                <p className="text-xs text-gray-400">{content.video_url}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Lesson Content</CardTitle>
        </CardHeader>
        <CardContent>
          {content.content ? (
            <div className="prose prose-lg max-w-none">
              <MDEditor.Markdown
                source={content.content}
                style={{ whiteSpace: 'pre-wrap' }}
              />
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p>No content available</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Student Actions */}
      {viewMode === 'student' && (
        <div className="flex justify-center space-x-4">
          <Button size="lg" className="px-8">
            Mark as Complete
          </Button>
          <Button variant="outline" size="lg">
            Take Notes
          </Button>
        </div>
      )}
    </div>
  )

  const renderModulePreview = () => (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">
          {content.title || 'Untitled Module'}
        </h1>

        {content.description && (
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {content.description}
          </p>
        )}

        <div className="flex items-center justify-center gap-2">
          {content.lessons_count && (
            <Badge className="bg-blue-100 text-blue-800">
              {content.lessons_count} Lessons
            </Badge>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Module Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            This module contains structured lessons designed to guide you through the learning material.
            Complete each lesson in order to master the concepts.
          </p>
        </CardContent>
      </Card>
    </div>
  )

  const renderCoursePreview = () => (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">
          {content.title || 'Untitled Course'}
        </h1>

        {content.subtitle && (
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {content.subtitle}
          </p>
        )}

        {content.description && (
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {content.description}
          </p>
        )}

        <div className="flex items-center justify-center gap-4">
          {content.total_modules && (
            <Badge className="bg-blue-100 text-blue-800">
              {content.total_modules} Modules
            </Badge>
          )}
          {content.total_lessons && (
            <Badge className="bg-green-100 text-green-800">
              {content.total_lessons} Lessons
            </Badge>
          )}
        </div>
      </div>

      {content.featured_image_url && (
        <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
          <img
            src={content.featured_image_url}
            alt={content.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Course Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            This course provides comprehensive coverage of the subject matter through
            structured modules and interactive lessons.
          </p>
        </CardContent>
      </Card>
    </div>
  )

  const renderContent = () => {
    switch (contentType) {
      case 'lesson':
        return renderLessonPreview()
      case 'module':
        return renderModulePreview()
      case 'course':
        return renderCoursePreview()
      default:
        return renderLessonPreview()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Preview Header */}
      <div className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Eye className="w-5 h-5 text-blue-500" />
              <div>
                <h2 className="font-semibold text-gray-900">Content Preview</h2>
                <p className="text-sm text-gray-500">
                  {content.status === 'published' ? 'Published' : 'Draft'} •
                  Last updated {formatDate(content.updated_at || new Date())}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {showSettings && (
                <>
                  {/* View Mode Toggle */}
                  <div className="flex items-center border rounded-md">
                    <Button
                      variant={viewMode === 'student' ? 'secondary' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('student')}
                    >
                      <User className="w-4 h-4 mr-1" />
                      Student
                    </Button>
                    <Button
                      variant={viewMode === 'instructor' ? 'secondary' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('instructor')}
                    >
                      <Settings className="w-4 h-4 mr-1" />
                      Instructor
                    </Button>
                  </div>

                  {/* Device Mode */}
                  <div className="flex items-center border rounded-md">
                    <Button
                      variant={deviceMode === 'desktop' ? 'secondary' : 'ghost'}
                      size="sm"
                      onClick={() => setDeviceMode('desktop')}
                    >
                      <Monitor className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={deviceMode === 'tablet' ? 'secondary' : 'ghost'}
                      size="sm"
                      onClick={() => setDeviceMode('tablet')}
                    >
                      <Tablet className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={deviceMode === 'mobile' ? 'secondary' : 'ghost'}
                      size="sm"
                      onClick={() => setDeviceMode('mobile')}
                    >
                      <Smartphone className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Metadata Toggle */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowMetadata(!showMetadata)}
                  >
                    {showMetadata ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </>
              )}

              <Button variant="outline" onClick={onClose}>
                <X className="w-4 h-4 mr-1" />
                Close
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Content */}
      <div className={`py-8 px-4 ${getDeviceClass()}`}>
        {showMetadata && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Content Metadata</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Status:</span>
                  <Badge
                    className={
                      content.status === 'published'
                        ? 'bg-green-100 text-green-800 ml-2'
                        : content.status === 'draft'
                        ? 'bg-yellow-100 text-yellow-800 ml-2'
                        : 'bg-gray-100 text-gray-800 ml-2'
                    }
                  >
                    {content.status}
                  </Badge>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Version:</span>
                  <span className="ml-2">{content.version || 1}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Created:</span>
                  <span className="ml-2">{formatDate(content.created_at)}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Updated:</span>
                  <span className="ml-2">{formatDate(content.updated_at)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="bg-white rounded-lg shadow-sm min-h-screen p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  )
}

export default ContentPreview