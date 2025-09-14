import { createClient } from '@supabase/supabase-js'

// PRODUCTION CHECKLIST:
// [ ] Remove fallback values
// [ ] Ensure real Supabase project credentials are in .env
// [ ] Test database connections

// These will be environment variables in production
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'your-supabase-url'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-supabase-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Auth helpers
export const auth = {
  // Sign up new user
  signUp: async (email, password, userData = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    })
    return { data, error }
  },

  // Sign in user
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  },

  // Sign out user
  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  // Get current user
  getCurrentUser: () => {
    return supabase.auth.getUser()
  },

  // Listen to auth changes
  onAuthStateChange: (callback) => {
    return supabase.auth.onAuthStateChange(callback)
  }
}

// Database helpers
export const db = {
  // User profile operations
  profiles: {
    get: async (userId) => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      return { data, error }
    },

    upsert: async (profile) => {
      const { data, error } = await supabase
        .from('profiles')
        .upsert(profile)
        .select()
      return { data, error }
    }
  },

  // User progress operations
  progress: {
    // Get all progress for a user
    getAll: async (userId) => {
      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
      return { data, error }
    },

    // Mark lesson as completed
    markCompleted: async (userId, lessonId, moduleId, lessonIndex) => {
      const { data, error } = await supabase
        .from('user_progress')
        .upsert({
          user_id: userId,
          lesson_id: lessonId,
          module_id: moduleId,
          lesson_index: lessonIndex,
          completed: true,
          completed_at: new Date().toISOString()
        })
        .select()
      return { data, error }
    },

    // Update time spent
    updateTimeSpent: async (userId, lessonId, timeSpent) => {
      const { data, error } = await supabase
        .from('user_progress')
        .upsert({
          user_id: userId,
          lesson_id: lessonId,
          time_spent: timeSpent
        })
        .select()
      return { data, error }
    }
  },

  // Enrollment operations
  enrollments: {
    // Create enrollment
    create: async (userId) => {
      const { data, error } = await supabase
        .from('enrollments')
        .upsert({
          user_id: userId,
          enrolled_at: new Date().toISOString(),
          last_accessed: new Date().toISOString()
        })
        .select()
      return { data, error }
    },

    // Update last accessed
    updateLastAccessed: async (userId) => {
      const { data, error } = await supabase
        .from('enrollments')
        .update({
          last_accessed: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
      return { data, error }
    }
  },

  // User roles and permissions
  roles: {
    // Get user role
    get: async (userId) => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .single()
      return { data, error }
    },

    // Create or update user role
    upsert: async (userId, role, permissions = []) => {
      const { data, error } = await supabase
        .from('user_roles')
        .upsert({
          user_id: userId,
          role,
          permissions,
          assigned_at: new Date().toISOString()
        })
        .select()
      return { data, error }
    },

    // Check if user has specific permission
    hasPermission: async (userId, permission) => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role, permissions')
        .eq('user_id', userId)
        .single()

      if (error) return { hasPermission: false, error }

      const hasPermission = data?.role === 'super_admin' ||
                           data?.permissions?.includes(permission) ||
                           (data?.role === 'admin' && ['manage_content', 'manage_users', 'view_analytics'].includes(permission))

      return { hasPermission, data }
    }
  }
}

// Content Management System API
export const cms = {
  // Course operations
  courses: {
    getAll: async (includeUnpublished = false) => {
      let query = supabase.from('courses').select('*')
      if (!includeUnpublished) {
        query = query.eq('status', 'published')
      }
      const { data, error } = await query.order('created_at', { ascending: false })
      return { data, error }
    },

    getById: async (id) => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', id)
        .single()
      return { data, error }
    },

    getBySlug: async (slug) => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('slug', slug)
        .single()
      return { data, error }
    },

    create: async (courseData) => {
      const { data, error } = await supabase
        .from('courses')
        .insert({
          ...courseData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
      return { data, error }
    },

    update: async (id, updates) => {
      const { data, error } = await supabase
        .from('courses')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()

      // Invalidate cache on successful update
      if (!error) {
        try {
          const { invalidateRelatedCaches } = await import('./contentCache')
          invalidateRelatedCaches('course', id)
        } catch (cacheError) {
          console.warn('Cache invalidation error:', cacheError)
        }
      }

      return { data, error }
    },

    delete: async (id) => {
      const { data, error } = await supabase
        .from('courses')
        .delete()
        .eq('id', id)
      return { data, error }
    }
  },

  // Module operations
  modules: {
    getByCourse: async (courseId, includeUnpublished = false) => {
      let query = supabase
        .from('modules')
        .select('*')
        .eq('course_id', courseId)

      if (!includeUnpublished) {
        query = query.eq('status', 'published')
      }

      const { data, error } = await query.order('order_index')
      return { data, error }
    },

    getById: async (id) => {
      const { data, error } = await supabase
        .from('modules')
        .select('*')
        .eq('id', id)
        .single()
      return { data, error }
    },

    create: async (moduleData) => {
      const { data, error } = await supabase
        .from('modules')
        .insert({
          ...moduleData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
      return { data, error }
    },

    update: async (id, updates) => {
      const { data, error } = await supabase
        .from('modules')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
      return { data, error }
    },

    delete: async (id) => {
      const { data, error } = await supabase
        .from('modules')
        .delete()
        .eq('id', id)
      return { data, error }
    },

    reorder: async (moduleUpdates) => {
      const { data, error } = await supabase
        .from('modules')
        .upsert(moduleUpdates)
        .select()
      return { data, error }
    }
  },

  // Lesson operations
  lessons: {
    getByModule: async (moduleId, includeUnpublished = false) => {
      let query = supabase
        .from('lessons')
        .select('*')
        .eq('module_id', moduleId)

      if (!includeUnpublished) {
        query = query.eq('status', 'published')
      }

      const { data, error } = await query.order('order_index')
      return { data, error }
    },

    getById: async (id) => {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', id)
        .single()
      return { data, error }
    },

    getBySlug: async (moduleId, slug) => {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('module_id', moduleId)
        .eq('slug', slug)
        .single()
      return { data, error }
    },

    create: async (lessonData) => {
      const { data, error } = await supabase
        .from('lessons')
        .insert({
          ...lessonData,
          version: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
      return { data, error }
    },

    update: async (id, updates) => {
      // First, get current version
      const { data: currentLesson } = await supabase
        .from('lessons')
        .select('version, title, content, description')
        .eq('id', id)
        .single()

      // Create version backup if content changed
      if (currentLesson && (updates.content || updates.title)) {
        await supabase.from('lesson_versions').insert({
          lesson_id: id,
          version_number: currentLesson.version,
          title: currentLesson.title,
          content: currentLesson.content,
          description: currentLesson.description,
          created_at: new Date().toISOString()
        })
      }

      // Update lesson with incremented version
      const { data, error } = await supabase
        .from('lessons')
        .update({
          ...updates,
          version: currentLesson?.version ? currentLesson.version + 1 : 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()

      // Invalidate cache on successful update
      if (!error) {
        try {
          const { invalidateRelatedCaches } = await import('./contentCache')
          invalidateRelatedCaches('lesson', id)
        } catch (cacheError) {
          console.warn('Cache invalidation error:', cacheError)
        }
      }

      return { data, error }
    },

    delete: async (id) => {
      const { data, error } = await supabase
        .from('lessons')
        .delete()
        .eq('id', id)
      return { data, error }
    },

    reorder: async (lessonUpdates) => {
      const { data, error } = await supabase
        .from('lessons')
        .upsert(lessonUpdates)
        .select()
      return { data, error }
    }
  },

  // Media asset operations
  media: {
    getAll: async (context = null, contextId = null) => {
      let query = supabase.from('media_assets').select('*')

      if (context && contextId) {
        query = query.eq('usage_context', context).eq('referenced_by_id', contextId)
      }

      const { data, error } = await query.order('created_at', { ascending: false })
      return { data, error }
    },

    upload: async (file, context = 'general', contextId = null) => {
      // Upload to Supabase Storage
      const fileName = `${Date.now()}-${file.name}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('media')
        .upload(fileName, file)

      if (uploadError) return { data: null, error: uploadError }

      // Create database record
      const { data, error } = await supabase
        .from('media_assets')
        .insert({
          filename: fileName,
          original_filename: file.name,
          file_path: uploadData.path,
          file_size: file.size,
          mime_type: file.type,
          usage_context: context,
          referenced_by_id: contextId,
          created_at: new Date().toISOString()
        })
        .select()

      return { data, error }
    },

    delete: async (id) => {
      // Get file path first
      const { data: asset } = await supabase
        .from('media_assets')
        .select('file_path')
        .eq('id', id)
        .single()

      if (asset) {
        // Delete from storage
        await supabase.storage.from('media').remove([asset.file_path])
      }

      // Delete database record
      const { data, error } = await supabase
        .from('media_assets')
        .delete()
        .eq('id', id)
      return { data, error }
    },

    updateMetadata: async (id, metadata) => {
      const { data, error } = await supabase
        .from('media_assets')
        .update({
          ...metadata,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
      return { data, error }
    }
  },

  // Content versioning
  versions: {
    getByLesson: async (lessonId) => {
      const { data, error } = await supabase
        .from('lesson_versions')
        .select('*')
        .eq('lesson_id', lessonId)
        .order('version_number', { ascending: false })
      return { data, error }
    },

    restore: async (lessonId, versionNumber) => {
      // Get version data
      const { data: version } = await supabase
        .from('lesson_versions')
        .select('*')
        .eq('lesson_id', lessonId)
        .eq('version_number', versionNumber)
        .single()

      if (!version) return { data: null, error: { message: 'Version not found' } }

      // Update lesson with version data
      return await cms.lessons.update(lessonId, {
        title: version.title,
        content: version.content,
        description: version.description
      })
    }
  }
}