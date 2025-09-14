import React, { useState } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import {
  Send,
  Clock,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Calendar,
  Users,
  MessageSquare,
  X,
  Loader2
} from '../icons'
import ContentValidator from './ContentValidator'
import { cms } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

const PublishingWorkflow = ({
  content,
  contentType,
  onPublish,
  onSchedule,
  onClose
}) => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('validate')
  const [validationResults, setValidationResults] = useState(null)
  const [publishing, setPublishing] = useState(false)
  const [scheduling, setScheduling] = useState(false)
  const [scheduleDate, setScheduleDate] = useState('')
  const [scheduleTime, setScheduleTime] = useState('')
  const [publishNotes, setPublishNotes] = useState('')

  const handleValidationComplete = (results) => {
    setValidationResults(results)
    if (results.canPublish) {
      setActiveTab('publish')
    }
  }

  const handlePublishNow = async () => {
    if (!validationResults?.canPublish) return

    setPublishing(true)
    try {
      const publishData = {
        ...content,
        status: 'published',
        published_at: new Date().toISOString(),
        publish_notes: publishNotes || undefined
      }

      let result
      switch (contentType) {
        case 'lesson':
          result = await cms.lessons.update(content.id, publishData)
          break
        case 'module':
          result = await cms.modules.update(content.id, publishData)
          break
        case 'course':
          result = await cms.courses.update(content.id, publishData)
          break
        default:
          throw new Error('Invalid content type')
      }

      if (result.error) throw result.error

      onPublish?.(result.data[0], false) // false = not scheduled
      onClose?.()
    } catch (error) {
      console.error('Publishing error:', error)
      alert('Error publishing content: ' + error.message)
    } finally {
      setPublishing(false)
    }
  }

  const handleSchedulePublish = async () => {
    if (!validationResults?.canPublish || !scheduleDate || !scheduleTime) return

    setScheduling(true)
    try {
      const scheduledDateTime = new Date(`${scheduleDate}T${scheduleTime}`)

      if (scheduledDateTime <= new Date()) {
        alert('Scheduled time must be in the future')
        return
      }

      const scheduleData = {
        ...content,
        status: 'scheduled',
        scheduled_publish_at: scheduledDateTime.toISOString(),
        publish_notes: publishNotes || undefined
      }

      let result
      switch (contentType) {
        case 'lesson':
          result = await cms.lessons.update(content.id, scheduleData)
          break
        case 'module':
          result = await cms.modules.update(content.id, scheduleData)
          break
        case 'course':
          result = await cms.courses.update(content.id, scheduleData)
          break
        default:
          throw new Error('Invalid content type')
      }

      if (result.error) throw result.error

      onSchedule?.(result.data[0], scheduledDateTime)
      onClose?.()
    } catch (error) {
      console.error('Scheduling error:', error)
      alert('Error scheduling content: ' + error.message)
    } finally {
      setScheduling(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800'
      case 'scheduled': return 'bg-blue-100 text-blue-800'
      case 'draft': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString()
  }

  const renderValidationTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Content Validation</h3>
        <p className="text-gray-600 text-sm mb-4">
          We'll check your content for common issues and best practices before publishing.
        </p>
      </div>

      <ContentValidator
        content={content}
        contentType={contentType}
        onValidationComplete={handleValidationComplete}
        showDialog={false}
      />

      {validationResults && (
        <div className="flex justify-end">
          <Button
            onClick={() => setActiveTab('publish')}
            disabled={!validationResults.canPublish}
          >
            {validationResults.canPublish ? 'Continue to Publishing' : 'Fix Issues First'}
          </Button>
        </div>
      )}
    </div>
  )

  const renderPublishTab = () => (
    <div className="space-y-6">
      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Current Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge className={getStatusColor(content.status)}>
                {content.status || 'draft'}
              </Badge>
              <span className="text-gray-600">
                {content.published_at
                  ? `Published ${formatDate(content.published_at)}`
                  : content.scheduled_publish_at
                  ? `Scheduled for ${formatDate(content.scheduled_publish_at)}`
                  : 'Not published'
                }
              </span>
            </div>
            <div className="text-sm text-gray-500">
              Version {content.version || 1}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Publishing Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Publish Now */}
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Send className="w-5 h-5 text-green-500" />
              Publish Now
            </CardTitle>
            <CardDescription>
              Make this content live immediately for all users
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Publishing Notes (Optional)
                </label>
                <textarea
                  value={publishNotes}
                  onChange={(e) => setPublishNotes(e.target.value)}
                  placeholder="Add any notes about this publication..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none"
                  rows={3}
                />
              </div>
              <Button
                onClick={handlePublishNow}
                disabled={publishing || !validationResults?.canPublish}
                className="w-full"
              >
                {publishing ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                {publishing ? 'Publishing...' : 'Publish Now'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Schedule Publishing */}
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="w-5 h-5 text-blue-500" />
              Schedule Publishing
            </CardTitle>
            <CardDescription>
              Set a future date and time for automatic publishing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Date
                  </label>
                  <input
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Time
                  </label>
                  <input
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
              </div>
              <Button
                onClick={handleSchedulePublish}
                disabled={scheduling || !scheduleDate || !scheduleTime || !validationResults?.canPublish}
                className="w-full"
                variant="outline"
              >
                {scheduling ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Calendar className="w-4 h-4 mr-2" />
                )}
                {scheduling ? 'Scheduling...' : 'Schedule Publish'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Publishing Impact */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Publishing Impact</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Visibility</p>
                <p className="text-gray-600">
                  This content will be visible to all enrolled students immediately after publishing
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Eye className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Search & Discovery</p>
                <p className="text-gray-600">
                  Published content will appear in search results and course navigation
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MessageSquare className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Notifications</p>
                <p className="text-gray-600">
                  Students may receive notifications about new published content
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Publishing Workflow</h1>
          <p className="text-gray-600">
            {content.title || 'Untitled'} • {contentType}
          </p>
        </div>
        <Button variant="outline" onClick={onClose}>
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="validate" className="flex items-center gap-2">
            {validationResults?.canPublish ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : validationResults ? (
              <XCircle className="w-4 h-4 text-red-500" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-yellow-500" />
            )}
            Validate
          </TabsTrigger>
          <TabsTrigger
            value="publish"
            disabled={!validationResults?.canPublish}
            className="flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            Publish
          </TabsTrigger>
        </TabsList>

        <TabsContent value="validate">
          {renderValidationTab()}
        </TabsContent>

        <TabsContent value="publish">
          {renderPublishTab()}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default PublishingWorkflow