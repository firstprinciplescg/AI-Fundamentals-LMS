import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import LoginForm from './LoginForm'
import SignupForm from './SignupForm'
import { Brain } from 'lucide-react'

const AuthWrapper = ({ children }) => {
  const { user, loading } = useAuth()
  const [isLoginMode, setIsLoginMode] = useState(true)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center animate-pulse">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return isLoginMode ? (
      <LoginForm onToggleMode={() => setIsLoginMode(false)} />
    ) : (
      <SignupForm onToggleMode={() => setIsLoginMode(true)} />
    )
  }

  return children
}

export default AuthWrapper