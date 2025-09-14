# Production Setup Guide for AI Fundamentals LMS

## Overview
This guide will walk you through setting up the AI Fundamentals LMS for production deployment with full functionality including user authentication, content management, and database storage.

## Prerequisites
- GitHub account (for repository)
- Netlify account (for hosting)
- Supabase account (free tier is sufficient)

## Step 1: Create Supabase Project

### 1.1 Sign up for Supabase
1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up with GitHub or email

### 1.2 Create New Project
1. Click "New Project"
2. Fill in project details:
   - **Name**: `ai-fundamentals-lms`
   - **Database Password**: Generate a strong password (save this!)
   - **Region**: Choose closest to your users
   - **Plan**: Free tier is fine to start

3. Wait for project to initialize (takes ~2 minutes)

### 1.3 Get Your API Keys
Once project is ready:
1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL**: `https://[your-project-id].supabase.co`
   - **Anon/Public Key**: `eyJ...` (long string)
   - Save these for Step 3

## Step 2: Initialize Database

### 2.1 Run Database Setup
1. In Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy and paste the SQL from `docs/database-init.sql` (see file below)
4. Click **Run** to execute

### 2.2 Configure Storage
1. Go to **Storage** in Supabase dashboard
2. Click **New Bucket**
3. Create bucket named `media` with:
   - Public bucket: ✅ (check this)
   - File size limit: 50MB
   - Allowed MIME types: `image/*,application/pdf,video/*`

### 2.3 Set up Authentication
1. Go to **Authentication** → **Providers**
2. Ensure **Email** is enabled
3. Configure email templates if desired (optional)

## Step 3: Configure Netlify Environment

### 3.1 Connect Repository
1. Log into [Netlify](https://app.netlify.com)
2. Click **Add new site** → **Import an existing project**
3. Connect to GitHub and select your repository
4. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`

### 3.2 Set Environment Variables
1. In Netlify, go to **Site settings** → **Environment variables**
2. Add these variables:

```
VITE_DEV_MODE=false
VITE_SUPABASE_URL=https://[your-project-id].supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...[your-anon-key]
```

### 3.3 Deploy
1. Go to **Deploys** tab
2. Click **Trigger deploy** → **Deploy site**
3. Wait for build to complete (~2-3 minutes)

## Step 4: Create Admin User

### 4.1 Register First User
1. Visit your deployed site
2. Click **Sign Up** and create account
3. Verify email if required

### 4.2 Grant Admin Access
1. Go to Supabase dashboard → **Table Editor**
2. Open `user_roles` table
3. Click **Insert row**:
   - `user_id`: [copy from auth.users table]
   - `role`: `admin`
   - `created_at`: (auto-filled)

## Step 5: Import Initial Content (Optional)

### 5.1 Using the CMS
1. Log into your site as admin
2. Navigate to **Content Management**
3. Use the interface to create courses, modules, and lessons

### 5.2 Bulk Import
If you have existing content:
1. Use the SQL Editor in Supabase
2. Import data using the provided migration scripts

## Step 6: Configure Custom Domain (Optional)

### 6.1 Add Domain in Netlify
1. Go to **Domain settings**
2. Click **Add custom domain**
3. Follow DNS configuration instructions

## Troubleshooting

### Site Shows "Loading..." Indefinitely
- Check browser console for errors (F12)
- Verify Supabase credentials in Netlify env vars
- Ensure `VITE_DEV_MODE=false` in production

### Authentication Not Working
- Verify Supabase URL and anon key are correct
- Check that email provider is enabled in Supabase
- Ensure user has confirmed email if required

### Content Not Saving
- Check user has admin role in `user_roles` table
- Verify RLS policies are properly configured
- Check browser console for API errors

### Database Connection Issues
- Verify Supabase project is active (not paused)
- Check that all environment variables are set correctly
- Ensure database schema is properly initialized

## Security Checklist

- [ ] Change `VITE_DEV_MODE` to `false` in production
- [ ] Set strong database password in Supabase
- [ ] Configure Row Level Security (RLS) policies
- [ ] Enable email confirmation for new users
- [ ] Set up proper CORS configuration if needed
- [ ] Regular database backups enabled

## Performance Optimization

1. **Enable Caching**: Already configured in application
2. **CDN Setup**: Netlify provides CDN automatically
3. **Image Optimization**: Use Supabase Storage transformations
4. **Database Indexes**: Created automatically with schema

## Monitoring

1. **Netlify Analytics**: Available in dashboard
2. **Supabase Metrics**: Check database performance
3. **Error Tracking**: Consider adding Sentry (optional)

## Support

For issues specific to:
- **Deployment**: Check Netlify logs
- **Database**: Check Supabase logs
- **Application**: Check browser console

## Next Steps

After successful deployment:
1. Create content through the CMS
2. Invite other admin users
3. Monitor usage and performance
4. Set up regular backups
5. Consider upgrading plans as needed

---

## Quick Start Commands

```bash
# Local development
npm install
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Deploy to Netlify (if CLI installed)
netlify deploy --prod
```

## Environment Variables Summary

| Variable | Development | Production |
|----------|------------|------------|
| VITE_DEV_MODE | true | false |
| VITE_SUPABASE_URL | demo/local URL | Your Supabase URL |
| VITE_SUPABASE_ANON_KEY | demo/local key | Your Supabase anon key |

Remember to never commit real credentials to your repository!