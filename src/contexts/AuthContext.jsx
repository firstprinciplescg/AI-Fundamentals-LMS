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
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState([])

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { user } } = await auth.getCurrentUser()
      setUser(user)
      
      if (user) {
        await loadUserProfile(user.id)
        await loadUserProgress(user.id)
      }
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user || null)
      
      if (session?.user) {
        await loadUserProfile(session.user.id)
        await loadUserProgress(session.user.id)
      } else {
        setProfile(null)
        setProgress([])
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadUserProfile = async (userId) => {
    const { data, error } = await db.profiles.get(userId)
    if (!error && data) {
      setProfile(data)
    }
  }

  const loadUserProgress = async (userId) => {
    const { data, error } = await db.progress.getAll(userId)
    if (!error && data) {
      setProgress(data)
    }
  }

  const signUp = async (email, password, userData = {}) => {
    const { data, error } = await auth.signUp(email, password, userData)
    
    if (!error && data.user) {
      // Create profile
      await db.profiles.upsert({
        id: data.user.id,
        email: data.user.email,
        full_name: userData.full_name || '',
        company: userData.company || '',
        role: userData.role || ''
      })
      
      // Create enrollment
      await db.enrollments.create(data.user.id)
    }
    
    return { data, error }
  }

  const signIn = async (email, password) => {
    const { data, error } = await auth.signIn(email, password)
    
    if (!error && data.user) {
      // Update last accessed
      await db.enrollments.updateLastAccessed(data.user.id)
    }
    
    return { data, error }
  }

  const signOut = async () => {
    const { error } = await auth.signOut()
    return { error }
  }

  const markLessonComplete = async (lessonId, moduleId, lessonIndex) => {
    if (!user) return

    const { data, error } = await db.progress.markCompleted(
      user.id,
      lessonId,
      moduleId,
      lessonIndex
    )

    if (!error) {
      // Update local progress state
      const updatedProgress = [...progress]
      const existingIndex = updatedProgress.findIndex(p => p.lesson_id === lessonId)
      
      if (existingIndex >= 0) {
        updatedProgress[existingIndex] = { ...updatedProgress[existingIndex], completed: true, completed_at: new Date().toISOString() }
      } else {
        updatedProgress.push({
          lesson_id: lessonId,
          module_id: moduleId,
          lesson_index: lessonIndex,
          completed: true,
          completed_at: new Date().toISOString()
        })
      }
      
      setProgress(updatedProgress)
    }

    return { data, error }
  }

  const getCompletedLessons = () => {
    return new Set(progress.filter(p => p.completed).map(p => p.lesson_id))
  }

  const value = {
    user,
    profile,
    progress,
    loading,
    signUp,
    signIn,
    signOut,
    markLessonComplete,
    getCompletedLessons,
    loadUserProgress,
    loadUserProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}