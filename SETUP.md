# Parking Lot Management System - Complete Setup Guide

## Step 1: Supabase Setup

### 1.1 Create Supabase Account
1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project" and sign up/sign in
3. Click "New Project"
4. Choose your organization
5. Fill in project details:
   - **Name**: `parking-lot-management`
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Choose closest to your location
6. Click "Create new project"
7. Wait for the project to be created (2-3 minutes)

### 1.2 Get API Keys
1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://your-project-id.supabase.co`)
   - **anon public key** (starts with `eyJ...`)

### 1.3 Set Up Database
1. In Supabase dashboard, go to **SQL Editor**
2. Copy the entire content from `database-schema.sql` file
3. Paste it in the SQL Editor
4. Click "Run" to execute the schema
5. Verify tables are created by going to **Table Editor**

## Step 2: Environment Configuration

### 2.1 Create Environment File
1. In your project root, copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` and replace with your actual values:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

## Step 3: Install Dependencies and Run

### 3.1 Install Node.js (if not installed)
1. Download Node.js from [https://nodejs.org](https://nodejs.org) (LTS version)
2. Install following the installer instructions
3. Verify installation:
   ```bash
   node --version
   npm --version
   ```

### 3.2 Install Project Dependencies
```bash
npm install
```

### 3.3 Run Development Server
```bash
npm run dev
```

The application should now be running at `http://localhost:3000`

## Step 4: Test the Application

### 4.1 Register as Building Owner
1. Go to `http://localhost:3000`
2. Click "Register"
3. Select "Building Owner"
4. Enter your name
5. Generate or enter a Card ID
6. Click "Register"

### 4.2 Create a Building
1. Login with your Building Owner account
2. Click "Building Owner Dashboard"
3. Click "Create New Building"
4. Fill in building details:
   - Name: "Test Building"
   - Capacity: 20
   - Floors: 2
5. Click "Create Building"

### 4.3 Register as Car Owner
1. Open new incognito/private window
2. Go to `http://localhost:3000`
3. Click "Register"
4. Select "Car Owner"
5. Enter your name
6. Add vehicle plate number (e.g., "ABC-123")
7. Generate Card ID
8. Click "Register"

### 4.4 Test Parking Flow
1. Login as Car Owner
2. Click on "Test Building"
3. Select an available parking spot
4. Choose your vehicle
5. Click "Book Spot"
6. Save the unique code provided
7. Test releasing by clicking "Release Spot" and entering the code

## Step 5: Deployment to Vercel

### 5.1 Push to GitHub
1. Initialize git repository:
   ```bash
   git init
   git add .
   git commit -m "Initial parking lot app"
   ```
2. Create repository on GitHub
3. Push code to GitHub:
   ```bash
   git remote add origin https://github.com/yourusername/parking-lot-app.git
   git push -u origin main
   ```

### 5.2 Deploy on Vercel
1. Go to [https://vercel.com](https://vercel.com)
2. Sign up/login with GitHub
3. Click "Import Project"
4. Select your parking lot repository
5. Configure environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key
6. Click "Deploy"

## Troubleshooting

### Common Issues

#### 1. "Invalid API key" Error
- **Cause**: Environment variables not set or incorrect
- **Solution**: 
  - Check `.env.local` file exists and has correct values
  - Restart development server after adding environment variables
  - Verify API keys are correct in Supabase dashboard

#### 2. Database Connection Error
- **Cause**: Database schema not created
- **Solution**: Run the SQL commands from `database-schema.sql` in Supabase SQL Editor

#### 3. TypeScript Errors
- **Cause**: Missing dependencies or type declarations
- **Solution**: 
  - Run `npm install` to install all dependencies
  - If using different Node.js version, try `rm -rf node_modules package-lock.json && npm install`

#### 4. Build Errors on Vercel
- **Cause**: Environment variables not set in Vercel
- **Solution**: Add environment variables in Vercel dashboard under Settings → Environment Variables

### Sample Data
The database schema includes sample buildings and spots. You can:
- View "Main Building", "East Wing", "West Wing" in the buildings list
- Each building has pre-generated parking spots
- Test the full parking flow with these sample buildings

### Security Notes
- The `.env.local` file is ignored by git (safe)
- Never commit real API keys to version control
- Use environment variables for all sensitive configuration

## Support
If you encounter any issues, please check:
1. All environment variables are correctly set
2. Supabase project is active and database schema is created
3. Dependencies are properly installed
4. Development server is running on the correct port

The application should now be fully functional with user registration, building management, parking spot booking, and real-time metrics!
