import { useEffect } from 'react'
import { getFileContent } from '../lib/utils'
import { contentCache } from '../lib/contentCache'

// Hook to preload content in the background
export const useContentPreloader = () => {
  useEffect(() => {
    // Preload critical content after initial load
    const preloadCriticalContent = async () => {
      // Wait for initial render to complete
      setTimeout(async () => {
        try {
          // Preload first lesson content (most likely to be accessed)
          const criticalLessons = [
            '/lessons/generative_ai_101_(models,_embeddings,_agents).md',
            '/lessons/agents,_tools,_and_orchestrators_(what_actually_does_the_work).md',
            '/lessons/prompting_systems_(tcrei)_and_evaluation_loops.md'
          ]

          // Preload popular cheat sheets
          const criticalCheatSheets = [
            '/lessons/ChatGPT_Cheat_Sheet.md',
            '/lessons/Claude_Cheat_Sheet.md'
          ]

          // Preload projects (commonly accessed)
          const criticalProjects = ['/lessons/Projects.md']

          const allCriticalContent = [
            ...criticalLessons,
            ...criticalCheatSheets,
            ...criticalProjects
          ]

          // Preload content one by one to avoid overwhelming the browser
          for (const path of allCriticalContent) {
            await getFileContent(path, true) // Use cache
            // Small delay between preloads to not block main thread
            await new Promise(resolve => setTimeout(resolve, 100))
          }

          console.log('Critical content preloaded')
        } catch (error) {
          console.warn('Content preloading failed:', error)
        }
      }, 2000) // Wait 2 seconds after initial load
    }

    preloadCriticalContent()
  }, [])
}

// Hook to preload related content based on current context
export const useContextualPreloader = (currentModule, currentView) => {
  useEffect(() => {
    if (!currentModule || currentView !== 'modules') return

    // Preload lessons from current module
    const preloadModuleLessons = async () => {
      setTimeout(async () => {
        try {
          const moduleId = currentModule.id
          const lessonFiles = currentModule.lessons_list.map(lessonTitle => {
            const lessonFile = lessonTitle
              .toLowerCase()
              .replace(/ /g, "_")
              .replace(/\(/g, "_(")
              .replace(/\)/g, ")_")
              .replace(/,/g, ",_")
              .replace(/&/g, "_and_")
              .replace(/_+/g, "_")
              .replace(/,__/g, ",_")
              .replace(/\)__/g, ")_")
              .replace(/_$/, "")
              + ".md"
            return `/lessons/${lessonFile}`
          })

          // Preload first 3 lessons from current module
          for (const path of lessonFiles.slice(0, 3)) {
            await getFileContent(path, true)
            await new Promise(resolve => setTimeout(resolve, 200))
          }

          console.log(`Preloaded lessons for module ${moduleId}`)
        } catch (error) {
          console.warn('Module preloading failed:', error)
        }
      }, 1000)
    }

    preloadModuleLessons()
  }, [currentModule, currentView])
}

// Hook to intelligently preload next likely content
export const useIntelligentPreloader = (completedLessons, currentLesson) => {
  useEffect(() => {
    if (!currentLesson) return

    // Preload next lesson in sequence
    const preloadNextContent = async () => {
      setTimeout(async () => {
        try {
          const [moduleId, lessonIndex] = currentLesson.id.split('-').map(Number)

          // Get course data (should be available in context)
          // For now, we'll preload common next steps
          const commonNextSteps = [
            // Next lessons in sequence
            `/lessons/agents,_tools,_and_orchestrators_(what_actually_does_the_work).md`,
            `/lessons/prompting_systems_(tcrei)_and_evaluation_loops.md`,
            // Related cheat sheets
            `/lessons/ChatGPT_Cheat_Sheet.md`,
            `/lessons/Claude_Cheat_Sheet.md`
          ]

          for (const path of commonNextSteps.slice(0, 2)) {
            await getFileContent(path, true)
            await new Promise(resolve => setTimeout(resolve, 300))
          }

          console.log('Next content preloaded')
        } catch (error) {
          console.warn('Next content preloading failed:', error)
        }
      }, 1500)
    }

    preloadNextContent()
  }, [currentLesson, completedLessons])
}

// Utility to get cache statistics
export const useCacheStats = () => {
  const getStats = () => {
    return contentCache.getStats()
  }

  return { getStats }
}