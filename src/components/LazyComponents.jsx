import { lazy, Suspense } from 'react'
import { Card, CardContent } from './ui/card'

// Loading component for lazy-loaded components
const LoadingFallback = ({ message = "Loading..." }) => (
  <div className="flex items-center justify-center p-8">
    <Card className="w-full max-w-md">
      <CardContent className="flex items-center justify-center p-6">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
          <span className="text-gray-700 font-medium">{message}</span>
        </div>
      </CardContent>
    </Card>
  </div>
)

// Lazy load heavy components
const LessonContentView = lazy(() => import('./LessonContentView.jsx'))
const CheatSheetView = lazy(() => import('./CheatSheetView.jsx'))
const ProjectsView = lazy(() => import('./ProjectsView.jsx'))
const CapabilityMatrixView = lazy(() => import('./CapabilityMatrixView.jsx'))

// Wrapper components with Suspense
export const LazyLessonContentView = (props) => (
  <Suspense fallback={<LoadingFallback message="Loading lesson..." />}>
    <LessonContentView {...props} />
  </Suspense>
)

export const LazyCheatSheetView = (props) => (
  <Suspense fallback={<LoadingFallback message="Loading cheat sheet..." />}>
    <CheatSheetView {...props} />
  </Suspense>
)

export const LazyProjectsView = (props) => (
  <Suspense fallback={<LoadingFallback message="Loading projects..." />}>
    <ProjectsView {...props} />
  </Suspense>
)

export const LazyCapabilityMatrixView = (props) => (
  <Suspense fallback={<LoadingFallback message="Loading matrix..." />}>
    <CapabilityMatrixView {...props} />
  </Suspense>
)

export default {
  LessonContentView: LazyLessonContentView,
  CheatSheetView: LazyCheatSheetView,
  ProjectsView: LazyProjectsView,
  CapabilityMatrixView: LazyCapabilityMatrixView,
}