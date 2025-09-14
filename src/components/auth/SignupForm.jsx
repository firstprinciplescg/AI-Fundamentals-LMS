import React, { useState } from 'react'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { useAuth } from '../../contexts/AuthContext'
import { isValidEmail, validatePassword, formatErrorMessage } from '../../lib/utils'
import { Brain, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react'

const SignupForm = ({ onToggleMode }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    company: '',
    role: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [touched, setTouched] = useState({})
  
  const { signUp } = useAuth()

  // Sanitize text input
  const sanitizeInput = (input) => {
    return input.trim().replace(/[<>]/g, '')
  }

  // Validate individual fields
  const validateField = (name, value, allData = formData) => {
    switch (name) {
      case 'fullName':
        if (!value.trim()) return 'Full name is required'
        if (value.trim().length < 2) return 'Full name must be at least 2 characters'
        if (!/^[a-zA-Z\s'-]+$/.test(value)) return 'Full name can only contain letters, spaces, hyphens, and apostrophes'
        return ''

      case 'email':
        if (!value.trim()) return 'Email is required'
        if (!isValidEmail(value)) return 'Please enter a valid email address'
        return ''

      case 'company':
        // Company is optional, but if provided should be reasonable
        if (value && value.trim().length > 100) return 'Company name is too long'
        return ''

      case 'password':
        const passwordErrors = validatePassword(value)
        return passwordErrors.length > 0 ? passwordErrors[0] : ''

      case 'confirmPassword':
        if (!value) return 'Please confirm your password'
        if (value !== allData.password) return 'Passwords do not match'
        return ''

      default:
        return ''
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    let sanitizedValue = ['fullName', 'company'].includes(name) ? sanitizeInput(value) : value

    setFormData({
      ...formData,
      [name]: sanitizedValue
    })

    // Real-time validation if field has been touched
    if (touched[name]) {
      const error = validateField(name, sanitizedValue, { ...formData, [name]: sanitizedValue })
      setFieldErrors(prev => ({ ...prev, [name]: error }))
    }
  }

  const handleBlur = (fieldName) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }))

    const error = validateField(fieldName, formData[fieldName], formData)
    setFieldErrors(prev => ({ ...prev, [fieldName]: error }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    // Mark all fields as touched
    const allFields = ['fullName', 'email', 'company', 'password', 'confirmPassword']
    const touchedFields = allFields.reduce((acc, field) => ({ ...acc, [field]: true }), {})
    setTouched(touchedFields)

    // Validate all fields
    const errors = {}
    allFields.forEach(field => {
      const error = validateField(field, formData[field], formData)
      if (error) errors[field] = error
    })

    setFieldErrors(errors)

    // Check if there are any validation errors
    if (Object.values(errors).some(error => error)) {
      setLoading(false)
      return
    }

    try {
      const { error } = await signUp(formData.email, formData.password, {
        full_name: formData.fullName,
        company: formData.company,
        role: formData.role
      })

      if (error) {
        setError(formatErrorMessage(error))
      } else {
        setSuccess('Account created successfully! Please check your email to verify your account.')
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
    }

    setLoading(false)
  }

  // Helper component for form field with validation
  const FormField = ({ label, name, type = 'text', placeholder, required = false, children }) => {
    const hasError = fieldErrors[name] && touched[name]
    const isValid = touched[name] && !fieldErrors[name] && formData[name]

    return (
      <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {children || (
          <input
            id={name}
            name={name}
            type={type}
            value={formData[name]}
            onChange={handleChange}
            onBlur={() => handleBlur(name)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors ${
              hasError
                ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                : isValid
                ? 'border-green-300 focus:border-green-500 focus:ring-green-200'
                : 'border-gray-300 focus:ring-blue-500 focus:border-transparent'
            }`}
            placeholder={placeholder}
            required={required}
          />
        )}
        {hasError && (
          <div className="flex items-center gap-2 mt-1 text-red-600 text-sm">
            <AlertCircle className="h-4 w-4" />
            {fieldErrors[name]}
          </div>
        )}
        {isValid && (
          <div className="flex items-center gap-2 mt-1 text-green-600 text-sm">
            <CheckCircle className="h-4 w-4" />
            Looks good!
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-2xl">Join AI Fundamentals</CardTitle>
          <CardDescription>
            Start your journey to AI mastery for business leaders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField
              label="Full Name"
              name="fullName"
              placeholder="Your full name"
              required
            />

            <FormField
              label="Email"
              name="email"
              type="email"
              placeholder="your@email.com"
              required
            />

            <FormField
              label="Company"
              name="company"
              placeholder="Your company (optional)"
            />

            <FormField
              label="Role"
              name="role"
            >
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                onBlur={() => handleBlur('role')}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors ${
                  fieldErrors.role && touched.role
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                    : touched.role && !fieldErrors.role && formData.role
                    ? 'border-green-300 focus:border-green-500 focus:ring-green-200'
                    : 'border-gray-300 focus:ring-blue-500 focus:border-transparent'
                }`}
              >
                <option value="">Select your role</option>
                <option value="founder">Founder</option>
                <option value="ceo">CEO</option>
                <option value="executive">Executive</option>
                <option value="manager">Manager</option>
                <option value="director">Director</option>
                <option value="other">Other</option>
              </select>
            </FormField>

            <FormField
              label="Password"
              name="password"
              required
            >
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={() => handleBlur('password')}
                  className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 transition-colors ${
                    fieldErrors.password && touched.password
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                      : touched.password && !fieldErrors.password && formData.password
                      ? 'border-green-300 focus:border-green-500 focus:ring-green-200'
                      : 'border-gray-300 focus:ring-blue-500 focus:border-transparent'
                  }`}
                  placeholder="Create a strong password"
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
              {touched.password && !fieldErrors.password && formData.password && (
                <div className="mt-2 text-xs text-gray-600">
                  Password strength: Strong ✓
                </div>
              )}
            </FormField>

            <FormField
              label="Confirm Password"
              name="confirmPassword"
              required
            >
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={() => handleBlur('confirmPassword')}
                  className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 transition-colors ${
                    fieldErrors.confirmPassword && touched.confirmPassword
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                      : touched.confirmPassword && !fieldErrors.confirmPassword && formData.confirmPassword
                      ? 'border-green-300 focus:border-green-500 focus:ring-green-200'
                      : 'border-gray-300 focus:ring-blue-500 focus:border-transparent'
                  }`}
                  placeholder="Confirm your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </FormField>

            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            {success && (
              <div className="text-green-600 text-sm bg-green-50 p-3 rounded-md">
                {success}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <button
              onClick={onToggleMode}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Sign in
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default SignupForm