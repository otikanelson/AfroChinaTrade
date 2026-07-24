# Deployment Guide

## Quick Deploy Options

### 1. Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd web
vercel
```

Or connect your GitHub repository to Vercel for automatic deployments.

### 2. Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
cd web
netlify deploy --prod
```

Or drag and drop the `dist` folder to Netlify's web interface.

### 3. GitHub Pages

```bash
# Build the project
npm run build

# Deploy to gh-pages branch
npm install -g gh-pages
gh-pages -d dist
```

### 4. AWS S3 + CloudFront

```bash
# Build the project
npm run build

# Upload to S3
aws s3 sync dist/ s3://your-bucket-name --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

## Environment Variables

No environment variables are required for the basic setup. If you add API integrations, create a `.env` file:

```env
VITE_API_URL=https://api.afrochinatrade.com
VITE_GOOGLE_ANALYTICS_ID=UA-XXXXXXXXX-X
```

## Custom Domain Setup

### Vercel
1. Go to your project settings
2. Add your custom domain
3. Update DNS records as instructed

### Netlify
1. Go to Domain settings
2. Add custom domain
3. Configure DNS or use Netlify DNS

## Performance Optimization

The build process automatically:
- Minifies JavaScript and CSS
- Optimizes images
- Generates source maps
- Purges unused CSS
- Creates production-ready bundles

## SSL/HTTPS

All recommended hosting platforms provide free SSL certificates automatically.

## Monitoring

Consider adding:
- Google Analytics
- Hotjar for user behavior
- Sentry for error tracking
- Cloudflare for CDN and DDoS protection

## Post-Deployment Checklist

- [ ] Test all links and buttons
- [ ] Verify Google Play Store link works
- [ ] Check mobile responsiveness
- [ ] Test page load speed (aim for < 3s)
- [ ] Verify SEO meta tags
- [ ] Test contact forms (if added)
- [ ] Check cross-browser compatibility
- [ ] Set up analytics tracking
- [ ] Configure CDN if needed
- [ ] Test on various devices

## Continuous Deployment

Set up automatic deployments by connecting your Git repository:

1. Push code to GitHub/GitLab
2. Connect repository to hosting platform
3. Configure build settings
4. Enable automatic deployments on push

## Rollback

If you need to rollback:

**Vercel**: Go to Deployments → Select previous deployment → Promote to Production

**Netlify**: Go to Deploys → Select previous deploy → Publish deploy

## Support

For deployment issues, check:
- Build logs on your hosting platform
- Browser console for errors
- Network tab for failed requests
