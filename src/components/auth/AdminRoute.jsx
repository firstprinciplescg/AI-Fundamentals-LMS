import React from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { AlertTriangle, Shield, Home } from '../icons'

const AdminRoute = ({ children, requiredPermission = null, fallback = null }) => {
  const { user, userRole, loading, isAdmin, hasPermission } = useAuth()

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Check if user is authenticated
  if (!user) {
    return fallback || <UnauthorizedCard message="Please sign in to access this area." />
  }

  // Check admin access
  if (!isAdmin()) {
    return fallback || <UnauthorizedCard message="Admin access required." />
  }

  // Check specific permission if required
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return fallback || <UnauthorizedCard
      message={`Insufficient permissions. Required: ${requiredPermission}`}
      showPermissions={true}
      userRole={userRole}
    />
  }

  // Render protected content
  return children
}

const UnauthorizedCard = ({ message, showPermissions = false, userRole = null }) => {
  const handleGoHome = () => {
    window.location.href = '/'
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900">
            Access Denied
          </CardTitle>
          <CardDescription className="text-gray-600">
            {message}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {showPermissions && userRole && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Your Role</span>
              </div>
              <div className="text-sm text-gray-600">
                <div className="mb-1">
                  <span className="font-medium">Role:</span> {userRole.role || 'student'}
                </div>
                {userRole.permissions && userRole.permissions.length > 0 && (
                  <div>
                    <span className="font-medium">Permissions:</span>
                    <ul className="mt-1 ml-4 list-disc">
                      {userRole.permissions.map((permission, index) => (
                        <li key={index} className="text-xs">{permission}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          <Button
            onClick={handleGoHome}
            className="w-full"
            variant="outline"
          >
            <Home className="w-4 h-4 mr-2" />
            Return to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

// Higher-order component for protecting admin routes
export const withAdminAccess = (WrappedComponent, requiredPermission = null) => {
  return function AdminProtectedComponent(props) {
    return (
      <AdminRoute requiredPermission={requiredPermission}>
        <WrappedComponent {...props} />
      </AdminRoute>
    )
  }
}

// Hook for checking admin access in components
export const useAdminAccess = (requiredPermission = null) => {
  const { isAdmin, hasPermission, userRole } = useAuth()

  return {
    hasAccess: isAdmin() && (requiredPermission ? hasPermission(requiredPermission) : true),
    isAdmin: isAdmin(),
    userRole,
    hasPermission
  }
}

export default AdminRoute