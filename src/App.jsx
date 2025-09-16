import { useState, useEffect, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Button } from './components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card.jsx'
import { Badge } from './components/ui/badge.jsx'
import { Progress } from './components/ui/progress.jsx'
import {
  BookOpen,
  Users,
  Brain,
  Zap,
  Target,
  Shield,
  Trophy,
  Play,
  CheckCircle,
  Clock,
  Star,
  Download,
  Search,
  Menu,
  X,
  ChevronRight,
  Award,
  BarChart3,
  Settings,
  FileText,
  Lightbulb,
  LogOut,
  AlertTriangle
} from './components/icons'
import './App.css'

// Import course data
import { COURSE_METADATA, COURSE_MODULES, CHEAT_SHEETS, CAPABILITY_MATRICES, PROJECTS, PROMPT_PACK } from './data/courseData.js'

// Import components
import ErrorBoundary from './components/ErrorBoundary.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx';
import AuthWrapper from './components/auth/AuthWrapper.jsx';
import AppRouter from './components/AppRouter.jsx';
import { useAuth } from './contexts/AuthContext.jsx';
import { getFileContent, safeAsync } from './lib/utils';
import HeroPlaceholder from './assets/hero-placeholder.jsx';
import { useContentPreloader, useContextualPreloader, useIntelligentPreloader } from './hooks/useContentPreloader.js';
import CMSDashboard from './components/admin/CMSDashboard.jsx';

// Import lazy-loaded components
import {
  LazyLessonContentView,
  LazyCheatSheetView,
  LazyProjectsView,
  LazyCapabilityMatrixView
} from './components/LazyComponents.jsx';

// Import view components
import DashboardView from './components/views/DashboardView.jsx';
import ModulesView from './components/views/ModulesView.jsx';
import ResourcesView from './components/views/ResourcesView.jsx';

const AppContent = () => {
  const { user, markLessonComplete, getCompletedLessons, signOut, canManageContent } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  // Map URL paths to views
  const getViewFromPath = (pathname) => {
    if (pathname.startsWith('/modules')) return 'modules'
    if (pathname.startsWith('/resources')) return 'resources'
    if (pathname.startsWith('/projects')) return 'projects'
    if (pathname.startsWith('/progress')) return 'progress'
    if (pathname.startsWith('/cms')) return 'cms'
    if (pathname.startsWith('/lesson')) return 'lesson'
    return 'dashboard'
  }

  const [currentView, setCurrentView] = useState(() => getViewFromPath(location.pathname))
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [currentModule, setCurrentModule] = useState(null)
  const [currentLesson, setCurrentLesson] = useState(null);
  const [lessonContent, setLessonContent] = useState('');
  const [currentCheatSheet, setCurrentCheatSheet] = useState(null);
  const [projectsContent, setProjectsContent] = useState("");
  const [currentMatrix, setCurrentMatrix] = useState(null);

  // Loading states
  const [loadingContent, setLoadingContent] = useState(false);
  const [error, setError] = useState(null);
  
  const completedLessons = getCompletedLessons()

  // Sync URL with current view
  useEffect(() => {
    const newView = getViewFromPath(location.pathname)
    if (newView !== currentView) {
      setCurrentView(newView)
    }
  }, [location.pathname, currentView])

  // Helper function to navigate and update view
  const navigateToView = (view, options = {}) => {
    const pathMap = {
      dashboard: '/dashboard',
      modules: '/modules',
      resources: '/resources',
      projects: '/projects',
      progress: '/progress',
      cms: '/cms',
      lesson: '/lesson'
    }

    const path = pathMap[view] || '/dashboard'
    navigate(path, options)
    setCurrentView(view)
  }

  // Initialize content preloading
  useContentPreloader()
  useContextualPreloader(currentModule, currentView)
  useIntelligentPreloader(completedLessons, currentLesson)

  // Course data structure - memoized for performance
  const courseData = useMemo(() => ({
    title: "AI Fundamentals for Founders & Small Business Executives",
    subtitle: "Make confident AI decisions, deploy pragmatic automations, and measure business impact in weeks—not quarters.",
    totalLessons: 31,
    totalModules: 8,
    modules: [
      {
        id: 1,
        title: "Foundations",
        description: "Core concepts and strategic thinking",
        lessons: 5,
        color: "bg-blue-500",
        icon: Brain,
        lessons_list: [
          "Generative AI 101 (models, embeddings, agents)",
          "Agents, tools, and orchestrators (what actually does the work)",
          "Prompting systems (TCREI) and evaluation loops",
          "Data privacy, security, and governance essentials",
          "ROI, risk, and portfolio planning for AI initiatives"
        ]
      },
      {
        id: 2,
        title: "Working Day-to-Day",
        description: "Practical applications",
        lessons: 5,
        color: "bg-emerald-500",
        icon: Target,
        lessons_list: [
          "Research & strategy with web-grounded assistants",
          "Writing & content ops (briefs, drafts, brand voice)",
          "Data work (CSV/Sheets, dashboards, QA loops)",
          "Meetings, CRM, and knowledge capture",
          "Legal, policy, and vendor management with AI"
        ]
      },
      {
        id: 3,
        title: "Assistant Platforms",
        description: "Tool deep dives",
        lessons: 5,
        color: "bg-purple-500",
        icon: Users,
        lessons_list: [
          "ChatGPT overview (strengths, guardrails, patterns)",
          "Claude overview (analysis, drafting, reliability patterns)",
          "Gemini overview (multimodality, Google ecosystem)",
          "Perplexity overview (web-grounded Q&A, citations)",
          "Manus overview (autonomy, risk labeling, sandboxing)"
        ]
      },
      {
        id: 4,
        title: "Automation Platforms",
        description: "Workflow automation",
        lessons: 3,
        color: "bg-orange-500",
        icon: Zap,
        lessons_list: [
          "Zapier overview (agents, chatbots, actions)",
          "n8n overview (self-hosting, code-friendly nodes)",
          "Choosing your stack (speed vs. control vs. cost)"
        ]
      },
      {
        id: 5,
        title: "Use-Case Deep Dives",
        description: "Department-specific applications",
        lessons: 7,
        color: "bg-indigo-500",
        icon: BarChart3,
        lessons_list: [
          "Marketing (campaigns, creative, SEO/SEM)",
          "Sales (lead triage, outreach, qualification)",
          "Support (inbox assist, SOPs, deflection)",
          "Finance (forecasting, dunning, vendor review)",
          "HR (hiring funnels, policy, training)",
          "Operations (SOPs, checklists, incident response)",
          "Product & Analytics (experiments, requirements, insight packs)"
        ]
      },
      {
        id: 6,
        title: "AI-Enabled Automations",
        description: "Hands-on labs",
        lessons: 2,
        color: "bg-red-500",
        icon: Settings,
        lessons_list: [
          "Zapier lab — build an action-taking assistant",
          "n8n lab — build a self-hosted agentic workflow"
        ]
      },
      {
        id: 7,
        title: "Security & Compliance",
        description: "Risk management",
        lessons: 3,
        color: "bg-teal-500",
        icon: Shield,
        lessons_list: [
          "Security & compliance in practice (PII/PHI/PCI flags)",
          "Change management (training, playbooks, approvals)",
          "Audits, logging, and incident handling"
        ]
      },
      {
        id: 8,
        title: "Capstone",
        description: "Real-world implementation",
        lessons: 1,
        color: "bg-yellow-500",
        icon: Trophy,
        lessons_list: [
          "Ship a live agent/automation and measure impact"
        ]
      }
    ]
  }), [])

  const totalProgress = useMemo(() =>
    (completedLessons.size / courseData.totalLessons) * 100,
    [completedLessons.size, courseData.totalLessons]
  )

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'modules', label: 'Modules', icon: BookOpen },
    { id: 'resources', label: 'Resources', icon: FileText },
    { id: 'projects', label: 'Projects', icon: Lightbulb },
    { id: 'progress', label: 'Progress', icon: Award },
    // Admin-only navigation
    ...(canManageContent() ? [
      { id: 'cms', label: 'Content Management', icon: Settings }
    ] : [])
  ]

  const handleSelectLesson = async (moduleId, lessonIndex) => {
    try {
      setLoadingContent(true);
      setError(null);

      const lessonId = `${moduleId}-${lessonIndex}`;
      const lessonTitle = courseData.modules.find(m => m.id === moduleId).lessons_list[lessonIndex];
      setCurrentLesson({ id: lessonId, title: lessonTitle });

      // Transform lesson title to match actual filename pattern
      const lessonFile = lessonTitle
        .toLowerCase()
        .replace(/ /g, "_")
        .replace(/\(/g, "_(")
        .replace(/\)/g, ")_")
        .replace(/,/g, ",_")
        .replace(/&/g, "_and_")
        .replace(/_+/g, "_") // Replace multiple underscores with single
        .replace(/,__/g, ",_") // Handle double underscores after commas
        .replace(/\)__/g, ")_") // Handle double underscores after closing paren
        .replace(/_$/, "") // Remove trailing underscore
        + ".md";

      const fetchedContent = await safeAsync(
        () => getFileContent(`/lessons/${lessonFile}`),
        '# Content Loading Error\n\nUnable to load lesson content. Please try again.'
      );

      setLessonContent(fetchedContent);
      navigateToView('lesson');
    } catch (error) {
      setError(error);
      console.error('Failed to load lesson:', error);
    } finally {
      setLoadingContent(false);
    }
  };

  const handleSelectCheatSheet = async (sheetFile) => {
    try {
      setLoadingContent(true);
      setError(null);

      const fetchedContent = await safeAsync(
        () => getFileContent(`/lessons/${sheetFile}`),
        '# Content Loading Error\n\nUnable to load cheat sheet content. Please try again.'
      );

      setCurrentCheatSheet({ title: sheetFile, content: fetchedContent });
      navigateToView("resources"); // Keep on resources page for cheat sheets
    } catch (error) {
      setError(error);
      console.error('Failed to load cheat sheet:', error);
    } finally {
      setLoadingContent(false);
    }
  };

  
  
  const handleShowMatrix = async (matrixFile) => {
    try {
      setLoadingContent(true);
      setError(null);

      const fetchedContent = await safeAsync(
        () => getFileContent(`/lessons/${matrixFile}`),
        '# Content Loading Error\n\nUnable to load matrix content. Please try again.'
      );

      setCurrentMatrix({ title: matrixFile, content: fetchedContent });
      navigateToView("resources"); // Keep on resources page for matrices
    } catch (error) {
      setError(error);
      console.error('Failed to load matrix:', error);
    } finally {
      setLoadingContent(false);
    }
  };

  const handleShowProjects = async () => {
    try {
      setLoadingContent(true);
      setError(null);

      const fetchedContent = await safeAsync(
        () => getFileContent(`/lessons/Projects.md`),
        '# Content Loading Error\n\nUnable to load projects content. Please try again.'
      );

      setProjectsContent(fetchedContent);
      navigateToView("projects");
    } catch (error) {
      setError(error);
      console.error('Failed to load projects:', error);
    } finally {
      setLoadingContent(false);
    }
  };

  const handleCompleteLesson = async () => {
    if (currentLesson) {
      const [moduleId, lessonIndex] = currentLesson.id.split('-').map(Number);
      await markLessonComplete(currentLesson.id, moduleId, lessonIndex);
      navigateToView('modules');
      setCurrentLesson(null);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  // DashboardView component has been extracted to ./components/views/DashboardView.jsx

  // ModulesView and ModuleDetailView have been extracted to ./components/views/ModulesView.jsx

  // ResourcesView has been extracted to ./components/views/ResourcesView.jsx

  const renderContent = () => {
    if (currentView === 'lesson') {
      return <LazyLessonContentView
        lesson={{ title: currentLesson.title, content: lessonContent }}
        onBack={() => navigateToView('modules')}
        onComplete={handleCompleteLesson}
      />;
    }
    if (currentView === 'cheatsheet') {
    return <LazyCheatSheetView sheet={currentCheatSheet} onBack={() => navigateToView("resources")} />;
    }
    switch (currentView) {
      case 'dashboard':
        return <DashboardView
          courseData={courseData}
          completedLessons={completedLessons}
          setCurrentModule={setCurrentModule}
          navigateToView={navigateToView}
        />
      case 'modules':
        return <ModulesView
          courseData={courseData}
          currentModule={currentModule}
          setCurrentModule={setCurrentModule}
          completedLessons={completedLessons}
          navigateToView={navigateToView}
          handleSelectLesson={handleSelectLesson}
        />
      case 'resources':
        return <ResourcesView
          handleSelectCheatSheet={handleSelectCheatSheet}
          handleShowMatrix={handleShowMatrix}
        />
      case 'projects':
        return <LazyProjectsView content={projectsContent} />
      case 'matrix':
        return <LazyCapabilityMatrixView matrix={currentMatrix} onBack={() => navigateToView('resources')} />
      case 'cms':
        return <CMSDashboard />
      default:
        return <DashboardView
          courseData={courseData}
          completedLessons={completedLessons}
          setCurrentModule={setCurrentModule}
          navigateToView={navigateToView}
        />
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans relative">
      {/* Loading Overlay */}
      {loadingContent && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[150] flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 shadow-lg flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
            <span className="text-gray-700 font-medium">Loading content...</span>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="fixed top-4 right-4 z-[140] bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg max-w-md">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
            <div>
              <p className="text-red-800 font-medium">Error</p>
              <p className="text-red-700 text-sm mt-1">{error.message || 'Something went wrong'}</p>
              <Button
                size="sm"
                variant="outline"
                className="mt-2"
                onClick={() => setError(null)}
              >
                Dismiss
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:relative md:translate-x-0`}>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <Brain className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold">AI Fundamentals</span>
          </div>
          <nav className="space-y-2 mb-8">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Button
                  key={item.id}
                  variant={currentView === item.id ? 'secondary' : 'ghost'}
                  className="w-full justify-start text-left"
                  onClick={() => {
                    if (item.id === 'projects') {
                      handleShowProjects();
                    } else {
                      navigateToView(item.id);
                    }
                    setMobileMenuOpen(false);
                  }}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.label}
                </Button>
              )
            })}
          </nav>
          
          {/* User Profile Section */}
          <div className="border-t pt-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start text-left text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleSignOut}
            >
              <LogOut className="mr-3 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Brain className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold">AI Fundamentals</span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </header>

        {renderContent()}
      </main>
    </div>
  )
}

// Temporary test without auth
const TestApp = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-blue-600 mb-4">AI Fundamentals LMS - Test Mode</h1>
      <p className="text-gray-600">If you can see this, React is working. Authentication is temporarily disabled for testing.</p>
    </div>
  )
}

const App = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppRouter>
          <AuthWrapper>
            <AppContent />
          </AuthWrapper>
        </AppRouter>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
