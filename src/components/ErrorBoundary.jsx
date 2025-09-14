import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console in development
    if (import.meta.env.VITE_DEV_MODE === 'true') {
      console.error('Error caught by ErrorBoundary:', error, errorInfo);
    }

    // In production, you would send this to an error reporting service
    this.setState({
      error,
      errorInfo,
      errorCount: this.state.errorCount + 1
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  handleHomeRedirect = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      const isDev = import.meta.env.VITE_DEV_MODE === 'true';

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full">
            <CardHeader>
              <div className="flex items-center gap-3 text-red-600">
                <AlertTriangle className="h-8 w-8" />
                <CardTitle className="text-2xl">Oops! Something went wrong</CardTitle>
              </div>
              <CardDescription className="mt-2">
                We encountered an unexpected error. The application may still work if you refresh or go back to the home page.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* User-friendly error message */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">
                  {this.state.error?.message || 'An unexpected error occurred'}
                </p>
              </div>

              {/* Developer error details (only in dev mode) */}
              {isDev && this.state.errorInfo && (
                <details className="bg-gray-100 rounded-lg p-4">
                  <summary className="cursor-pointer font-medium text-sm text-gray-700">
                    Developer Details (Dev Mode Only)
                  </summary>
                  <div className="mt-3 space-y-2">
                    <pre className="text-xs text-gray-600 overflow-auto max-h-60 bg-white p-3 rounded">
                      {this.state.error?.stack}
                    </pre>
                    <pre className="text-xs text-gray-600 overflow-auto max-h-40 bg-white p-3 rounded">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </div>
                </details>
              )}

              {/* Action buttons */}
              <div className="flex gap-3 pt-2">
                <Button
                  onClick={this.handleReset}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </Button>
                <Button
                  variant="outline"
                  onClick={this.handleHomeRedirect}
                  className="flex items-center gap-2"
                >
                  <Home className="h-4 w-4" />
                  Go to Home
                </Button>
              </div>

              {/* Error frequency warning */}
              {this.state.errorCount > 2 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800">
                    This error has occurred multiple times. If it persists, please contact support.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;