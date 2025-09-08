# CUT Asset Manager - Setup Guide

This guide will help you set up the CUT Asset Manager application with real backend connectivity and modern authentication.

**Version**: 1.0.0  
**Last Updated**: January 2025  
**Compatibility**: Next.js 15, React 19, Supabase

## 🚀 Quick Start

### 1. Environment Variables

Create a `.env.local` file in your project root with the following variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Next.js Configuration
NEXTAUTH_SECRET=your_nextauth_secret_key
NEXTAUTH_URL=http://localhost:3000

# Environment
NODE_ENV=development
```

### 2. Supabase Setup

#### 2.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note down your project URL and anon key

#### 2.2 Database Schema

Run the following SQL in your Supabase SQL editor:

```sql
-- Create profiles table
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

-- Create assets table
CREATE TABLE IF NOT EXISTS assets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  asset_code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  location TEXT,
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'in_use', 'maintenance', 'retired')),
  assigned_to UUID REFERENCES profiles(id),
  purchase_date DATE,
  warranty_expiry DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create asset_requests table
CREATE TABLE IF NOT EXISTS asset_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id UUID REFERENCES profiles(id) NOT NULL,
  asset_id UUID REFERENCES assets(id),
  category TEXT,
  purpose TEXT NOT NULL,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'fulfilled')),
  request_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  required_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create maintenance_records table
CREATE TABLE IF NOT EXISTS maintenance_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  asset_id UUID REFERENCES assets(id) NOT NULL,
  technician_id UUID REFERENCES profiles(id),
  issue_description TEXT NOT NULL,
  solution TEXT,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  reported_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_records ENABLE ROW LEVEL SECURITY;

-- Create basic policies (you can customize these)
CREATE POLICY "Users can view assets" ON assets FOR SELECT USING (true);
CREATE POLICY "Users can view asset requests" ON asset_requests FOR SELECT USING (true);
CREATE POLICY "Users can view maintenance records" ON maintenance_records FOR SELECT USING (true);
```

#### 2.3 Authentication Setup

1. Go to **Authentication** > **Providers**
2. Enable **Email** provider
3. Configure **Google** provider (see Google OAuth setup below)
4. Set **Site URL** to `http://localhost:3000` (for development)
5. Add **Redirect URLs**:
   - `http://localhost:3000/auth/callback`
   - `https://your-domain.com/auth/callback` (for production)

### 3. Google OAuth Setup

#### 3.1 Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable **Google+ API** and **Google Identity API**
4. Go to **Credentials** > **Create Credentials** > **OAuth 2.0 Client ID**
5. Choose **Web application**
6. Add authorized origins:
   - `http://localhost:3000`
   - `https://your-domain.com`
7. Add redirect URIs:
   - `http://localhost:3000/auth/callback`
   - `https://your-domain.com/auth/callback`

#### 3.2 Configure in Supabase

1. Copy your Google Client ID and Secret
2. In Supabase, go to **Authentication** > **Providers** > **Google**
3. Enable Google provider
4. Enter your Client ID and Secret
5. Save changes

### 4. Install Dependencies

```bash
npm install
# or
pnpm install
# or
yarn install
```

### 5. Run Development Server

```bash
npm run dev
# or
pnpm dev
# or
yarn dev
```

## 🔧 Configuration

### Authentication Flow

The application now uses a real authentication system:

1. **Login Form**: Real Supabase authentication with modern UI
2. **Domain Restriction**: Only `@cut.ac.zw` accounts allowed
3. **Session Management**: Automatic session handling
4. **Protected Routes**: Dashboard requires authentication
5. **Role-Based Access**: Different dashboards based on user role
6. **Confetti Animation**: Celebratory animation on successful login

### User Roles

- **Admin**: Full system access, user management
- **Technician**: Asset maintenance, issue resolution
- **Staff**: Asset requests, basic operations

### Creating Test Accounts

To test the system, you can create accounts directly in Supabase:

1. **Admin Account**:
   - Create user in Supabase Auth
   - Set email to `admin@cut.ac.zw`
   - Create profile with role `admin`

2. **Technician Account**:
   - Create user in Supabase Auth
   - Set email to `tech@cut.ac.zw`
   - Create profile with role `technician`

3. **Staff Account**:
   - Create user in Supabase Auth
   - Set email to `staff@cut.ac.zw`
   - Create profile with role `staff`

## 🚨 Troubleshooting

### Common Issues

1. **"Invalid redirect_uri" error**
   - Check redirect URLs in both Google Console and Supabase
   - Ensure exact match including protocol and port

2. **Authentication not working**
   - Verify environment variables are set correctly
   - Check Supabase project URL and keys
   - Ensure Google OAuth is properly configured

3. **Database errors**
   - Run the SQL schema in Supabase SQL editor
   - Check RLS policies are enabled
   - Verify table structure matches schema

4. **Domain restriction not working**
   - Check auth callback logic
   - Verify user email domain validation
   - Check Supabase auth logs

### Debug Steps

1. Check browser console for errors
2. Review Supabase authentication logs
3. Verify environment variables
4. Test with different @cut.ac.zw accounts
5. Check network tab for failed requests

## 🔒 Security Features

- **Domain Restriction**: Only university accounts allowed
- **Row Level Security**: Database-level access control
- **JWT Tokens**: Secure authentication
- **HTTPS Required**: Production security requirement
- **Session Management**: Automatic token refresh

## 📱 Features Implemented

- ✅ Real authentication with Supabase
- ✅ Google OAuth integration
- ✅ Domain restriction (@cut.ac.zw only)
- ✅ Protected routes
- ✅ Role-based dashboards
- ✅ Session management
- ✅ Toast notifications
- ✅ Theme switching
- ✅ Responsive design
- ✅ Loading states
- ✅ Error handling
- ✅ Modern UI with animations
- ✅ Confetti animation on success
- ✅ Enhanced visual feedback

## 🚀 Next Steps

1. **Customize Dashboards**: Add more role-specific features
2. **Asset Management**: Implement CRUD operations for assets
3. **Reporting**: Add analytics and reporting features
4. **Notifications**: Implement real-time notifications
5. **Mobile App**: Consider PWA capabilities
6. **API Integration**: Connect with other university systems

## 📞 Support

For technical support:
1. Check Supabase documentation
2. Review Next.js authentication guides
3. Check application logs
4. Verify configuration settings

---

**Note**: This application is designed specifically for Chinhoyi University of Technology and includes domain restrictions for security purposes.

## 📋 System Requirements

- **Node.js**: 18.0.0 or higher
- **npm/pnpm/yarn**: Latest version
- **Supabase Account**: For backend services
- **Google Cloud Account**: For OAuth (optional)
- **Modern Browser**: Chrome, Firefox, Safari, or Edge

## 🔄 Updates and Maintenance

This system is actively maintained and updated. For the latest updates and security patches, please check the project repository regularly.

**Current Version Features**:
- Enhanced authentication with better error handling
- Professional UI/UX improvements
- Updated security measures
- Improved performance and reliability
- Better mobile responsiveness
