import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"
import { contentCache } from './contentCache.js'

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}


// Error handling wrapper for async operations
export async function safeAsync(fn, fallback = null) {
  try {
    return await fn();
  } catch (error) {
    console.error('Async operation failed:', error);
    return fallback;
  }
}

// Fetch content with caching and error handling
export async function getFileContent(path, useCache = true) {
  // Generate cache key from path
  const cacheKey = path.replace(/[^a-zA-Z0-9]/g, '-')

  // Try cache first if enabled
  if (useCache) {
    const cached = contentCache.get('content', cacheKey)
    if (cached) {
      return cached
    }
  }

  try {
    const response = await fetch(path);

    if (!response.ok) {
      // Handle specific error cases
      if (response.status === 404) {
        const errorContent = `# Content Not Found\n\nThe requested lesson content could not be found. Please check if the file exists at: ${path}`;
        // Don't cache error responses
        return errorContent;
      }

      throw new Error(`Failed to load content: ${response.status} ${response.statusText}`);
    }

    const content = await response.text();

    // Check if content is empty
    if (!content || content.trim() === '') {
      const emptyContent = `# No Content Available\n\nThis lesson appears to be empty. Content may be added soon.`;
      // Don't cache empty content
      return emptyContent;
    }

    // Cache successful content
    if (useCache) {
      contentCache.set('content', cacheKey, content)
    }

    return content;
  } catch (error) {
    console.error(`Error loading content from ${path}:`, error);

    // Return user-friendly error message (don't cache)
    return `# Error Loading Content\n\nWe're having trouble loading this content. Please try refreshing the page.\n\n**Technical details:** ${error.message}`;
  }
}

// Validate email format
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate password strength
export function validatePassword(password) {
  const errors = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return errors;
}

// Format error messages for display
export function formatErrorMessage(error) {
  // Handle different error types
  if (typeof error === 'string') {
    return error;
  }

  if (error?.message) {
    // Clean up technical error messages for users
    const message = error.message;

    // Common error replacements
    if (message.includes('NetworkError') || message.includes('fetch')) {
      return 'Connection error. Please check your internet connection and try again.';
    }

    if (message.includes('401') || message.includes('unauthorized')) {
      return 'You need to be logged in to access this content.';
    }

    if (message.includes('403') || message.includes('forbidden')) {
      return 'You don\'t have permission to access this content.';
    }

    if (message.includes('500') || message.includes('server')) {
      return 'Server error. Please try again later.';
    }

    return message;
  }

  return 'An unexpected error occurred. Please try again.';
}

// Retry mechanism for failed operations
export async function retryOperation(fn, maxRetries = 3, delay = 1000) {
  let lastError;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry on client errors (4xx)
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        throw error;
      }

      // Wait before retrying (exponential backoff)
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }
  }

  throw lastError;
}

