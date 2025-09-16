import React from 'react'
import { Button } from '../ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card.jsx'
import { Progress } from '../ui/progress.jsx'
import { ChevronRight, CheckCircle, Play } from '../icons'

const ModuleDetailView = ({ module, completedLessons, onBack, onSelectLesson }) => {
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
            <Card key={index} className={`transition-all cursor-pointer ${isCompleted ? 'bg-green-50 border-green-200' : 'hover:shadow-md'}`}>
              <CardContent className="p-6 flex items-center justify-between min-h-[72px]">
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isCompleted ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                    {isCompleted ? <CheckCircle className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                  </div>
                  <div className="flex items-center">
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

const ModulesView = ({ courseData, currentModule, setCurrentModule, completedLessons, navigateToView, handleSelectLesson }) => {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Course Modules</h1>
        <Button variant="outline" onClick={() => navigateToView('dashboard')}>
          Back to Dashboard
        </Button>
      </div>

      {currentModule ? (
        <ModuleDetailView
          module={currentModule}
          completedLessons={completedLessons}
          onBack={() => setCurrentModule(null)}
          onSelectLesson={handleSelectLesson}
        />
      ) : (
        <div className="grid gap-6">
          {courseData.modules.map((module) => {
            const Icon = module.icon
            const moduleProgress = module.lessons_list.reduce((acc, _, index) => {
              return completedLessons.has(`${module.id}-${index}`) ? acc + 1 : acc
            }, 0)
            const progressPercent = (moduleProgress / module.lessons) * 100

            return (
              <Card key={module.id} className="hover:shadow-lg transition-shadow cursor-pointer">
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
                    <Button onClick={() => { setCurrentModule(module); navigateToView("modules"); }}>
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
}

export default ModulesView