import React, { createContext, useContext, useState, useEffect } from 'react'
import { auth, db } from '../lib/supabase'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState([])

  // PRODUCTION CHECKLIST:
  // [ ] Set VITE_DEV_MODE to false in .env
  // [ ] Remove mock user data
  // [ ] Configure real Supabase credentials
  // [ ] Test full auth flow
  // [ ] Verify all auth endpoints work

  // DEV MODE: Mock user for testing (remove before production)
  const DEV_MOCK_USER = {
    id: 'demo-user-123',
    email: 'demo@example.com',
    name: 'Demo User'
  }

  // DEV MODE: Mock admin role for testing
  const DEV_MOCK_ADMIN_ROLE = {
    role: 'admin',
    permissions: ['manage_content', 'manage_users', 'view_analytics']
  }

  const DEV_BYPASS_AUTH = import.meta.env.VITE_DEV_MODE === 'true'

  useEffect(() => {
    if (DEV_BYPASS_AUTH) {
      // In dev mode, set mock user and admin role
      console.log('🔧 Development mode enabled - bypassing authentication')
      setUser(DEV_MOCK_USER)
      setUserRole(DEV_MOCK_ADMIN_ROLE)
      setLoading(false)
      return
    }

    // Get initial session with error handling
    const getInitialSession = async () => {
      try {
        const { data: { user } } = await auth.getCurrentUser()
        setUser(user)
        
        if (user) {
          await loadUserProfile(user.id)
          await loadUserRole(user.id)
          await loadUserProgress(user.id)
        }
      } catch (error) {
        console.warn('Supabase connection failed:', error)
      }
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes with error handling
    try {
      const { data: { subscription } } = auth.onAuthStateChange(async (event, session) => {
        setUser(session?.user || null)
        
        if (session?.user) {
          await loadUserProfile(session.user.id)
          await loadUserRole(session.user.id)
          await loadUserProgress(session.user.id)
        } else {
          setProfile(null)
          setUserRole(null)
          setProgress([])
        }
        setLoading(false)
      })

      return () => subscription?.unsubscribe()
    } catch (error) {
      console.warn('Auth state change listener failed:', error)
      setLoading(false)
      return () => {}
    }
  }, [])

  const loadUserProfile = async (userId) => {
    if (DEV_BYPASS_AUTH) return
    const { data, error } = await db.profiles.get(userId)
    if (!error && data) {
      setProfile(data)
    }
  }

  const loadUserRole = async (userId) => {
    if (DEV_BYPASS_AUTH) return
    const { data, error } = await db.roles.get(userId)
    if (!error && data) {
      setUserRole(data)
    }
  }

  const loadUserProgress = async (userId) => {
    if (DEV_BYPASS_AUTH) return
    const { data, error } = await db.progress.getAll(userId)
    if (!error && data) {
      setProgress(data)
    }
  }

  const signUp = async (email, password, userData = {}) => {
    if (DEV_BYPASS_AUTH) return { data: { user: DEV_MOCK_USER }, error: null }
    
    const { data, error } = await auth.signUp(email, password, userData)
    
    if (!error && data.user) {
      await db.profiles.upsert({
        id: data.user.id,
        email: data.user.email,
        full_name: userData.full_name || '',
        company: userData.company || '',
        role: userData.role || ''
      })
      
      await db.enrollments.create(data.user.id)
    }
    
    return { data, error }
  }

  const signIn = async (email, password) => {
    if (DEV_BYPASS_AUTH) return { data: { user: DEV_MOCK_USER }, error: null }
    
    const { data, error } = await auth.signIn(email, password)
    
    if (!error && data.user) {
      await db.enrollments.updateLastAccessed(data.user.id)
    }
    
    return { data, error }
  }

  const signOut = async () => {
    if (DEV_BYPASS_AUTH) {
      setUser(null)
      return { error: null }
    }
    
    const { error } = await auth.signOut()
    return { error }
  }

  const markLessonComplete = async (lessonId, moduleId, lessonIndex) => {
    if (DEV_BYPASS_AUTH) {
      // Mock lesson completion in dev mode
      setProgress(prev => [...prev, { lesson_id: lessonId, completed: true }])
      return { error: null }
    }
    
    if (!user) return { error: new Error('No user logged in') }
    
    const { data, error } = await db.progress.markCompleted(user.id, lessonId, moduleId, lessonIndex)
    
    if (!error) {
      await loadUserProgress(user.id)
    }
    
    return { data, error }
  }

  const getCompletedLessons = () => {
    if (DEV_BYPASS_AUTH) {
      // Return a few demo completed lessons for testing
      return new Set(['1-0', '1-1', '2-0'])
    }
    return new Set(progress.filter(p => p.completed).map(p => p.lesson_id))
  }

  // Admin/permission helper functions
  const isAdmin = () => {
    return userRole?.role === 'admin' || userRole?.role === 'super_admin'
  }

  const isSuperAdmin = () => {
    return userRole?.role === 'super_admin'
  }

  const hasPermission = (permission) => {
    if (!userRole) return false
    return userRole.role === 'super_admin' ||
           userRole.permissions?.includes(permission) ||
           (userRole.role === 'admin' && ['manage_content', 'manage_users', 'view_analytics'].includes(permission))
  }

  const canManageContent = () => hasPermission('manage_content')
  const canManageUsers = () => hasPermission('manage_users')
  const canViewAnalytics = () => hasPermission('view_analytics')

  const value = {
    user,
    profile,
    userRole,
    loading,
    progress,
    signUp,
    signIn,
    signOut,
    markLessonComplete,
    getCompletedLessons,
    // Admin functions
    isAdmin,
    isSuperAdmin,
    hasPermission,
    canManageContent,
    canManageUsers,
    canViewAnalytics
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
