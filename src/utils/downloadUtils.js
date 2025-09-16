/**
 * Download a file from the public directory
 * @param {string} fileName - Name of the file to download
 * @param {string} displayName - Display name for the downloaded file
 */
export const downloadFile = async (fileName, displayName = null) => {
  try {
    const response = await fetch(`/lessons/${fileName}`)
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.statusText}`)
    }

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = displayName || fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Download failed:', error)
    throw error
  }
}

/**
 * Download multiple files as a zip
 * @param {Array} files - Array of {fileName, displayName} objects
 * @param {string} zipName - Name of the zip file
 */
export const downloadMultipleFiles = async (files, zipName = 'course-resources.zip') => {
  // For now, download files individually
  // In the future, could implement actual zip functionality with JSZip
  for (const file of files) {
    try {
      await downloadFile(file.fileName, file.displayName)
    } catch (error) {
      console.error(`Failed to download ${file.fileName}:`, error)
    }
  }
}

/**
 * Create and download a progress report as CSV
 * @param {Set} completedLessons - Set of completed lesson IDs
 * @param {Object} courseData - Course data object
 */
export const downloadProgressReport = (completedLessons, courseData) => {
  const csvContent = generateProgressCSV(completedLessons, courseData)
  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `progress-report-${new Date().toISOString().split('T')[0]}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

/**
 * Generate CSV content for progress report
 */
const generateProgressCSV = (completedLessons, courseData) => {
  const headers = ['Module', 'Lesson', 'Status', 'Completion Date']
  const rows = [headers.join(',')]

  courseData.modules.forEach((module, moduleIndex) => {
    module.lessons_list.forEach((lesson, lessonIndex) => {
      const lessonId = `${module.id}-${lessonIndex}`
      const isCompleted = completedLessons.has(lessonId)
      const status = isCompleted ? 'Completed' : 'Not Started'
      const completionDate = isCompleted ? new Date().toLocaleDateString() : ''

      rows.push([
        `"Module ${module.id}: ${module.title}"`,
        `"${lesson}"`,
        status,
        completionDate
      ].join(','))
    })
  })

  return rows.join('\n')
}