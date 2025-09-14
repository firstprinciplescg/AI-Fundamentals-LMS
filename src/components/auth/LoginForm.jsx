import React, { useState } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { useAuth } from '../../contexts/AuthContext'
import { isValidEmail, formatErrorMessage } from '../../lib/utils'
import { Brain, Eye, EyeOff, AlertCircle } from 'lucide-react'

const LoginForm = ({ onToggleMode }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [touched, setTouched] = useState({})
  
  const { signIn } = useAuth()

  // Sanitize input by trimming whitespace and removing potentially dangerous characters
  const sanitizeInput = (input) => {
    return input.trim().replace(/[<>]/g, '')
  }

  // Validate individual fields
  const validateField = (name, value) => {
    switch (name) {
      case 'email':
        if (!value.trim()) return 'Email is required'
        if (!isValidEmail(value)) return 'Please enter a valid email address'
        return ''
      case 'password':
        if (!value) return 'Password is required'
        if (value.length < 6) return 'Password must be at least 6 characters'
        return ''
      default:
        return ''
    }
  }

  // Handle input changes with real-time validation
  const handleEmailChange = (e) => {
    const value = sanitizeInput(e.target.value)
    setEmail(value)

    if (touched.email) {
      const error = validateField('email', value)
      setFieldErrors(prev => ({ ...prev, email: error }))
    }
  }

  const handlePasswordChange = (e) => {
    const value = e.target.value // Don't sanitize passwords
    setPassword(value)

    if (touched.password) {
      const error = validateField('password', value)
      setFieldErrors(prev => ({ ...prev, password: error }))
    }
  }

  // Handle field blur for validation
  const handleBlur = (fieldName) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }))

    let value = fieldName === 'email' ? email : password
    const error = validateField(fieldName, value)
    setFieldErrors(prev => ({ ...prev, [fieldName]: error }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Mark all fields as touched
    setTouched({ email: true, password: true })

    // Validate all fields
    const emailError = validateField('email', email)
    const passwordError = validateField('password', password)

    setFieldErrors({ email: emailError, password: passwordError })

    // Check if there are any validation errors
    if (emailError || passwordError) {
      setLoading(false)
      return
    }

    try {
      const { error } = await signIn(email, password)

      if (error) {
        setError(formatErrorMessage(error))
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
          <CardDescription>
            Sign in to continue your AI fundamentals journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={handleEmailChange}
                onBlur={() => handleBlur('email')}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors ${
                  fieldErrors.email && touched.email
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                    : 'border-gray-300 focus:ring-blue-500 focus:border-transparent'
                }`}
                placeholder="Enter your email"
                required
              />
              {fieldErrors.email && touched.email && (
                <div className="flex items-center gap-2 mt-1 text-red-600 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  {fieldErrors.email}
                </div>
              )}
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={handlePasswordChange}
                  onBlur={() => handleBlur('password')}
                  className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 transition-colors ${
                    fieldErrors.password && touched.password
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                      : 'border-gray-300 focus:ring-blue-500 focus:border-transparent'
                  }`}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldErrors.password && touched.password && (
                <div className="flex items-center gap-2 mt-1 text-red-600 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  {fieldErrors.password}
                </div>
              )}
            </div>

            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <button
              onClick={onToggleMode}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Sign up
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default LoginForm