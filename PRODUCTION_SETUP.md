# Production Setup Guide

## Overview
This guide outlines the steps to deploy the University Asset Management System to production with proper security and performance configurations.

## Environment Variables

Create a `.env.local` file with the following variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Authentication Settings
NEXT_PUBLIC_AUTH_DOMAIN_RESTRICTION=@cut.ac.zw

# Application Settings
NEXT_PUBLIC_APP_NAME="Chinhoyi University Asset Management"
NEXT_PUBLIC_APP_VERSION=1.0.0

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_DEBUG_MODE=false

# Cache Settings
NEXT_PUBLIC_PROFILE_CACHE_EXPIRY=300000
NEXT_PUBLIC_SESSION_CACHE_EXPIRY=600000
```

## Production Build

1. **Install dependencies:**
   ```bash
   pnpm install --production
   ```

2. **Build the application:**
   ```bash
   pnpm build
   ```

3. **Start production server:**
   ```bash
   pnpm start
   ```

## Security Considerations

### Authentication
- ✅ Domain restriction enforced (@cut.ac.zw only)
- ✅ Protected routes implemented
- ✅ Session management with Supabase
- ✅ No development bypasses

### Data Protection
- ✅ User role-based access control
- ✅ Secure API endpoints
- ✅ Input validation and sanitization

### Environment Security
- ✅ No hardcoded secrets
- ✅ Environment variable protection
- ✅ Production-only configurations

## Performance Optimizations

### Caching
- User profile cache: 5 minutes
- Session cache: 10 minutes
- Static asset optimization

### Error Handling
- Graceful fallbacks for network issues
- Retry logic for recoverable errors
- User-friendly error messages

## Monitoring and Logging

### Error Tracking
- Console errors logged for debugging
- User-friendly error messages displayed
- Network error retry mechanisms

### Performance Monitoring
- Loading states for all async operations
- Cache hit/miss tracking
- Authentication flow monitoring

## Deployment Checklist

- [ ] Environment variables configured
- [ ] Production build successful
- [ ] Database migrations applied
- [ ] SSL certificate installed
- [ ] Domain restrictions verified
- [ ] Error handling tested
- [ ] Performance benchmarks met
- [ ] Security audit completed

## Troubleshooting

### Common Issues

1. **Authentication Timeouts**
   - Check network connectivity
   - Verify Supabase service status
   - Review environment variables

2. **Profile Loading Issues**
   - Check database connectivity
   - Verify user permissions
   - Clear browser cache if needed

3. **Domain Restriction Errors**
   - Ensure email ends with @cut.ac.zw
   - Check Supabase OAuth configuration
   - Verify Google Workspace settings

## Support

For production issues, contact the development team with:
- Error logs
- User actions leading to the issue
- Browser/device information
- Network environment details
