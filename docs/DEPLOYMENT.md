# Deployment Guide

Complete guide for deploying the Presentation Portfolio to various hosting platforms.

## 🚀 GitHub Pages (Recommended)

GitHub Pages provides free static hosting with automatic deployment via GitHub Actions.

### Automatic Deployment

1. **Push to main branch**:
   ```bash
   git add .
   git commit -m "Deploy presentation portfolio"
   git push origin main
   ```

2. **GitHub Actions automatically**:
   - Installs dependencies
   - Builds the static site
   - Deploys to GitHub Pages
   - Updates the live site

### Manual Setup

1. **Enable GitHub Pages**:
   - Go to repository Settings → Pages
   - Source: GitHub Actions
   - Custom domain (optional): Add your domain

2. **Configure repository**:
   ```bash
   # Update next.config.js with your repository name
   basePath: process.env.NODE_ENV === 'production' ? '/your-repo-name' : ''
   ```

3. **Deploy workflow** is automatically triggered on push to main

### Custom Domain Setup

1. **Add CNAME file**:
   ```bash
   # Create public/CNAME
   echo "your-domain.com" > public/CNAME
   ```

2. **Configure DNS**:
   - Create CNAME record pointing to `username.github.io`
   - Or A records pointing to GitHub Pages IPs

3. **Enable HTTPS** in repository settings

## 🌐 Vercel Deployment

Vercel provides excellent Next.js hosting with zero configuration.

### Deploy with Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel --prod
   ```

3. **Configure build settings**:
   - Build Command: `npm run build`
   - Output Directory: `out`
   - Install Command: `npm install`

### Deploy with GitHub Integration

1. **Connect repository** to Vercel
2. **Configure environment variables** if needed
3. **Deploy automatically** on git push

### Environment Variables
```bash
# .env.local (for Vercel)
NEXT_PUBLIC_BASE_URL=https://your-domain.vercel.app
NODE_ENV=production
```

## 📦 Netlify Deployment

Netlify offers easy static site hosting with continuous deployment.

### Deploy via Git

1. **Connect repository** to Netlify
2. **Configure build settings**:
   - Build command: `npm run build && npm run export`
   - Publish directory: `docs`
   - Node version: 18

3. **Deploy settings**:
   ```toml
   # netlify.toml
   [build]
     command = "npm run build && npm run export"
     publish = "docs"
   
   [build.environment]
     NODE_VERSION = "18"
   
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

### Manual Deploy

1. **Build locally**:
   ```bash
   npm run build:all
   ```

2. **Upload `docs` directory** to Netlify

## 🔧 Custom Server Deployment

Deploy to your own server or VPS.

### Docker Deployment

1. **Create Dockerfile**:
   ```dockerfile
   FROM node:18-alpine AS deps
   RUN apk add --no-cache libc6-compat
   WORKDIR /app
   COPY package.json package-lock.json ./
   RUN npm ci --only=production
   
   FROM node:18-alpine AS builder
   WORKDIR /app
   COPY . .
   COPY --from=deps /app/node_modules ./node_modules
   RUN npm run build && npm run export
   
   FROM nginx:alpine
   COPY --from=builder /app/docs /usr/share/nginx/html
   COPY nginx.conf /etc/nginx/nginx.conf
   EXPOSE 80
   CMD ["nginx", "-g", "daemon off;"]
   ```

2. **Create nginx.conf**:
   ```nginx
   events {
     worker_connections 1024;
   }
   
   http {
     include /etc/nginx/mime.types;
     default_type application/octet-stream;
     
     server {
       listen 80;
       server_name localhost;
       root /usr/share/nginx/html;
       index index.html;
       
       location / {
         try_files $uri $uri/ /index.html;
       }
       
       location /presentations {
         try_files $uri $uri/ /presentations/index.html;
       }
     }
   }
   ```

3. **Build and run**:
   ```bash
   docker build -t presentation-portfolio .
   docker run -p 80:80 presentation-portfolio
   ```

### Direct Server Deployment

1. **Build static files**:
   ```bash
   npm run build:all
   ```

2. **Upload to server**:
   ```bash
   rsync -avz docs/ user@server:/var/www/html/
   ```

3. **Configure web server** (Apache/Nginx)

## ☁️ AWS S3 + CloudFront

Deploy as a static website on AWS with global CDN.

### S3 Setup

1. **Create S3 bucket**:
   ```bash
   aws s3 mb s3://your-presentation-portfolio
   ```

2. **Configure for static hosting**:
   ```bash
   aws s3 website s3://your-presentation-portfolio \
     --index-document index.html \
     --error-document error.html
   ```

3. **Upload files**:
   ```bash
   npm run build:all
   aws s3 sync docs/ s3://your-presentation-portfolio --delete
   ```

### CloudFront Distribution

1. **Create distribution**:
   ```bash
   aws cloudfront create-distribution \
     --distribution-config file://cloudfront-config.json
   ```

2. **Configure custom domain** and SSL certificate

### Automated Deployment

```yaml
# .github/workflows/aws-deploy.yml
name: Deploy to AWS

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: '18'
    - run: npm ci
    - run: npm run build:all
    - uses: aws-actions/configure-aws-credentials@v2
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: us-east-1
    - run: aws s3 sync docs/ s3://${{ secrets.S3_BUCKET }} --delete
    - run: aws cloudfront create-invalidation --distribution-id ${{ secrets.CLOUDFRONT_ID }} --paths "/*"
```

## 🔄 CI/CD Pipelines

### GitHub Actions Workflow

```yaml
name: Build and Deploy

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

env:
  NODE_VERSION: '18'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'
    - run: npm ci
    - run: npm run lint
    - run: npm run type-check
    - run: npm test (if tests exist)

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'
    - run: npm ci
    - run: npm run build:all
    - uses: actions/upload-artifact@v3
      with:
        name: build-files
        path: docs/

  deploy:
    if: github.ref == 'refs/heads/main'
    needs: build
    runs-on: ubuntu-latest
    steps:
    - uses: actions/download-artifact@v3
      with:
        name: build-files
        path: docs/
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./docs
```

### Selective Deployment

Deploy only changed presentations:

```yaml
name: Selective Deploy

on:
  push:
    paths:
    - 'src/data/presentations/**'

jobs:
  selective-deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
      with:
        fetch-depth: 2
    - uses: actions/setup-node@v4
      with:
        node-version: '18'
    - run: npm ci
    
    - name: Get changed presentations
      id: changes
      run: |
        CHANGED=$(git diff --name-only HEAD^ HEAD | grep 'src/data/presentations/' | head -5 | tr '\n' ',' | sed 's/,$//')
        echo "presentations=$CHANGED" >> $GITHUB_OUTPUT
    
    - name: Selective build
      if: steps.changes.outputs.presentations != ''
      run: |
        npm run build:selective -- --presentations ${{ steps.changes.outputs.presentations }}
    
    - name: Deploy
      if: steps.changes.outputs.presentations != ''
      run: |
        # Deploy logic here
```

## 📊 Performance Optimization

### Build Optimization

1. **Enable compression**:
   ```javascript
   // next.config.js
   module.exports = {
     compress: true,
     poweredByHeader: false,
     generateEtags: false,
   }
   ```

2. **Optimize images**:
   ```bash
   # Install image optimization tools
   npm install --save-dev imagemin imagemin-webp
   ```

3. **Bundle analysis**:
   ```bash
   npm install --save-dev @next/bundle-analyzer
   npm run build && npm run analyze
   ```

### CDN Configuration

1. **Cache headers**:
   ```nginx
   # nginx.conf
   location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
     expires 1y;
     add_header Cache-Control "public, immutable";
   }
   ```

2. **Compression**:
   ```nginx
   gzip on;
   gzip_vary on;
   gzip_min_length 1024;
   gzip_types text/plain text/css application/json application/javascript;
   ```

## 🔐 Security Considerations

### Content Security Policy

```html
<!-- Add to layout.tsx -->
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline'; 
               style-src 'self' 'unsafe-inline' fonts.googleapis.com;
               font-src 'self' fonts.gstatic.com;
               img-src 'self' data: https:;">
```

### HTTPS Enforcement

```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

## 📈 Monitoring and Analytics

### Error Tracking

1. **Setup Sentry** (optional):
   ```bash
   npm install @sentry/nextjs
   ```

2. **Configure error boundaries**:
   ```typescript
   // Add error boundary components
   import * as Sentry from '@sentry/nextjs';
   ```

### Performance Monitoring

1. **Google Analytics**:
   ```html
   <!-- Add to layout.tsx -->
   <script async src="https://www.googletagmanager.com/gtag/js?id=GA_TRACKING_ID"></script>
   ```

2. **Core Web Vitals**:
   ```javascript
   // Monitor performance metrics
   export function reportWebVitals(metric) {
     console.log(metric);
   }
   ```

## 🔄 Backup and Recovery

### Data Backup

1. **Git repository** serves as primary backup
2. **Export presentations** to external storage:
   ```bash
   # Backup script
   tar -czf presentations-backup-$(date +%Y%m%d).tar.gz src/data/
   ```

3. **Database backup** (if using external data source)

### Disaster Recovery

1. **Repository restoration** from Git
2. **Redeploy from backup** using CI/CD
3. **DNS failover** to backup hosting

## 📝 Deployment Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] Build succeeds locally
- [ ] Content reviewed and approved
- [ ] Images optimized and compressed
- [ ] Dependencies updated
- [ ] Security headers configured

### Deployment
- [ ] Environment variables set
- [ ] SSL certificate valid
- [ ] DNS configuration correct
- [ ] CDN properly configured
- [ ] Monitoring tools active

### Post-Deployment
- [ ] Site accessibility verified
- [ ] Performance metrics checked
- [ ] All pages loading correctly
- [ ] Search functionality working
- [ ] Mobile responsiveness confirmed
- [ ] Analytics tracking active

## 🆘 Troubleshooting

### Common Issues

1. **Build failures**:
   - Check Node.js version compatibility
   - Verify all dependencies installed
   - Review TypeScript errors

2. **Routing issues**:
   - Confirm basePath configuration
   - Check trailing slash settings
   - Verify static export settings

3. **Image loading**:
   - Ensure images exist in public directory
   - Check image path configuration
   - Verify image optimization settings

### Debug Commands

```bash
# Check build output
npm run build -- --debug

# Analyze bundle size
npm run build && npm run analyze

# Test static export
npm run export && serve docs/
```

---

**Remember**: Always test deployments in a staging environment before deploying to production!