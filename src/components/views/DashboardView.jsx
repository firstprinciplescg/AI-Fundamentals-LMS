import React from 'react'
import { Button } from '../ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card.jsx'
import { Badge } from '../ui/badge.jsx'
import { Progress } from '../ui/progress.jsx'
import { Play, CheckCircle, Clock, Trophy, Download } from '../icons'
import HeroPlaceholder from '../../assets/hero-placeholder.jsx'
import { downloadProgressReport } from '../../utils/downloadUtils.js'

const DashboardView = ({ courseData, completedLessons, setCurrentModule, navigateToView }) => {
  const totalProgress = (completedLessons.size / courseData.totalLessons) * 100

  return (
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
                  <Trophy className="h-4 w-4 mr-1" />
                  Certificate
                </Badge>
              </div>
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100" onClick={() => navigateToView('modules')}>
                <Play className="mr-2 h-5 w-5" />
                Continue Learning
              </Button>
            </div>
            <div className="hidden lg:flex justify-center">
              <HeroPlaceholder />
            </div>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Your Progress</CardTitle>
              <CardDescription>Track your learning journey</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => downloadProgressReport(completedLessons, courseData)}
            >
              <Download className="mr-2 h-4 w-4" />
              Export Progress
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Overall Completion</span>
                <span className="text-sm text-muted-foreground">{Math.round(totalProgress)}%</span>
              </div>
              <Progress value={totalProgress} className="h-3" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
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
                navigateToView('modules')
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
}

export default DashboardView