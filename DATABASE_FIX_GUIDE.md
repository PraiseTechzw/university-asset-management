# Database Foreign Key Fix Guide

## Issue
The application is encountering database errors because the foreign key relationships between `assets`, `asset_issues`, and `profiles` tables are not properly set up.

## Error Message
```
Error fetching assets: {
  code: 'PGRST200',
  details: "Searched for a foreign key relationship between 'assets' and 'profiles' using the hint 'assets_created_by_fkey' in the schema 'public', but no matches were found.",
  hint: null,
  message: "Could not find a relationship between 'assets' and 'profiles' in the schema cache"
}
```

## Solution
Run the database migration script to fix the foreign key relationships.

## Steps to Fix

### 1. Run the Migration Script
Execute the SQL script `scripts/004_fix_foreign_keys.sql` in your Supabase database:

```sql
-- Copy and paste the contents of scripts/004_fix_foreign_keys.sql
-- into your Supabase SQL editor and run it
```

### 2. Alternative: Manual Fix
If you prefer to fix manually, run these SQL commands in your Supabase SQL editor:

```sql
-- Add foreign key constraints
ALTER TABLE public.assets 
ADD CONSTRAINT assets_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.asset_issues 
ADD CONSTRAINT asset_issues_issued_to_fkey 
FOREIGN KEY (issued_to) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.asset_issues 
ADD CONSTRAINT asset_issues_issued_by_fkey 
FOREIGN KEY (issued_by) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.maintenance_logs 
ADD CONSTRAINT maintenance_logs_performed_by_fkey 
FOREIGN KEY (performed_by) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_assets_created_by ON public.assets(created_by);
CREATE INDEX IF NOT EXISTS idx_asset_issues_issued_to ON public.asset_issues(issued_to);
CREATE INDEX IF NOT EXISTS idx_asset_issues_issued_by ON public.asset_issues(issued_by);
CREATE INDEX IF NOT EXISTS idx_maintenance_logs_performed_by ON public.maintenance_logs(performed_by);
```

### 3. Verify the Fix
After running the migration:
1. Restart your application
2. Navigate to `/dashboard/assets`
3. The error should be resolved and assets should load properly

## What This Fix Does

1. **Creates Proper Foreign Keys**: Links assets and asset_issues tables to the profiles table
2. **Adds Indexes**: Improves query performance for foreign key lookups
3. **Updates RLS Policies**: Ensures Row Level Security works correctly with the new relationships
4. **Maintains Data Integrity**: Ensures referential integrity between related tables

## Database Schema After Fix

```
assets.created_by → profiles.id
asset_issues.issued_to → profiles.id  
asset_issues.issued_by → profiles.id
maintenance_logs.performed_by → profiles.id
```

## Notes
- This fix assumes your profiles table has the correct structure
- All existing data will be preserved
- The application will now be able to properly join assets with user profile information
