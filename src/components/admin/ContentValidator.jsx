import React, { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Clock,
  FileText,
  Image,
  Link,
  Users,
  Target,
  BookOpen,
  Play,
  X
} from '../icons'

const ContentValidator = ({
  content,
  contentType = 'lesson',
  onValidationComplete,
  showDialog = true
}) => {
  const [validationResults, setValidationResults] = useState(null)
  const [validating, setValidating] = useState(false)

  useEffect(() => {
    if (content) {
      validateContent()
    }
  }, [content, contentType])

  const validateContent = async () => {
    setValidating(true)

    // Simulate validation delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    const results = {
      score: 0,
      maxScore: 0,
      issues: [],
      warnings: [],
      suggestions: [],
      canPublish: true
    }

    // Common validations
    validateBasicFields(content, results)
    validateSEO(content, results)

    // Type-specific validations
    switch (contentType) {
      case 'lesson':
        validateLesson(content, results)
        break
      case 'module':
        validateModule(content, results)
        break
      case 'course':
        validateCourse(content, results)
        break
    }

    // Calculate final score
    results.score = Math.max(0, results.maxScore - results.issues.length * 2 - results.warnings.length)
    results.canPublish = results.issues.length === 0

    setValidationResults(results)
    onValidationComplete?.(results)
    setValidating(false)
  }

  const validateBasicFields = (content, results) => {
    results.maxScore += 10

    // Title validation
    if (!content.title?.trim()) {
      results.issues.push({
        type: 'error',
        field: 'title',
        message: 'Title is required',
        icon: FileText
      })
    } else if (content.title.length < 5) {
      results.warnings.push({
        type: 'warning',
        field: 'title',
        message: 'Title should be at least 5 characters long',
        icon: FileText
      })
    } else if (content.title.length > 100) {
      results.warnings.push({
        type: 'warning',
        field: 'title',
        message: 'Title is very long (over 100 characters)',
        icon: FileText
      })
    }

    // Slug validation
    if (!content.slug?.trim()) {
      results.issues.push({
        type: 'error',
        field: 'slug',
        message: 'URL slug is required',
        icon: Link
      })
    } else if (!/^[a-z0-9-]+$/.test(content.slug)) {
      results.issues.push({
        type: 'error',
        field: 'slug',
        message: 'Slug must contain only lowercase letters, numbers, and hyphens',
        icon: Link
      })
    }

    // Description validation
    if (!content.description?.trim()) {
      results.warnings.push({
        type: 'warning',
        field: 'description',
        message: 'Description helps users understand the content',
        icon: FileText
      })
    } else if (content.description.length < 20) {
      results.suggestions.push({
        type: 'suggestion',
        field: 'description',
        message: 'Consider adding a more detailed description',
        icon: Info
      })
    }
  }

  const validateSEO = (content, results) => {
    results.maxScore += 5

    // SEO-friendly title
    if (content.title && content.title.length > 60) {
      results.suggestions.push({
        type: 'suggestion',
        field: 'title',
        message: 'For better SEO, keep titles under 60 characters',
        icon: Target
      })
    }

    // Meta description equivalent
    if (content.description && content.description.length > 160) {
      results.suggestions.push({
        type: 'suggestion',
        field: 'description',
        message: 'For better SEO, keep descriptions under 160 characters',
        icon: Target
      })
    }

    // Image alt text if featured image is present
    if (content.featured_image_url && !content.alt_text) {
      results.warnings.push({
        type: 'warning',
        field: 'featured_image',
        message: 'Featured image should have alt text for accessibility',
        icon: Image
      })
    }
  }

  const validateLesson = (content, results) => {
    results.maxScore += 15

    // Content validation
    if (!content.content?.trim()) {
      results.issues.push({
        type: 'error',
        field: 'content',
        message: 'Lesson content is required',
        icon: FileText
      })
    } else {
      // Content length check
      if (content.content.length < 100) {
        results.warnings.push({
          type: 'warning',
          field: 'content',
          message: 'Lesson content seems very short',
          icon: FileText
        })
      }

      // Check for common markdown issues
      if (content.content.includes('](') && !content.content.includes('http')) {
        results.warnings.push({
          type: 'warning',
          field: 'content',
          message: 'Some links may be broken or relative',
          icon: Link
        })
      }
    }

    // Learning objectives validation
    if (!content.learning_objectives || content.learning_objectives.filter(Boolean).length === 0) {
      results.warnings.push({
        type: 'warning',
        field: 'learning_objectives',
        message: 'Learning objectives help students understand what they will learn',
        icon: Target
      })
    }

    // Duration validation
    if (!content.estimated_duration || content.estimated_duration < 1) {
      results.warnings.push({
        type: 'warning',
        field: 'estimated_duration',
        message: 'Estimated duration helps students plan their time',
        icon: Clock
      })
    } else if (content.estimated_duration > 120) {
      results.suggestions.push({
        type: 'suggestion',
        field: 'estimated_duration',
        message: 'Consider breaking long lessons into smaller parts',
        icon: Clock
      })
    }

    // Difficulty level validation
    if (!content.difficulty_level) {
      results.suggestions.push({
        type: 'suggestion',
        field: 'difficulty_level',
        message: 'Setting difficulty level helps students choose appropriate content',
        icon: Users
      })
    }

    // Video content validation
    if (content.video_url) {
      try {
        new URL(content.video_url)
      } catch {
        results.warnings.push({
          type: 'warning',
          field: 'video_url',
          message: 'Video URL appears to be invalid',
          icon: Play
        })
      }
    }
  }

  const validateModule = (content, results) => {
    results.maxScore += 8

    // Icon validation
    if (!content.icon_name) {
      results.suggestions.push({
        type: 'suggestion',
        field: 'icon_name',
        message: 'Adding an icon makes modules more visually appealing',
        icon: Image
      })
    }

    // Color validation
    if (!content.color) {
      results.suggestions.push({
        type: 'suggestion',
        field: 'color',
        message: 'Color coding helps organize modules visually',
        icon: Image
      })
    }

    // Order index validation
    if (content.order_index < 0) {
      results.warnings.push({
        type: 'warning',
        field: 'order_index',
        message: 'Order index should be a positive number',
        icon: Info
      })
    }
  }

  const validateCourse = (content, results) => {
    results.maxScore += 10

    // Subtitle validation for courses
    if (!content.subtitle?.trim()) {
      results.suggestions.push({
        type: 'suggestion',
        field: 'subtitle',
        message: 'A subtitle provides additional context for the course',
        icon: FileText
      })
    }

    // Featured image for courses
    if (!content.featured_image_url) {
      results.suggestions.push({
        type: 'suggestion',
        field: 'featured_image_url',
        message: 'A featured image makes the course more attractive',
        icon: Image
      })
    }

    // Course structure validation
    if (content.total_modules === 0) {
      results.warnings.push({
        type: 'warning',
        field: 'modules',
        message: 'Course should have at least one module',
        icon: BookOpen
      })
    }

    if (content.total_lessons === 0) {
      results.warnings.push({
        type: 'warning',
        field: 'lessons',
        message: 'Course should have at least one lesson',
        icon: BookOpen
      })
    }
  }

  const getScoreColor = (score, maxScore) => {
    const percentage = (score / maxScore) * 100
    if (percentage >= 80) return 'text-green-600'
    if (percentage >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBackground = (score, maxScore) => {
    const percentage = (score / maxScore) * 100
    if (percentage >= 80) return 'bg-green-100'
    if (percentage >= 60) return 'bg-yellow-100'
    return 'bg-red-100'
  }

  const renderValidationItem = (item, index) => {
    const Icon = item.icon
    const colors = {
      error: 'text-red-600 bg-red-50 border-red-200',
      warning: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      suggestion: 'text-blue-600 bg-blue-50 border-blue-200'
    }

    return (
      <div key={index} className={`p-3 rounded-lg border ${colors[item.type]}`}>
        <div className="flex items-start gap-3">
          <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-medium text-sm">
              {item.field && (
                <span className="capitalize">{item.field.replace('_', ' ')}: </span>
              )}
              {item.message}
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!showDialog || !validationResults) {
    return null
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Content Validation
            </CardTitle>
            <CardDescription>
              Checking content quality and readiness for publication
            </CardDescription>
          </div>
          {validating && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              Validating...
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {validationResults && (
          <>
            {/* Overall Score */}
            <div className={`p-4 rounded-lg ${getScoreBackground(validationResults.score, validationResults.maxScore)}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Content Quality Score</span>
                <span className={`text-2xl font-bold ${getScoreColor(validationResults.score, validationResults.maxScore)}`}>
                  {validationResults.score}/{validationResults.maxScore}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${validationResults.score / validationResults.maxScore >= 0.8 ? 'bg-green-500' : validationResults.score / validationResults.maxScore >= 0.6 ? 'bg-yellow-500' : 'bg-red-500'}`}
                  style={{ width: `${(validationResults.score / validationResults.maxScore) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Publication Status */}
            <div className="flex items-center gap-3">
              {validationResults.canPublish ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-green-600 font-medium">Ready for publication</span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-red-600" />
                  <span className="text-red-600 font-medium">Issues must be resolved before publishing</span>
                </>
              )}
            </div>

            {/* Issues */}
            {validationResults.issues.length > 0 && (
              <div>
                <h4 className="font-medium text-red-600 mb-3 flex items-center gap-2">
                  <XCircle className="w-4 h-4" />
                  Issues ({validationResults.issues.length})
                </h4>
                <div className="space-y-2">
                  {validationResults.issues.map((issue, index) => renderValidationItem(issue, index))}
                </div>
              </div>
            )}

            {/* Warnings */}
            {validationResults.warnings.length > 0 && (
              <div>
                <h4 className="font-medium text-yellow-600 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Warnings ({validationResults.warnings.length})
                </h4>
                <div className="space-y-2">
                  {validationResults.warnings.map((warning, index) => renderValidationItem(warning, index))}
                </div>
              </div>
            )}

            {/* Suggestions */}
            {validationResults.suggestions.length > 0 && (
              <div>
                <h4 className="font-medium text-blue-600 mb-3 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Suggestions ({validationResults.suggestions.length})
                </h4>
                <div className="space-y-2">
                  {validationResults.suggestions.map((suggestion, index) => renderValidationItem(suggestion, index))}
                </div>
              </div>
            )}

            {/* No Issues */}
            {validationResults.issues.length === 0 &&
             validationResults.warnings.length === 0 &&
             validationResults.suggestions.length === 0 && (
              <div className="text-center py-8 text-green-600">
                <CheckCircle className="w-12 h-12 mx-auto mb-3" />
                <p className="font-medium">Excellent! No issues found.</p>
                <p className="text-sm text-gray-600">Your content is ready for publication.</p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default ContentValidator