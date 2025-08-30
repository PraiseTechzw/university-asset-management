-- Fix foreign key relationships for assets and asset_issues tables
-- This script adds proper foreign key constraints to link with profiles table

-- First, let's check if the foreign keys exist and drop them if they do
DO $$ 
BEGIN
    -- Drop existing foreign key constraints if they exist
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'assets_created_by_fkey' 
        AND table_name = 'assets'
    ) THEN
        ALTER TABLE public.assets DROP CONSTRAINT assets_created_by_fkey;
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'asset_issues_issued_to_fkey' 
        AND table_name = 'asset_issues'
    ) THEN
        ALTER TABLE public.asset_issues DROP CONSTRAINT asset_issues_issued_to_fkey;
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'asset_issues_issued_by_fkey' 
        AND table_name = 'asset_issues'
    ) THEN
        ALTER TABLE public.asset_issues DROP CONSTRAINT asset_issues_issued_by_fkey;
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'maintenance_logs_performed_by_fkey' 
        AND table_name = 'maintenance_logs'
    ) THEN
        ALTER TABLE public.maintenance_logs DROP CONSTRAINT maintenance_logs_performed_by_fkey;
    END IF;
END $$;

-- Now add the correct foreign key constraints
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

-- Create indexes for the new foreign keys
CREATE INDEX IF NOT EXISTS idx_assets_created_by ON public.assets(created_by);
CREATE INDEX IF NOT EXISTS idx_asset_issues_issued_to ON public.asset_issues(issued_to);
CREATE INDEX IF NOT EXISTS idx_asset_issues_issued_by ON public.asset_issues(issued_by);
CREATE INDEX IF NOT EXISTS idx_maintenance_logs_performed_by ON public.maintenance_logs(performed_by);

-- Update RLS policies to work with the new foreign key relationships
DROP POLICY IF EXISTS "assets_insert_admin_tech" ON public.assets;
DROP POLICY IF EXISTS "assets_update_admin_tech" ON public.assets;
DROP POLICY IF EXISTS "assets_delete_admin" ON public.assets;

CREATE POLICY "assets_insert_admin_tech" ON public.assets FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'technician')
  )
);

CREATE POLICY "assets_update_admin_tech" ON public.assets FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'technician')
  )
);

CREATE POLICY "assets_delete_admin" ON public.assets FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Update asset_issues policies
DROP POLICY IF EXISTS "asset_issues_insert_admin_tech" ON public.asset_issues;
DROP POLICY IF EXISTS "asset_issues_update_admin_tech" ON public.asset_issues;

CREATE POLICY "asset_issues_insert_admin_tech" ON public.asset_issues FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'technician')
  )
);

CREATE POLICY "asset_issues_update_admin_tech" ON public.asset_issues FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'technician')
  )
);

-- Update maintenance_logs policies
DROP POLICY IF EXISTS "maintenance_logs_insert_admin_tech" ON public.maintenance_logs;
DROP POLICY IF EXISTS "maintenance_logs_update_admin_tech" ON public.maintenance_logs;

CREATE POLICY "maintenance_logs_insert_admin_tech" ON public.maintenance_logs FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'technician')
  )
);

CREATE POLICY "maintenance_logs_update_admin_tech" ON public.maintenance_logs FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'technician')
  )
);
