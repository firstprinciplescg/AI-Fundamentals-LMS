import { useState, useEffect } from 'react'
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

// Import components
import ErrorBoundary from './components/ErrorBoundary.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx';
import AuthWrapper from './components/auth/AuthWrapper.jsx';
import { useAuth } from './contexts/AuthContext.jsx';
import { getFileContent, safeAsync } from './lib/utils';
import HeroPlaceholder from './assets/hero-placeholder.jsx';
import { useContentPreloader, useContextualPreloader, useIntelligentPreloader } from './hooks/useContentPreloader.js';

// Import lazy-loaded components
import {
  LazyLessonContentView,
  LazyCheatSheetView,
  LazyProjectsView,
  LazyCapabilityMatrixView
} from './components/LazyComponents.jsx';

const AppContent = () => {
  const { user, markLessonComplete, getCompletedLessons, signOut } = useAuth()
  const [currentView, setCurrentView] = useState('dashboard')
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

  // Initialize content preloading
  useContentPreloader()
  useContextualPreloader(currentModule, currentView)
  useIntelligentPreloader(completedLessons, currentLesson)

  // Course data structure
  const courseData = {
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
  }

  const totalProgress = (completedLessons.size / courseData.totalLessons) * 100

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'modules', label: 'Modules', icon: BookOpen },
    { id: 'resources', label: 'Resources', icon: FileText },
    { id: 'projects', label: 'Projects', icon: Lightbulb },
    { id: 'progress', label: 'Progress', icon: Award }
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
      setCurrentView('lesson');
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
      setCurrentView("cheatsheet");
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
      setCurrentView("matrix");
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
      setCurrentView("projects");
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
      setCurrentView('modules');
      setCurrentLesson(null);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const DashboardView = () => (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative px-8 py-12 md:px-12 md:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {courseData.title}
              </h1>
              <p className="text-xl mb-6 text-blue-100">
                {courseData.subtitle}
              </p>
              <div className="flex flex-wrap gap-4 mb-6">
                <Badge variant="secondary" className="bg-white/20 text-white">
                  {courseData.totalModules} Modules
                </Badge>
                <Badge variant="secondary" className="bg-white/20 text-white">
                  {courseData.totalLessons} Lessons
                </Badge>
                <Badge variant="secondary" className="bg-white/20 text-white">
                  Hands-on Labs
                </Badge>
              </div>
              <Button 
                size="lg" 
                className="bg-white text-blue-600 hover:bg-blue-50"
                onClick={() => setCurrentView('modules')}
              >
                Start Learning <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <div className="hidden lg:block">
              <HeroPlaceholder />
            </div>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Your Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Overall Progress</span>
                <span>{Math.round(totalProgress)}%</span>
              </div>
              <Progress value={totalProgress} className="h-3" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{completedLessons.size}</div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-emerald-600">{courseData.totalLessons - completedLessons.size}</div>
                <div className="text-sm text-muted-foreground">Remaining</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">{courseData.totalModules}</div>
                <div className="text-sm text-muted-foreground">Modules</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">2</div>
                <div className="text-sm text-muted-foreground">Labs</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-2xl font-bold mb-6">Course Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {courseData.modules.map((module) => {
            const Icon = module.icon
            const moduleProgress = module.lessons_list.reduce((acc, _, index) => {
              return completedLessons.has(`${module.id}-${index}`) ? acc + 1 : acc
            }, 0)
            const progressPercent = (moduleProgress / module.lessons) * 100

            return (
              <Card key={module.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => {
                setCurrentModule(module)
                setCurrentView('modules')
              }}>
                <CardHeader className="pb-3">
                  <div className={`w-12 h-12 rounded-lg ${module.color} flex items-center justify-center mb-3`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">{module.title}</CardTitle>
                  <CardDescription>{module.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>{moduleProgress}/{module.lessons} lessons</span>
                      <span>{Math.round(progressPercent)}%</span>
                    </div>
                    <Progress value={progressPercent} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )

  const ModulesView = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Course Modules</h1>
        <Button variant="outline" onClick={() => setCurrentView('dashboard')}>
          Back to Dashboard
        </Button>
      </div>

      {currentModule ? (
        <ModuleDetailView module={currentModule} onBack={() => setCurrentModule(null)} onSelectLesson={handleSelectLesson} />
      ) : (
        <div className="grid gap-6">
          {courseData.modules.map((module) => {
            const Icon = module.icon
            const moduleProgress = module.lessons_list.reduce((acc, _, index) => {
              return completedLessons.has(`${module.id}-${index}`) ? acc + 1 : acc
            }, 0)
            const progressPercent = (moduleProgress / module.lessons) * 100

            return (
              <Card key={module.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className={`w-16 h-16 rounded-xl ${module.color} flex items-center justify-center flex-shrink-0`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">Module {module.id}: {module.title}</CardTitle>
                      <CardDescription className="text-base mb-4">{module.description}</CardDescription>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{module.lessons} lessons</span>
                        <span>•</span>
                        <span>{moduleProgress} completed</span>
                      </div>
                    </div>
                    <Button onClick={() => { setCurrentModule(module); setCurrentView("modules"); }}>
                      View Module <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{Math.round(progressPercent)}%</span>
                    </div>
                    <Progress value={progressPercent} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )

  const ModuleDetailView = ({ module, onBack, onSelectLesson }) => {
    const Icon = module.icon
    
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack}>
            ← Back
          </Button>
          <div className={`w-12 h-12 rounded-lg ${module.color} flex items-center justify-center`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Module {module.id}: {module.title}</h1>
            <p className="text-muted-foreground">{module.description}</p>
          </div>
        </div>

        <div className="grid gap-4">
          {module.lessons_list.map((lesson, index) => {
            const lessonId = `${module.id}-${index}`
            const isCompleted = completedLessons.has(lessonId)
            
            return (
              <Card key={index} className={`transition-all ${isCompleted ? 'bg-green-50 border-green-200' : 'hover:shadow-md'}`}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isCompleted ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                      {isCompleted ? <CheckCircle className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                    </div>
                    <div>
                      <h3 className="font-semibold">{lesson}</h3>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => onSelectLesson(module.id, index)}>
                    Start
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    )
  }

  const ResourcesView = () => {
    const cheatSheets = [
      { name: "ChatGPT Cheat Sheet", file: "ChatGPT_Cheat_Sheet.md" },
      { name: "Claude Cheat Sheet", file: "Claude_Cheat_Sheet.md" },
      { name: "Gemini Cheat Sheet", file: "Gemini_Cheat_Sheet.md" },
      { name: "Perplexity Cheat Sheet", file: "Perplexity_Cheat_Sheet.md" },
      { name: "Manus Cheat Sheet", file: "Manus_Cheat_Sheet.md" },
      { name: "Zapier Cheat Sheet", file: "Zapier_Cheat_Sheet.md" },
      { name: "n8n Cheat Sheet", file: "n8n_Cheat_Sheet.md" },
    ];

    return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Resources & Tools</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Cheat Sheets
            </CardTitle>
            <CardDescription>Quick reference guides</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {cheatSheets.map((sheet) => (
                <Button key={sheet.name} variant="outline" className="w-full justify-start text-left" onClick={() => handleSelectCheatSheet(sheet.file)}>
                  <Download className="mr-2 h-4 w-4" />
                  {sheet.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Capability Matrices
            </CardTitle>
            <CardDescription>Compare platforms and features</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start text-left" onClick={() => handleShowMatrix("Capability_Matrix_LLM_Assistants.csv")}>
                <Download className="mr-2 h-4 w-4" />
                LLM Assistants Matrix
              </Button>
              <Button variant="outline" className="w-full justify-start text-left" onClick={() => handleShowMatrix("Capability_Matrix_Automation.csv")}>
                <Download className="mr-2 h-4 w-4" />
                Automation Platforms Matrix
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Prompt Packs
            </CardTitle>
            <CardDescription>Ready-to-use prompts by department</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button variant="ghost" className="w-full justify-start">
                <Download className="mr-2 h-4 w-4" />
                Sales Prompts
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <Download className="mr-2 h-4 w-4" />
                Marketing Prompts
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <Download className="mr-2 h-4 w-4" />
                Support Prompts
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <Download className="mr-2 h-4 w-4" />
                HR Prompts
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
  }

  const renderContent = () => {
    if (currentView === 'lesson') {
      return <LazyLessonContentView
        lesson={{ title: currentLesson.title, content: lessonContent }}
        onBack={() => setCurrentView('modules')}
        onComplete={handleCompleteLesson}
      />;
    }
    if (currentView === 'cheatsheet') {
    return <LazyCheatSheetView sheet={currentCheatSheet} onBack={() => setCurrentView("resources")} />;
    }
    switch (currentView) {
      case 'dashboard':
        return <DashboardView />
      case 'modules':
        return <ModulesView />
      case 'resources':
        return <ResourcesView />
      case 'projects':
        return <LazyProjectsView content={projectsContent} />
      case 'matrix':
        return <LazyCapabilityMatrixView matrix={currentMatrix} onBack={() => setCurrentView('resources')} />
      default:
        return <DashboardView />
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
                    setCurrentView(item.id);
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
        <AuthWrapper>
          <AppContent />
        </AuthWrapper>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
