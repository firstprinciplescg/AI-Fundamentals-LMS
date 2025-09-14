# Content Management System - Database Schema

## Overview

This schema design extends the existing Supabase database to support a full-featured CMS while maintaining backward compatibility with the current hardcoded course structure.

## Database Tables

### 1. `courses` (Course Management)
```sql
CREATE TABLE courses (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  subtitle TEXT,
  description TEXT,
  slug VARCHAR(100) UNIQUE NOT NULL,
  total_lessons INTEGER DEFAULT 0,
  total_modules INTEGER DEFAULT 0,
  featured_image_url TEXT,
  status VARCHAR(20) DEFAULT 'draft', -- draft, published, archived
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);
```

### 2. `modules` (Module Management)
```sql
CREATE TABLE modules (
  id SERIAL PRIMARY KEY,
  course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  slug VARCHAR(100) NOT NULL,
  order_index INTEGER NOT NULL,
  lessons_count INTEGER DEFAULT 0,
  color VARCHAR(50), -- CSS class or hex color
  icon_name VARCHAR(50), -- Icon component name
  status VARCHAR(20) DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  UNIQUE(course_id, slug),
  UNIQUE(course_id, order_index)
);
```

### 3. `lessons` (Lesson Management)
```sql
CREATE TABLE lessons (
  id SERIAL PRIMARY KEY,
  module_id INTEGER REFERENCES modules(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  description TEXT,
  content TEXT, -- Markdown content
  order_index INTEGER NOT NULL,
  estimated_duration INTEGER, -- minutes
  difficulty_level VARCHAR(20), -- beginner, intermediate, advanced
  prerequisites TEXT[], -- Array of prerequisite lesson IDs or topics
  learning_objectives TEXT[],
  featured_image_url TEXT,
  video_url TEXT,
  status VARCHAR(20) DEFAULT 'draft',
  version INTEGER DEFAULT 1,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  UNIQUE(module_id, slug),
  UNIQUE(module_id, order_index)
);
```

### 4. `lesson_versions` (Content Versioning)
```sql
CREATE TABLE lesson_versions (
  id SERIAL PRIMARY KEY,
  lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  description TEXT,
  change_summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(lesson_id, version_number)
);
```

### 5. `media_assets` (File Management)
```sql
CREATE TABLE media_assets (
  id SERIAL PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  original_filename VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL, -- Supabase Storage path
  file_size INTEGER,
  mime_type VARCHAR(100),
  alt_text TEXT,
  caption TEXT,
  tags TEXT[],
  usage_context VARCHAR(50), -- lesson, module, course, general
  referenced_by_id INTEGER, -- ID of the content using this asset
  referenced_by_type VARCHAR(20), -- lesson, module, course
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 6. `content_tags` (Content Organization)
```sql
CREATE TABLE content_tags (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  color VARCHAR(7), -- Hex color code
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE lesson_tags (
  lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
  tag_id INTEGER REFERENCES content_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (lesson_id, tag_id)
);
```

### 7. `user_roles` (Admin Access Control)
```sql
CREATE TABLE user_roles (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) UNIQUE,
  role VARCHAR(50) NOT NULL DEFAULT 'student', -- student, instructor, admin, super_admin
  permissions TEXT[], -- Array of permission strings
  assigned_by UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);
```

### 8. `content_history` (Audit Trail)
```sql
CREATE TABLE content_history (
  id SERIAL PRIMARY KEY,
  content_type VARCHAR(20) NOT NULL, -- course, module, lesson
  content_id INTEGER NOT NULL,
  action VARCHAR(50) NOT NULL, -- created, updated, deleted, published, archived
  old_values JSONB,
  new_values JSONB,
  user_id UUID REFERENCES auth.users(id),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Row Level Security (RLS) Policies

### Courses
```sql
-- Enable RLS
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- Students can read published courses
CREATE POLICY "Students can read published courses" ON courses
  FOR SELECT USING (status = 'published');

-- Admins can do everything
CREATE POLICY "Admins can manage all courses" ON courses
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );
```

### Modules & Lessons
```sql
-- Similar policies for modules and lessons
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

-- Students can read published content
CREATE POLICY "Students can read published modules" ON modules
  FOR SELECT USING (
    status = 'published' AND
    EXISTS (SELECT 1 FROM courses WHERE id = course_id AND status = 'published')
  );

CREATE POLICY "Students can read published lessons" ON lessons
  FOR SELECT USING (
    status = 'published' AND
    EXISTS (
      SELECT 1 FROM modules m
      JOIN courses c ON m.course_id = c.id
      WHERE m.id = module_id
      AND m.status = 'published'
      AND c.status = 'published'
    )
  );
```

### Admin-only Tables
```sql
-- Content management tables - admin only
ALTER TABLE lesson_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins only" ON lesson_versions FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'super_admin')
  )
);

-- Similar policies for media_assets and content_history
```

## Database Functions

### Auto-update lesson count
```sql
CREATE OR REPLACE FUNCTION update_module_lesson_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE modules
  SET lessons_count = (
    SELECT COUNT(*) FROM lessons
    WHERE module_id = COALESCE(NEW.module_id, OLD.module_id)
    AND status = 'published'
  )
  WHERE id = COALESCE(NEW.module_id, OLD.module_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_lesson_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON lessons
  FOR EACH ROW EXECUTE FUNCTION update_module_lesson_count();
```

### Auto-update course totals
```sql
CREATE OR REPLACE FUNCTION update_course_totals()
RETURNS TRIGGER AS $$
DECLARE
  course_id_to_update INTEGER;
BEGIN
  -- Get course ID from module
  SELECT course_id INTO course_id_to_update
  FROM modules
  WHERE id = COALESCE(NEW.module_id, OLD.module_id);

  -- Update course totals
  UPDATE courses
  SET
    total_modules = (
      SELECT COUNT(*) FROM modules
      WHERE course_id = course_id_to_update AND status = 'published'
    ),
    total_lessons = (
      SELECT COUNT(*) FROM lessons l
      JOIN modules m ON l.module_id = m.id
      WHERE m.course_id = course_id_to_update
      AND l.status = 'published' AND m.status = 'published'
    )
  WHERE id = course_id_to_update;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;
```

## Migration Strategy

### Phase 1: Create Tables
1. Run table creation scripts
2. Set up RLS policies
3. Create database functions and triggers

### Phase 2: Data Migration
1. Create initial course from hardcoded data
2. Import existing modules and lessons
3. Set up admin user roles

### Phase 3: API Integration
1. Extend Supabase helpers in `src/lib/supabase.js`
2. Create CMS-specific API functions
3. Update caching system to work with dynamic content

## API Interface Design

### Supabase Helpers Extension
```javascript
// src/lib/supabase.js additions
export const cms = {
  courses: {
    getAll: () => supabase.from('courses').select('*').eq('status', 'published'),
    getById: (id) => supabase.from('courses').select('*').eq('id', id).single(),
    create: (courseData) => supabase.from('courses').insert(courseData).select(),
    update: (id, updates) => supabase.from('courses').update(updates).eq('id', id).select(),
    delete: (id) => supabase.from('courses').delete().eq('id', id)
  },
  modules: {
    getByCourse: (courseId) => supabase.from('modules').select('*').eq('course_id', courseId).eq('status', 'published').order('order_index'),
    // ... similar CRUD operations
  },
  lessons: {
    getByModule: (moduleId) => supabase.from('lessons').select('*').eq('module_id', moduleId).eq('status', 'published').order('order_index'),
    // ... similar CRUD operations
  }
}
```

This schema provides a robust foundation for the CMS while maintaining compatibility with existing user progress tracking and authentication systems.