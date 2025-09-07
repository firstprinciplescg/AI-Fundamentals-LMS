# AI Fundamentals LMS Setup Guide

This guide will walk you through setting up your AI Fundamentals LMS with user authentication and progress tracking.

## Prerequisites

- Node.js (version 16 or higher)
- A Supabase account (free tier is sufficient)

## Step 1: Supabase Setup

### 1.1 Create a Supabase Project
1. Go to [supabase.com](https://supabase.com) and create an account
2. Click "New Project"
3. Choose your organization
4. Enter project name: "ai-fundamentals-lms"
5. Enter a database password and save it securely
6. Select a region close to your users
7. Click "Create new project"

### 1.2 Set Up the Database
1. Once your project is created, go to the SQL Editor
2. Copy and paste the contents of `database-schema.sql` into the SQL editor
3. Click "Run" to create all the necessary tables and security policies

### 1.3 Get Your Project Credentials
1. Go to Settings > API
2. Copy your Project URL and anon public key
3. You'll need these for the next step

## Step 2: Environment Configuration

1. Create a `.env` file in the root directory
2. Copy the contents of `.env.example`
3. Replace the placeholder values with your Supabase credentials:

```env
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Step 3: Install Dependencies and Run

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

Your application should now be running at `http://localhost:5173`

## Step 4: Test the Application

1. **Sign Up**: Create a new account using the sign-up form
2. **Email Verification**: Check your email for a verification link (Supabase sends this automatically)
3. **Sign In**: Once verified, sign in with your credentials
4. **Explore**: Navigate through the course modules and lessons
5. **Progress Tracking**: Complete a lesson to test progress tracking

## Features

### Authentication
- ✅ User registration with email verification
- ✅ Secure login/logout
- ✅ Password reset functionality (built into Supabase)
- ✅ User profile management

### Course Management
- ✅ 8 modules with 31 total lessons
- ✅ Progress tracking per lesson
- ✅ Overall course progress visualization
- ✅ Cheat sheets and resources
- ✅ Capability matrices
- ✅ Project templates

### Data Persistence
- ✅ User progress stored in Supabase
- ✅ Real-time progress updates
- ✅ Cross-device synchronization
- ✅ Secure data with Row Level Security

## Deployment to Netlify

### Option 1: GitHub Integration (Recommended)
1. Push your code to a GitHub repository
2. Connect Netlify to your GitHub account
3. Select your repository
4. Set build command: `npm run build`
5. Set publish directory: `dist`
6. Add environment variables in Netlify dashboard
7. Deploy!

### Option 2: Manual Deploy
1. Run `npm run build`
2. Upload the `dist` folder to Netlify
3. Configure environment variables in Netlify dashboard

## Environment Variables for Production

In your Netlify dashboard, add these environment variables:
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key

## Supabase Configuration for Production

1. Go to Authentication > Settings in your Supabase dashboard
2. Add your production URL to "Site URL"
3. Add your domain to "Additional Redirect URLs" if needed

## Security Features

- Row Level Security (RLS) enabled on all tables
- Users can only access their own data
- Secure authentication with JWT tokens
- HTTPS-only cookies for auth tokens
- SQL injection protection through Supabase

## Troubleshooting

### Common Issues

**"Invalid API Key" Error**
- Check that your environment variables are set correctly
- Ensure there are no spaces around the values in your `.env` file

**"User not authenticated" Error**
- The user needs to verify their email before signing in
- Check the spam folder for the verification email

**Progress not saving**
- Ensure the database schema was created correctly
- Check browser console for any JavaScript errors

**Build fails on Netlify**
- Make sure all environment variables are set in Netlify
- Verify that the build command is `npm run build`

### Database Issues

If you need to reset the database:
1. Go to Supabase > Settings > Database
2. Click "Reset database" (WARNING: This deletes all data)
3. Re-run the database schema SQL

## Support

If you encounter any issues:
1. Check the browser console for errors
2. Verify your Supabase project is active
3. Ensure all environment variables are set correctly
4. Check that the database schema was created successfully

## Next Steps

Once your LMS is deployed, you can:
1. Customize the course content
2. Add more lessons and modules
3. Implement user analytics
4. Add payment integration
5. Create admin dashboard for course management

Your AI Fundamentals LMS is now ready for production!