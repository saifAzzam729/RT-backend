# Vercel Deployment Guide

This guide will help you deploy the RT Backend to Vercel.

## Prerequisites

1. A Vercel account (sign up at [vercel.com](https://vercel.com))
2. A PostgreSQL database (recommended: [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres), [Supabase](https://supabase.com), or [Neon](https://neon.tech))
3. Vercel CLI installed (optional, for CLI deployment):
   ```bash
   npm i -g vercel
   ```

## Step 1: Prepare Your Database

1. Set up a PostgreSQL database (if you haven't already)
2. Run Prisma migrations to set up your schema:
   ```bash
   npx prisma migrate deploy
   ```
   Or if using a new database:
   ```bash
   npx prisma migrate dev --name init
   ```

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Push your code to GitHub/GitLab/Bitbucket**
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Import your project on Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your Git repository
   - Vercel will auto-detect the project settings

3. **Configure Environment Variables**
   In the Vercel dashboard, add these environment variables:
   
   **Required:**
   - `DATABASE_URL` - Your PostgreSQL connection string
   - `JWT_SECRET` - A secure random string for JWT signing
   - `JWT_REFRESH_SECRET` - A secure random string for refresh tokens
   - `FRONTEND_URL` - Your frontend URL (e.g., `https://your-frontend.vercel.app`)
   
   **JWT Configuration:**
   - `JWT_EXPIRES_IN` - Access token expiration (default: `15m`)
   - `JWT_REFRESH_EXPIRES_IN` - Refresh token expiration (default: `7d`)
   
   **Email Configuration (for OTP):**
   - `SMTP_HOST` - Your SMTP server host
   - `SMTP_PORT` - SMTP port (usually `587` or `465`)
   - `SMTP_SECURE` - `true` for port 465, `false` for port 587
   - `SMTP_USER` - Your SMTP username/email
   - `SMTP_PASSWORD` - Your SMTP password
   - `EMAIL_FROM` - Sender email address
   
   **Supabase Storage (for file uploads):**
   - `SUPABASE_URL` - Your Supabase project URL
   - `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key
   - `SUPABASE_STORAGE_BUCKET_LICENSES` - Bucket name for licenses
   - `SUPABASE_STORAGE_BUCKET_RESUMES` - Bucket name for resumes
   - `SUPABASE_STORAGE_BUCKET_LOGOS` - Bucket name for logos
   - `SUPABASE_STORAGE_BUCKET_AVATARS` - Bucket name for avatars
   
   **Optional:**
   - `NODE_ENV` - Set to `production`
   - `PORT` - Usually not needed (Vercel handles this)

4. **Configure Build Settings**
   - Framework Preset: **Other**
   - Build Command: `npm run build && npx prisma generate`
   - Output Directory: `dist`
   - Install Command: `npm install`

5. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete

### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```
   
   Follow the prompts:
   - Link to existing project or create new
   - Set environment variables when prompted

4. **Set Environment Variables**:
   ```bash
   vercel env add DATABASE_URL
   vercel env add JWT_SECRET
   vercel env add JWT_REFRESH_SECRET
   vercel env add FRONTEND_URL
   # ... add all other environment variables
   ```

5. **Deploy to Production**:
   ```bash
   vercel --prod
   ```

## Step 3: Run Database Migrations

After deployment, you need to run Prisma migrations on your production database:

```bash
# Set your production DATABASE_URL
export DATABASE_URL="your-production-database-url"

# Run migrations
npx prisma migrate deploy
```

Or use Vercel's environment variables:
```bash
vercel env pull .env.production
npx prisma migrate deploy
```

## Step 4: Verify Deployment

1. **Check your deployment URL**
   - Your API will be available at: `https://your-project.vercel.app/api`
   - Swagger docs: `https://your-project.vercel.app/api/docs`

2. **Test the API**
   ```bash
   curl https://your-project.vercel.app/api
   ```

3. **Check logs**
   - Go to your Vercel dashboard
   - Navigate to your project → Deployments → Click on a deployment → Logs

## Important Notes

### Database Connection Pooling

For serverless environments like Vercel, use a connection pooler:
- **Vercel Postgres**: Automatically handles pooling
- **Supabase**: Use the connection pooler URL (port 6543)
- **Neon**: Use the connection pooler URL
- **Other providers**: Use PgBouncer or similar

Example pooled connection string:
```
postgresql://user:password@host:6543/database?pgbouncer=true
```

### Prisma Client Generation

The `vercel.json` is configured to run `npx prisma generate` during build. This ensures Prisma Client is generated for the serverless environment.

### File Storage

Since Vercel is serverless, file uploads should use external storage (Supabase Storage is already configured). Local file storage won't work in serverless environments.

### Cold Starts

Serverless functions may experience cold starts. Consider:
- Using Vercel Pro for better performance
- Implementing keep-alive strategies
- Optimizing your bundle size

## Troubleshooting

### Build Fails

1. **Check build logs** in Vercel dashboard
2. **Verify Node version** - Ensure `package.json` specifies Node 20.x
3. **Check Prisma generation** - Ensure `npx prisma generate` runs successfully

### Database Connection Issues

1. **Check DATABASE_URL** - Ensure it's correctly set
2. **Use connection pooler** - Serverless requires connection pooling
3. **Check database firewall** - Allow Vercel IPs if needed

### Environment Variables Not Working

1. **Redeploy** after adding environment variables
2. **Check variable names** - Ensure they match exactly
3. **Verify scope** - Set variables for Production, Preview, and Development

### Function Timeout

- Default timeout is 10 seconds (Hobby plan)
- Pro plan allows up to 60 seconds
- Current config sets maxDuration to 30 seconds

## Next Steps

1. Set up a custom domain (optional)
2. Configure CORS for your frontend domain
3. Set up monitoring and error tracking
4. Configure CI/CD for automatic deployments

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [NestJS Deployment](https://docs.nestjs.com/recipes/serverless)
- [Prisma with Serverless](https://www.prisma.io/docs/guides/deployment/serverless)
