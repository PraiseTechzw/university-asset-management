# Google OAuth Setup for CUT Asset Manager

This guide explains how to set up Google OAuth authentication in Supabase with domain restriction to only allow `@cut.ac.zw` accounts.

## Prerequisites

- Supabase project set up
- Google Cloud Console access
- Domain verification for `cut.ac.zw`

## Step 1: Google Cloud Console Setup

### 1.1 Create OAuth 2.0 Client ID

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project or create a new one
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth 2.0 Client ID**
5. Choose **Web application** as the application type

### 1.2 Configure OAuth Consent Screen

1. Go to **OAuth consent screen**
2. Choose **External** user type
3. Fill in the required information:
   - App name: `CUT Asset Manager`
   - User support email: `your-email@cut.ac.zw`
   - Developer contact information: `your-email@cut.ac.zw`
4. Add scopes:
   - `openid`
   - `email`
   - `profile`
5. Add test users (optional for development)

### 1.3 Configure OAuth 2.0 Client ID

1. **Authorized JavaScript origins**:
   ```
   http://localhost:3000
   https://your-domain.com
   ```

2. **Authorized redirect URIs**:
   ```
   http://localhost:3000/auth/callback
   https://your-domain.com/auth/callback
   ```

3. Copy the **Client ID** and **Client Secret**

## Step 2: Supabase Configuration

### 2.1 Enable Google Provider

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** > **Providers**
3. Find **Google** and click **Enable**
4. Enter your Google OAuth credentials:
   - **Client ID**: Your Google OAuth client ID
   - **Client Secret**: Your Google OAuth client secret

### 2.2 Configure Redirect URLs

In Supabase, add these redirect URLs:
```
http://localhost:3000/auth/callback
https://your-domain.com/auth/callback
```

### 2.3 Enable Email Confirmation (Optional)

- **Enable email confirmations**: Off (for Google OAuth users)
- **Enable secure email change**: On

## Step 3: Environment Variables

Add these to your `.env.local` file:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Step 4: Database Schema

Ensure your `profiles` table has the necessary columns:

```sql
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'staff' CHECK (role IN ('admin', 'technician', 'staff')),
  department TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Service role can manage all profiles" ON profiles
  FOR ALL USING (auth.role() = 'service_role');
```

## Step 5: Testing

### 5.1 Test Google Sign-In

1. Start your development server
2. Go to the login page
3. Click "Continue with Google"
4. Sign in with a `@cut.ac.zw` account
5. Verify you're redirected to the dashboard

### 5.2 Test Domain Restriction

1. Try signing in with a non-`@cut.ac.zw` account
2. Verify access is denied
3. Check error messages

### 5.3 Test Confetti Animation

1. Sign in successfully with a valid account
2. Verify confetti animation plays
3. Check success state is displayed

## Step 6: Production Deployment

### 6.1 Update Redirect URLs

Before deploying to production, update:
- Google OAuth redirect URIs
- Supabase redirect URLs
- Environment variables

### 6.2 Domain Verification

Ensure your production domain is verified in Google Cloud Console.

### 6.3 SSL Certificate

Production must use HTTPS for OAuth to work properly.

## Troubleshooting

### Common Issues

1. **"Invalid redirect_uri" error**
   - Check redirect URLs in both Google Console and Supabase
   - Ensure exact match including protocol and port

2. **"Access denied" for valid @cut.ac.zw accounts**
   - Verify domain restriction logic in auth callback
   - Check user metadata from Google

3. **Profile not created**
   - Verify database permissions
   - Check Supabase logs for errors

4. **OAuth flow not completing**
   - Check browser console for errors
   - Verify all environment variables are set

5. **Confetti animation not working**
   - Check if confetti component is properly imported
   - Verify useConfetti hook is working
   - Check browser console for errors

### Debug Steps

1. Check browser network tab for OAuth requests
2. Review Supabase authentication logs
3. Verify Google OAuth configuration
4. Test with different @cut.ac.zw accounts
5. Check if confetti component renders

## Security Considerations

1. **Domain Restriction**: Only `@cut.ac.zw` accounts can access the system
2. **HTTPS Required**: Production must use HTTPS
3. **Token Validation**: Supabase handles JWT validation
4. **Session Management**: Automatic session refresh and cleanup

## Support

For issues related to:
- **Google OAuth**: Check Google Cloud Console documentation
- **Supabase**: Review Supabase authentication docs
- **Application**: Check application logs and error messages

## Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Next.js Authentication](https://nextjs.org/docs/authentication)
