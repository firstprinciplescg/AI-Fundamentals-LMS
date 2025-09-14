// Content caching system using browser storage
// Caches lesson content, cheat sheets, and other frequently accessed data

const CACHE_VERSION = 'v1'
const CACHE_PREFIX = 'ai-fundamentals-'
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

// Cache keys
const CACHE_KEYS = {
  LESSON_CONTENT: 'lesson-content',
  CHEAT_SHEETS: 'cheat-sheets',
  MATRICES: 'matrices',
  PROJECTS: 'projects'
}

class ContentCache {
  constructor() {
    this.memoryCache = new Map()
    this.init()
  }

  init() {
    // Clear old cache versions on init
    this.clearOldVersions()
  }

  // Generate cache key
  getCacheKey(type, identifier) {
    return `${CACHE_PREFIX}${CACHE_VERSION}-${type}-${identifier}`
  }

  // Check if cache entry is expired
  isExpired(timestamp) {
    return Date.now() - timestamp > CACHE_DURATION
  }

  // Get from memory cache first, then localStorage
  get(type, identifier) {
    const key = this.getCacheKey(type, identifier)

    // Check memory cache first (fastest)
    if (this.memoryCache.has(key)) {
      const entry = this.memoryCache.get(key)
      if (!this.isExpired(entry.timestamp)) {
        return entry.data
      }
      // Remove expired entry from memory
      this.memoryCache.delete(key)
    }

    // Check localStorage
    try {
      const stored = localStorage.getItem(key)
      if (stored) {
        const entry = JSON.parse(stored)
        if (!this.isExpired(entry.timestamp)) {
          // Store in memory for faster access
          this.memoryCache.set(key, entry)
          return entry.data
        }
        // Remove expired entry
        localStorage.removeItem(key)
      }
    } catch (error) {
      console.warn('Cache read error:', error)
    }

    return null
  }

  // Set in both memory and localStorage
  set(type, identifier, data) {
    const key = this.getCacheKey(type, identifier)
    const entry = {
      data,
      timestamp: Date.now()
    }

    // Store in memory
    this.memoryCache.set(key, entry)

    // Store in localStorage with error handling
    try {
      localStorage.setItem(key, JSON.stringify(entry))
    } catch (error) {
      // Handle localStorage quota exceeded
      if (error.name === 'QuotaExceededError') {
        console.warn('LocalStorage quota exceeded, clearing old cache entries')
        this.clearOldEntries()
        // Try again
        try {
          localStorage.setItem(key, JSON.stringify(entry))
        } catch (retryError) {
          console.warn('Unable to cache content:', retryError)
        }
      } else {
        console.warn('Cache write error:', error)
      }
    }
  }

  // Remove specific cache entry
  remove(type, identifier) {
    const key = this.getCacheKey(type, identifier)
    this.memoryCache.delete(key)
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.warn('Cache remove error:', error)
    }
  }

  // Clear all cache entries for current version
  clear() {
    // Clear memory cache
    this.memoryCache.clear()

    // Clear localStorage entries
    try {
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith(`${CACHE_PREFIX}${CACHE_VERSION}`)) {
          localStorage.removeItem(key)
        }
      })
    } catch (error) {
      console.warn('Cache clear error:', error)
    }
  }

  // Clear old cache versions
  clearOldVersions() {
    try {
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith(CACHE_PREFIX) && !key.startsWith(`${CACHE_PREFIX}${CACHE_VERSION}`)) {
          localStorage.removeItem(key)
        }
      })
    } catch (error) {
      console.warn('Old cache clear error:', error)
    }
  }

  // Clear oldest entries to free space
  clearOldEntries() {
    try {
      const entries = []
      const keys = Object.keys(localStorage)

      keys.forEach(key => {
        if (key.startsWith(`${CACHE_PREFIX}${CACHE_VERSION}`)) {
          try {
            const entry = JSON.parse(localStorage.getItem(key))
            entries.push({ key, timestamp: entry.timestamp })
          } catch (parseError) {
            // Remove corrupted entries
            localStorage.removeItem(key)
          }
        }
      })

      // Sort by timestamp (oldest first) and remove oldest half
      entries.sort((a, b) => a.timestamp - b.timestamp)
      const toRemove = entries.slice(0, Math.ceil(entries.length / 2))

      toRemove.forEach(({ key }) => {
        localStorage.removeItem(key)
        this.memoryCache.delete(key)
      })
    } catch (error) {
      console.warn('Old entries clear error:', error)
    }
  }

  // Get cache statistics
  getStats() {
    const memorySize = this.memoryCache.size
    let localStorageSize = 0

    try {
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith(`${CACHE_PREFIX}${CACHE_VERSION}`)) {
          localStorageSize++
        }
      })
    } catch (error) {
      console.warn('Stats error:', error)
    }

    return {
      memoryCache: memorySize,
      localStorage: localStorageSize,
      version: CACHE_VERSION
    }
  }
}

// Create singleton instance
export const contentCache = new ContentCache()

// Convenience methods for different content types
export const lessonCache = {
  get: (lessonId) => contentCache.get(CACHE_KEYS.LESSON_CONTENT, lessonId),
  set: (lessonId, content) => contentCache.set(CACHE_KEYS.LESSON_CONTENT, lessonId, content),
  remove: (lessonId) => contentCache.remove(CACHE_KEYS.LESSON_CONTENT, lessonId)
}

export const cheatSheetCache = {
  get: (sheetId) => contentCache.get(CACHE_KEYS.CHEAT_SHEETS, sheetId),
  set: (sheetId, content) => contentCache.set(CACHE_KEYS.CHEAT_SHEETS, sheetId, content),
  remove: (sheetId) => contentCache.remove(CACHE_KEYS.CHEAT_SHEETS, sheetId)
}

export const matrixCache = {
  get: (matrixId) => contentCache.get(CACHE_KEYS.MATRICES, matrixId),
  set: (matrixId, content) => contentCache.set(CACHE_KEYS.MATRICES, matrixId, content),
  remove: (matrixId) => contentCache.remove(CACHE_KEYS.MATRICES, matrixId)
}

export const projectsCache = {
  get: () => contentCache.get(CACHE_KEYS.PROJECTS, 'main'),
  set: (content) => contentCache.set(CACHE_KEYS.PROJECTS, 'main', content),
  remove: () => contentCache.remove(CACHE_KEYS.PROJECTS, 'main')
}

export default contentCache