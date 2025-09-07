import { createClient } from '@supabase/supabase-js'

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
  }
}