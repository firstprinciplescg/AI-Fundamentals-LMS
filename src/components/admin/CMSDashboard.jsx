import React, { useState, useEffect } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import {
  Plus,
  BookOpen,
  FileText,
  Users,
  BarChart3,
  Edit,
  Trash2,
  Eye,
  Clock,
  Search,
  Filter,
  ArrowUpDown,
  MoreHorizontal
} from '../icons'
import { useAuth } from '../../contexts/AuthContext'
import { cms } from '../../lib/supabase'
import ContentEditor from './ContentEditor'
import AdminRoute from '../auth/AdminRoute'

const CMSDashboard = () => {
  const { canManageContent } = useAuth()
  const [activeTab, setActiveTab] = useState('courses')
  const [showEditor, setShowEditor] = useState(false)
  const [editingContent, setEditingContent] = useState(null)
  const [editorType, setEditorType] = useState('course')

  // Data states
  const [courses, setCourses] = useState([])
  const [modules, setModules] = useState([])
  const [lessons, setLessons] = useState([])
  const [loading, setLoading] = useState(false)

  // Filter and search states
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('updated_at')
  const [sortOrder, setSortOrder] = useState('desc')

  useEffect(() => {
    loadData()
  }, [activeTab])

  const loadData = async () => {
    setLoading(true)
    try {
      switch (activeTab) {
        case 'courses':
          const { data: coursesData } = await cms.courses.getAll(true)
          setCourses(coursesData || [])
          break
        case 'modules':
          // Get all modules across all courses
          const { data: modulesData } = await cms.modules.getByCourse(null, true)
          setModules(modulesData || [])
          break
        case 'lessons':
          // Get all lessons across all modules
          const { data: lessonsData } = await cms.lessons.getByModule(null, true)
          setLessons(lessonsData || [])
          break
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = (type) => {
    setEditorType(type)
    setEditingContent(null)
    setShowEditor(true)
  }

  const handleEdit = (content, type) => {
    setEditorType(type)
    setEditingContent(content)
    setShowEditor(true)
  }

  const handleEditorSave = (savedContent, published) => {
    setShowEditor(false)
    setEditingContent(null)
    loadData() // Refresh data
  }

  const handleEditorCancel = () => {
    setShowEditor(false)
    setEditingContent(null)
  }

  const handleDelete = (deletedId) => {
    setShowEditor(false)
    setEditingContent(null)
    loadData() // Refresh data
  }

  const filterAndSortData = (data) => {
    let filtered = data

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => item.status === statusFilter)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortBy]
      let bValue = b[sortBy]

      if (sortBy === 'updated_at' || sortBy === 'created_at') {
        aValue = new Date(aValue)
        bValue = new Date(bValue)
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
      return 0
    })

    return filtered
  }

  const renderFilters = () => (
    <div className="flex items-center gap-4 mb-6">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search content..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
      >
        <option value="all">All Status</option>
        <option value="draft">Draft</option>
        <option value="published">Published</option>
        <option value="archived">Archived</option>
      </select>

      <select
        value={`${sortBy}-${sortOrder}`}
        onChange={(e) => {
          const [field, order] = e.target.value.split('-')
          setSortBy(field)
          setSortOrder(order)
        }}
        className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
      >
        <option value="updated_at-desc">Recently Updated</option>
        <option value="created_at-desc">Recently Created</option>
        <option value="title-asc">Title A-Z</option>
        <option value="title-desc">Title Z-A</option>
      </select>
    </div>
  )

  const renderContentCard = (item, type) => {
    const statusColors = {
      draft: 'bg-yellow-100 text-yellow-800',
      published: 'bg-green-100 text-green-800',
      archived: 'bg-gray-100 text-gray-800'
    }

    return (
      <Card key={item.id} className="cursor-pointer hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg">{item.title || 'Untitled'}</CardTitle>
              <CardDescription className="mt-1">
                {item.description || 'No description'}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <Badge className={statusColors[item.status] || statusColors.draft}>
                {item.status}
              </Badge>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(item, type)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-4">
              <span>v{item.version || 1}</span>
              {item.estimated_duration && (
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{item.estimated_duration}min</span>
                </div>
              )}
              {type === 'course' && (
                <span>{item.total_modules} modules, {item.total_lessons} lessons</span>
              )}
              {type === 'module' && item.lessons_count && (
                <span>{item.lessons_count} lessons</span>
              )}
            </div>
            <div className="text-xs">
              Updated {new Date(item.updated_at).toLocaleDateString()}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderCoursesTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Courses</h2>
        <Button onClick={() => handleCreate('course')}>
          <Plus className="w-4 h-4 mr-2" />
          Create Course
        </Button>
      </div>

      {renderFilters()}

      {loading ? (
        <div className="text-center py-12">Loading courses...</div>
      ) : (
        <div className="grid gap-4">
          {filterAndSortData(courses).map(course => renderContentCard(course, 'course'))}
          {courses.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No courses found. Create your first course to get started.
            </div>
          )}
        </div>
      )}
    </div>
  )

  const renderModulesTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Modules</h2>
        <Button onClick={() => handleCreate('module')}>
          <Plus className="w-4 h-4 mr-2" />
          Create Module
        </Button>
      </div>

      {renderFilters()}

      {loading ? (
        <div className="text-center py-12">Loading modules...</div>
      ) : (
        <div className="grid gap-4">
          {filterAndSortData(modules).map(module => renderContentCard(module, 'module'))}
          {modules.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No modules found. Create your first module to get started.
            </div>
          )}
        </div>
      )}
    </div>
  )

  const renderLessonsTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Lessons</h2>
        <Button onClick={() => handleCreate('lesson')}>
          <Plus className="w-4 h-4 mr-2" />
          Create Lesson
        </Button>
      </div>

      {renderFilters()}

      {loading ? (
        <div className="text-center py-12">Loading lessons...</div>
      ) : (
        <div className="grid gap-4">
          {filterAndSortData(lessons).map(lesson => renderContentCard(lesson, 'lesson'))}
          {lessons.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No lessons found. Create your first lesson to get started.
            </div>
          )}
        </div>
      )}
    </div>
  )

  const renderStatsTab = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Analytics</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{courses.length}</div>
            <p className="text-xs text-muted-foreground">
              {courses.filter(c => c.status === 'published').length} published
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Modules</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{modules.length}</div>
            <p className="text-xs text-muted-foreground">
              {modules.filter(m => m.status === 'published').length} published
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Lessons</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lessons.length}</div>
            <p className="text-xs text-muted-foreground">
              {lessons.filter(l => l.status === 'published').length} published
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500">
            Activity tracking coming soon...
          </div>
        </CardContent>
      </Card>
    </div>
  )

  if (showEditor) {
    return (
      <AdminRoute requiredPermission="manage_content">
        <ContentEditor
          type={editorType}
          contentId={editingContent?.id}
          initialData={editingContent}
          onSave={handleEditorSave}
          onCancel={handleEditorCancel}
          onDelete={handleDelete}
        />
      </AdminRoute>
    )
  }

  return (
    <AdminRoute requiredPermission="manage_content">
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Content Management System</h1>
          <p className="text-gray-600 mt-2">Manage your courses, modules, and lessons</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="courses">
              <BookOpen className="w-4 h-4 mr-2" />
              Courses
            </TabsTrigger>
            <TabsTrigger value="modules">
              <FileText className="w-4 h-4 mr-2" />
              Modules
            </TabsTrigger>
            <TabsTrigger value="lessons">
              <Users className="w-4 h-4 mr-2" />
              Lessons
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="courses">
            {renderCoursesTab()}
          </TabsContent>

          <TabsContent value="modules">
            {renderModulesTab()}
          </TabsContent>

          <TabsContent value="lessons">
            {renderLessonsTab()}
          </TabsContent>

          <TabsContent value="analytics">
            {renderStatsTab()}
          </TabsContent>
        </Tabs>
      </div>
    </AdminRoute>
  )
}

export default CMSDashboard