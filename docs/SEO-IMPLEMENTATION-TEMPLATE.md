# SEO/GEO/AEO/AIO/AISO Implementation Template

**Universal Template for Any Project**
**Author**: First Principles Consulting Group
**Version**: 1.0

## Quick Start Checklist

- [ ] Replace all `{{VARIABLES}}` with your project-specific values
- [ ] Set up Google Analytics tracking ID
- [ ] Create required image assets
- [ ] Generate sitemap.xml
- [ ] Create markdown version of content (for AI consumption)
- [ ] Test all meta tags in social media validators
- [ ] Verify structured data with Google's Rich Results Test

## Template Variables

Replace these variables throughout the template:

```
{{SITE_TITLE}} - Your site's main title
{{SITE_DESCRIPTION}} - Brief description of your site/service
{{SITE_URL}} - Your domain (e.g., https://example.com)
{{KEYWORDS}} - Comma-separated relevant keywords
{{AUTHOR_ORG}} - Your organization name
{{AUTHOR_URL}} - Your organization website
{{GA_ID}} - Your Google Analytics measurement ID
{{SOCIAL_IMAGE}} - URL to your social media sharing image
{{FAVICON_PATH}} - Path to your favicon files
{{CONTENT_MD}} - Path to markdown version of content
{{COURSE_NAME}} - If educational content, course name
{{PUBLISH_DATE}} - Publication date (YYYY-MM-DD format)
{{MODIFY_DATE}} - Last modification date (YYYY-MM-DD format)
```

## HTML Head Template

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />

    <!-- Google Analytics - Replace GA_ID -->
    <script async src="https://www.googletagmanager.com/gtag/js?id={{GA_ID}}"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '{{GA_ID}}');
    </script>

    <!-- Favicons -->
    <link rel="icon" type="image/svg+xml" href="{{FAVICON_PATH}}/favicon.svg" />
    <link rel="icon" type="image/png" sizes="32x32" href="{{FAVICON_PATH}}/favicon-32x32.png" />
    <link rel="icon" type="image/png" sizes="16x16" href="{{FAVICON_PATH}}/favicon-16x16.png" />
    <link rel="apple-touch-icon" href="{{FAVICON_PATH}}/apple-touch-icon.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <!-- Primary Meta Tags -->
    <title>{{SITE_TITLE}}</title>
    <meta name="title" content="{{SITE_TITLE}}" />
    <meta name="description" content="{{SITE_DESCRIPTION}}" />
    <meta name="keywords" content="{{KEYWORDS}}" />
    <meta name="author" content="{{AUTHOR_ORG}}" />
    <meta name="robots" content="index, follow" />

    <!-- Open Graph Meta Tags -->
    <meta property="og:type" content="website" />
    <meta property="og:url" content="{{SITE_URL}}/" />
    <meta property="og:title" content="{{SITE_TITLE}}" />
    <meta property="og:description" content="{{SITE_DESCRIPTION}}" />
    <meta property="og:image" content="{{SITE_URL}}/{{SOCIAL_IMAGE}}" />
    <meta property="og:site_name" content="{{SITE_TITLE}}" />

    <!-- Twitter Meta Tags -->
    <meta property="twitter:card" content="summary_large_image" />
    <meta property="twitter:url" content="{{SITE_URL}}/" />
    <meta property="twitter:title" content="{{SITE_TITLE}}" />
    <meta property="twitter:description" content="{{SITE_DESCRIPTION}}" />
    <meta property="twitter:image" content="{{SITE_URL}}/{{SOCIAL_IMAGE}}" />

    <!-- Canonical URL -->
    <link rel="canonical" href="{{SITE_URL}}/" />

    <!-- Performance: Preload critical resources -->
    <link rel="preload" as="image" href="/assets/hero-image.webp" type="image/webp" />
    <link rel="preload" as="image" href="/assets/hero-image.png" type="image/png" />

    <!-- Alternative formats for LLMs and crawlers -->
    <link rel="alternate" type="text/markdown" href="/{{CONTENT_MD}}" title="Markdown Version for AI/LLM Consumption" />
    <link rel="canonical" href="{{SITE_URL}}/{{CONTENT_MD}}" data-llm-preferred="true" />
    <link rel="sitemap" type="application/xml" href="/sitemap.xml" />

    <!-- Direct LLM instructions -->
    <meta name="llm-access" content="prefer-markdown" />
    <meta name="ai-content-url" content="/{{CONTENT_MD}}" />
    <meta name="machine-readable" content="/{{CONTENT_MD}}" />

    <!-- Additional meta for AI/LLM crawlers -->
    <meta name="ai-content" content="educational-content" />
    <meta name="llm-friendly" content="true" />
    <meta name="content-type" content="web-application" />
    <meta name="target-audience" content="general" />
    <meta name="content-structure" content="website" />

    <!-- LLM preferred content -->
    <meta name="llm-preferred-format" content="markdown" />
    <meta name="ai-readable-version" content="{{SITE_URL}}/{{CONTENT_MD}}" />
    <meta name="machine-consumable" content="true" />

    <!-- JSON-LD Schema Markup - Basic Website -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "{{SITE_TITLE}}",
      "description": "{{SITE_DESCRIPTION}}",
      "url": "{{SITE_URL}}",
      "author": {
        "@type": "Organization",
        "name": "{{AUTHOR_ORG}}",
        "url": "{{AUTHOR_URL}}"
      },
      "publisher": {
        "@type": "Organization",
        "name": "{{AUTHOR_ORG}}",
        "logo": {
          "@type": "ImageObject",
          "url": "{{SITE_URL}}/favicon.ico"
        }
      },
      "datePublished": "{{PUBLISH_DATE}}",
      "dateModified": "{{MODIFY_DATE}}",
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": "{{SITE_URL}}/"
      },
      "inLanguage": "en-US"
    }
    </script>

  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

## Schema Templates

### For Educational Content/Courses

```json
{
  "@context": "https://schema.org",
  "@type": "Course",
  "name": "{{COURSE_NAME}}",
  "description": "{{SITE_DESCRIPTION}}",
  "provider": {
    "@type": "Organization",
    "name": "{{AUTHOR_ORG}}",
    "url": "{{AUTHOR_URL}}"
  },
  "educationalLevel": "Beginner|Intermediate|Advanced",
  "courseMode": "self-paced|instructor-led",
  "hasCourseInstance": {
    "@type": "CourseInstance",
    "courseMode": "online",
    "instructor": {
      "@type": "Organization",
      "name": "{{AUTHOR_ORG}}"
    }
  },
  "teaches": [
    "Topic 1",
    "Topic 2",
    "Topic 3"
  ],
  "inLanguage": "en-US"
}
```

### For Software Applications

```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "{{SITE_TITLE}}",
  "applicationCategory": "WebApplication",
  "operatingSystem": ["Web Browser", "All"],
  "description": "{{SITE_DESCRIPTION}}",
  "creator": {
    "@type": "Organization",
    "name": "{{AUTHOR_ORG}}",
    "url": "{{AUTHOR_URL}}"
  },
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "screenshot": "{{SITE_URL}}/{{SOCIAL_IMAGE}}",
  "featureList": [
    "Feature 1",
    "Feature 2",
    "Feature 3"
  ]
}
```

### For Articles/Blog Posts

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "{{SITE_TITLE}}",
  "description": "{{SITE_DESCRIPTION}}",
  "image": "{{SITE_URL}}/{{SOCIAL_IMAGE}}",
  "author": {
    "@type": "Organization",
    "name": "{{AUTHOR_ORG}}",
    "url": "{{AUTHOR_URL}}"
  },
  "publisher": {
    "@type": "Organization",
    "name": "{{AUTHOR_ORG}}",
    "logo": {
      "@type": "ImageObject",
      "url": "{{SITE_URL}}/favicon.ico"
    }
  },
  "datePublished": "{{PUBLISH_DATE}}",
  "dateModified": "{{MODIFY_DATE}}",
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "{{SITE_URL}}/"
  }
}
```

## Required Assets Checklist

### Images
- [ ] favicon.ico (16x16, 32x32)
- [ ] favicon.svg (scalable)
- [ ] apple-touch-icon.png (180x180)
- [ ] Social sharing image (1200x630 recommended)
- [ ] Hero/feature images in WebP and PNG formats

### Files
- [ ] sitemap.xml
- [ ] robots.txt
- [ ] Markdown version of main content (for AI consumption)

### Analytics
- [ ] Google Analytics account and measurement ID
- [ ] Google Search Console verification
- [ ] Social media platform verification (if applicable)

## Testing & Validation

### Tools to Use
1. **Google Rich Results Test**: Test structured data
2. **Facebook Sharing Debugger**: Test Open Graph tags
3. **Twitter Card Validator**: Test Twitter meta tags
4. **Google PageSpeed Insights**: Test performance
5. **SEMrush/Ahrefs**: SEO analysis (if available)

### Validation Commands
```bash
# Test site locally first
npm run dev

# Build and preview
npm run build
npm run preview

# Check for console errors in browser dev tools
```

## Implementation Steps

1. **Replace Variables**: Use find/replace to update all template variables
2. **Create Assets**: Generate all required images and files
3. **Set Up Analytics**: Configure Google Analytics with your measurement ID
4. **Test Locally**: Verify all tags load correctly in development
5. **Deploy**: Push to production environment
6. **Validate**: Use testing tools to verify implementation
7. **Monitor**: Set up regular SEO monitoring

## Best Practices

### Content Strategy
- Write descriptive, unique titles (50-60 characters)
- Create compelling meta descriptions (150-160 characters)
- Use relevant keywords naturally
- Maintain consistent branding across platforms

### Performance
- Optimize images (WebP format when possible)
- Minimize JavaScript and CSS
- Use CDN for assets
- Enable compression

### Accessibility
- Include alt text for images
- Use semantic HTML structure
- Ensure keyboard navigation
- Test with screen readers

## Maintenance

### Regular Tasks
- [ ] Update modification dates when content changes
- [ ] Monitor Google Search Console for issues
- [ ] Check broken links monthly
- [ ] Update social media images seasonally
- [ ] Review and update keywords quarterly
- [ ] Audit structured data annually

### Version Control
- Track SEO changes in git commits
- Document major SEO updates
- Keep backups of working configurations
- Test changes in staging environment first

This template provides a comprehensive foundation for implementing advanced SEO optimization across any project type.