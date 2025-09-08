# CUT Asset Manager

A professional, modern asset management system designed specifically for Chinhoyi University of Technology. Built with Next.js 15, React 19, and Supabase for secure, scalable asset tracking and management.

## 🚀 Features

### Core Functionality
- **Asset Registration & Tracking**: Complete lifecycle management of university assets
- **Role-Based Access Control**: Admin, Technician, and Staff roles with appropriate permissions
- **Real-time Authentication**: Secure login with Google OAuth and email/password
- **Domain Restriction**: Only @cut.ac.zw accounts allowed for enhanced security
- **Mobile Responsive**: Optimized for desktop, tablet, and mobile devices

### Dashboard Features
- **Admin Dashboard**: Comprehensive overview with analytics and system management
- **Technician Dashboard**: Asset maintenance and issue resolution tools
- **Staff Dashboard**: Asset requests and basic operations interface
- **Real-time Updates**: Live data synchronization across all users

### Security & Performance
- **Row Level Security**: Database-level access control with Supabase RLS
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Comprehensive form validation and sanitization
- **Error Handling**: Graceful error handling with user-friendly messages
- **Performance Optimized**: Image optimization, caching, and lazy loading

## 🛠️ Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI Components
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Authentication**: Supabase Auth with Google OAuth
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React
- **Deployment**: Vercel (recommended)

## 📋 Prerequisites

- Node.js 18.0.0 or higher
- npm, pnpm, or yarn package manager
- Supabase account
- Google Cloud Console account (for OAuth)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/university-asset-management.git
cd university-asset-management
```

### 2. Install Dependencies

```bash
pnpm install
# or
npm install
# or
yarn install
```

### 3. Environment Setup

Create a `.env.local` file in the project root:

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

### 4. Database Setup

1. Create a new Supabase project
2. Run the SQL scripts in the `scripts/` directory:
   - `001_create_database_schema.sql`
   - `002_create_profile_trigger.sql`
   - `003_seed_sample_data.sql`
   - `004_fix_foreign_keys.sql`

### 5. Authentication Setup

1. **Email Authentication**: Enable in Supabase Auth settings
2. **Google OAuth**: Configure in both Google Cloud Console and Supabase
3. **Domain Restriction**: Set up @cut.ac.zw domain restriction

### 6. Run Development Server

```bash
pnpm dev
# or
npm run dev
# or
yarn dev
```

Visit `http://localhost:3000` to see the application.

## 📚 Documentation

- [Setup Guide](SETUP_GUIDE.md) - Detailed setup instructions
- [Production Setup](PRODUCTION_SETUP.md) - Production deployment guide
- [Database Fix Guide](DATABASE_FIX_GUIDE.md) - Database troubleshooting
- [Google OAuth Setup](GOOGLE_OAUTH_SETUP.md) - OAuth configuration

## 🏗️ Project Structure

```
university-asset-management/
├── app/                    # Next.js app directory
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard pages
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── auth/             # Authentication components
│   ├── dashboard/        # Dashboard components
│   ├── mobile/           # Mobile-specific components
│   └── ui/               # Reusable UI components
├── lib/                  # Utility libraries
│   ├── supabase/         # Supabase configuration
│   └── utils.ts          # Utility functions
├── scripts/              # Database scripts
├── public/               # Static assets
└── styles/               # Additional styles
```

## 🔧 Configuration

### User Roles

- **Admin**: Full system access, user management, analytics
- **Technician**: Asset maintenance, issue resolution, technical operations
- **Staff**: Asset requests, basic operations, personal asset view

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes |
| `NEXTAUTH_SECRET` | NextAuth secret key | Yes |
| `NEXTAUTH_URL` | Application URL | Yes |

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms

The application can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Railway
- DigitalOcean App Platform

## 🔒 Security Features

- **Domain Restriction**: Only @cut.ac.zw accounts allowed
- **Row Level Security**: Database-level access control
- **JWT Tokens**: Secure authentication tokens
- **HTTPS Required**: Production security requirement
- **Input Validation**: Comprehensive form validation
- **XSS Protection**: Built-in security headers

## 📊 Performance Features

- **Image Optimization**: Next.js automatic image optimization
- **Code Splitting**: Automatic code splitting for better performance
- **Caching**: Intelligent caching strategies
- **Lazy Loading**: Components loaded on demand
- **Bundle Analysis**: Built-in bundle analyzer

## 🐛 Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Verify Supabase configuration
   - Check domain restriction settings
   - Ensure Google OAuth is properly configured

2. **Database Errors**
   - Run all SQL scripts in order
   - Check RLS policies
   - Verify table relationships

3. **Build Errors**
   - Clear node_modules and reinstall
   - Check TypeScript errors
   - Verify environment variables

### Getting Help

- Check the [troubleshooting section](SETUP_GUIDE.md#troubleshooting)
- Review application logs
- Contact IT support: it-support@cut.ac.zw

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

**IT Support Team**:
- Email: it-support@cut.ac.zw
- Phone: +263 67 222 0000
- Office Hours: Monday - Friday, 8:00 AM - 5:00 PM

**Emergency Support**:
- Available 24/7 for critical system issues
- Response time: Within 2 hours for critical issues

## 🔄 Updates

This system is actively maintained and updated. For the latest updates and security patches, please check the project repository regularly.

**Current Version**: 1.0.0  
**Last Updated**: January 2025  
**Next Major Update**: Q2 2025

---

**Note**: This application is designed specifically for Chinhoyi University of Technology and includes domain restrictions for security purposes. For questions or support, please contact the IT department.
