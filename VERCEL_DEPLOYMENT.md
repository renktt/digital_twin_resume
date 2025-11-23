# 🚀 Deploying to Vercel

✅ **BUILD SUCCESSFUL!** All deployment issues have been fixed.

This guide will help you deploy your Advanced Digital Twin Portfolio System with Google OAuth to Vercel.

## ✅ Issues Fixed

1. ✅ NextAuth route export issue - Moved authOptions to separate file
2. ✅ TypeScript type errors - Added NextAuth type definitions
3. ✅ Prisma build errors - Removed unnecessary Prisma generation
4. ✅ Static generation errors - Added dynamic route configuration
5. ✅ Suspense boundary - Wrapped useSearchParams in Suspense
6. ✅ **Upstash Vector build error** - Implemented lazy initialization to prevent build-time environment variable access

## Prerequisites
- GitHub account with the repository pushed
- Vercel account (sign up at https://vercel.com)
- Google OAuth credentials configured (already set up)

## Deployment Steps

### 1. Connect to Vercel

1. Go to https://vercel.com/
2. Click **"Add New Project"**
3. Click **"Import Git Repository"**
4. Select your **renktt/rresume** repository
5. Click **"Import"**

### 2. Configure Environment Variables

In the Vercel project settings, add these environment variables:

**Copy ALL values from your `.env.local` file:**

```env
# Groq AI (for chatbot)
GROQ_API_KEY=your-groq-api-key-from-env-local

# Upstash Vector Database
UPSTASH_VECTOR_REST_URL=your-upstash-url-from-env-local
UPSTASH_VECTOR_REST_TOKEN=your-upstash-token-from-env-local

# NextAuth (Update NEXTAUTH_URL after deployment!)
NEXTAUTH_URL=https://your-project-name.vercel.app
NEXTAUTH_SECRET=your-nextauth-secret-from-env-local

# Google OAuth (from your .env.local)
GOOGLE_CLIENT_ID=your-google-client-id-from-env-local
GOOGLE_CLIENT_SECRET=your-google-client-secret-from-env-local

# Gmail (for contact form)
GMAIL_USER=your-gmail-from-env-local
GMAIL_APP_PASSWORD=your-gmail-app-password-from-env-local

# App URL (Update after deployment!)
NEXT_PUBLIC_APP_URL=https://your-project-name.vercel.app
```

**Important**: 
- Add ALL environment variables before deploying
- Replace `your-project-name` with your actual Vercel project URL after first deployment
- After getting your Vercel URL, update `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` and redeploy
- Never commit `.env.local` to GitHub

### 3. Configure Build Settings

Vercel should auto-detect Next.js. Verify these settings:

- **Framework Preset**: Next.js
- **Build Command**: `npm run build` (automatically includes `prisma generate`)
- **Output Directory**: `.next` (default)
- **Install Command**: `npm install` (automatically runs `prisma generate` via postinstall)
- **Node Version**: 18.x or higher

### 4. Deploy

1. Click **"Deploy"**
2. Wait for the build to complete (~2-3 minutes)
3. Your site will be live at `https://your-project-name.vercel.app`

### 5. Post-Deployment Setup

After first deployment:

1. **Update NEXT_PUBLIC_APP_URL**: 
   - Go to Project Settings → Environment Variables
   - Update `NEXT_PUBLIC_APP_URL` with your actual Vercel URL
   - Redeploy

2. **Verify Database Connection**:
   - Visit your deployed site
   - Check if Resume, Projects, and LMS pages load correctly
   - Test the AI ChatBot

### 6. Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update `NEXT_PUBLIC_APP_URL` to your custom domain

## Troubleshooting

### Build Fails with Prisma Error
- Ensure `DATABASE_URL` is set in environment variables
- The build script automatically runs `prisma generate`

### Database Connection Fails
- Verify `DATABASE_URL` is correct in Vercel environment variables
- Check Railway database is still running
- Ensure Railway allows external connections

### ChatBot Not Responding
- Check `OPENAI_API_KEY` is set (if using OpenAI)
- Current version works offline without OpenAI API
- Check browser console for errors

### 404 Errors on Pages
- Ensure all files were committed and pushed to GitHub
- Check Vercel build logs for missing dependencies

## Continuous Deployment

Once configured, every push to the `main` branch will automatically deploy:

```bash
git add .
git commit -m "Your changes"
git push
```

Vercel will automatically build and deploy your changes within minutes.

## Production Checklist

- [ ] Environment variables configured
- [ ] Database connected and seeded
- [ ] All pages loading correctly
- [ ] ChatBot functioning
- [ ] Voice AI working (requires HTTPS)
- [ ] Dark mode toggle working
- [ ] Mobile responsive design verified
- [ ] Custom domain configured (optional)

## Support

- Vercel Documentation: https://vercel.com/docs
- Next.js Deployment: https://nextjs.org/docs/deployment
- Railway Database: https://railway.app/
