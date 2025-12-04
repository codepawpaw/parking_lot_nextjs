# Vercel Deployment Guide

This guide will help you deploy your Parking Lot Management App to Vercel.

## Prerequisites

1. A [Vercel account](https://vercel.com/signup)
2. Your project connected to a Git repository (GitHub, GitLab, or Bitbucket)
3. Supabase project set up with your database

## Environment Variables

Before deploying, you need to set up environment variables in Vercel:

1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add the following variables:

### Required Environment Variables

| Variable Name | Description | Example |
|---------------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | `https://your-project-id.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

### How to get Supabase credentials:

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to Settings → API
4. Copy the Project URL and anon/public key

## Deployment Methods

### Method 1: Deploy via Vercel Dashboard (Recommended)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your Git repository
4. Vercel will automatically detect it's a Next.js project
5. Add your environment variables
6. Click "Deploy"

### Method 2: Deploy via Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy from your project directory:
   ```bash
   vercel
   ```

4. Follow the prompts and set up environment variables when asked

### Method 3: Deploy with Git Integration

1. Connect your GitHub/GitLab/Bitbucket repository to Vercel
2. Push your code to the main branch
3. Vercel will automatically deploy on every push

## Configuration

The project includes a `vercel.json` configuration file with:

- **Framework**: Next.js
- **Build Command**: `npm run build`
- **Region**: Singapore (sin1) - change if needed
- **Environment Variables**: Configured for Supabase
- **CORS Headers**: Set up for API routes
- **Function Runtime**: Node.js for API routes

### Customizing vercel.json

You can modify `vercel.json` to:

- Change deployment region: Update the `regions` array
- Add custom headers or redirects
- Configure function settings
- Set up aliases or domains

## Database Setup

Make sure your Supabase database is properly set up:

1. Run the SQL schema from `database-schema.sql`
2. Set up Row Level Security (RLS) policies if needed
3. Configure authentication settings in Supabase

## Post-Deployment Checklist

After successful deployment:

- [ ] Test all functionality on the live site
- [ ] Verify database connections are working
- [ ] Check that authentication flows work correctly
- [ ] Test API endpoints
- [ ] Verify environment variables are correctly set
- [ ] Set up custom domain if needed
- [ ] Configure any necessary redirects

## Troubleshooting

### Common Issues:

1. **"Missing public directory" Error**:
   - Ensure you have a `public` directory in your project root
   - This directory is required by Next.js for static assets
   - If missing, create it: `mkdir public`

2. **Build Failures**:
   - Check environment variables are set correctly
   - Ensure all dependencies are listed in package.json
   - Check for TypeScript errors

3. **Database Connection Issues**:
   - Verify Supabase URL and keys
   - Check Supabase project is active
   - Ensure database schema is applied

4. **Authentication Problems**:
   - Verify redirect URLs in Supabase Auth settings
   - Add your Vercel domain to allowed origins

### Getting Help

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Supabase Documentation](https://supabase.com/docs)

## Custom Domain Setup (Optional)

To set up a custom domain:

1. Go to your Vercel project dashboard
2. Go to Settings → Domains
3. Add your custom domain
4. Follow DNS configuration instructions
5. Wait for SSL certificate provisioning

Your app will be available at `https://your-custom-domain.com`
