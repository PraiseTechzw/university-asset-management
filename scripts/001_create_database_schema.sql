-- Create users profile table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'technician', 'staff')),
  department TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create assets table
CREATE TABLE IF NOT EXISTS public.assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('projector', 'laptop', 'desktop', 'printer', 'camera', 'other')),
  brand TEXT,
  model TEXT,
  serial_number TEXT,
  purchase_date DATE,
  purchase_price DECIMAL(10,2),
  warranty_expiry DATE,
  condition TEXT NOT NULL CHECK (condition IN ('excellent', 'good', 'fair', 'poor', 'damaged')),
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'issued', 'maintenance', 'retired')),
  location TEXT,
  description TEXT,
  qr_code_url TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create asset_issues table for tracking who has what
CREATE TABLE IF NOT EXISTS public.asset_issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  issued_to UUID NOT NULL REFERENCES auth.users(id),
  issued_by UUID NOT NULL REFERENCES auth.users(id),
  issue_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expected_return_date TIMESTAMP WITH TIME ZONE,
  actual_return_date TIMESTAMP WITH TIME ZONE,
  return_condition TEXT CHECK (return_condition IN ('excellent', 'good', 'fair', 'poor', 'damaged')),
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'returned', 'overdue')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create maintenance_logs table
CREATE TABLE IF NOT EXISTS public.maintenance_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  maintenance_type TEXT NOT NULL CHECK (maintenance_type IN ('repair', 'service', 'inspection', 'upgrade')),
  description TEXT NOT NULL,
  cost DECIMAL(10,2),
  performed_by UUID REFERENCES auth.users(id),
  maintenance_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  next_maintenance_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_delete_own" ON public.profiles FOR DELETE USING (auth.uid() = id);

-- RLS Policies for assets (all authenticated users can view, only admin/technician can modify)
CREATE POLICY "assets_select_all" ON public.assets FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "assets_insert_admin_tech" ON public.assets FOR INSERT WITH CHECK (
  auth.uid() IN (
    SELECT id FROM public.profiles WHERE role IN ('admin', 'technician')
  )
);
CREATE POLICY "assets_update_admin_tech" ON public.assets FOR UPDATE USING (
  auth.uid() IN (
    SELECT id FROM public.profiles WHERE role IN ('admin', 'technician')
  )
);
CREATE POLICY "assets_delete_admin" ON public.assets FOR DELETE USING (
  auth.uid() IN (
    SELECT id FROM public.profiles WHERE role = 'admin'
  )
);

-- RLS Policies for asset_issues
CREATE POLICY "asset_issues_select_all" ON public.asset_issues FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "asset_issues_insert_admin_tech" ON public.asset_issues FOR INSERT WITH CHECK (
  auth.uid() IN (
    SELECT id FROM public.profiles WHERE role IN ('admin', 'technician')
  )
);
CREATE POLICY "asset_issues_update_admin_tech" ON public.asset_issues FOR UPDATE USING (
  auth.uid() IN (
    SELECT id FROM public.profiles WHERE role IN ('admin', 'technician')
  )
);

-- RLS Policies for maintenance_logs
CREATE POLICY "maintenance_logs_select_all" ON public.maintenance_logs FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "maintenance_logs_insert_admin_tech" ON public.maintenance_logs FOR INSERT WITH CHECK (
  auth.uid() IN (
    SELECT id FROM public.profiles WHERE role IN ('admin', 'technician')
  )
);
CREATE POLICY "maintenance_logs_update_admin_tech" ON public.maintenance_logs FOR UPDATE USING (
  auth.uid() IN (
    SELECT id FROM public.profiles WHERE role IN ('admin', 'technician')
  )
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_assets_status ON public.assets(status);
CREATE INDEX IF NOT EXISTS idx_assets_category ON public.assets(category);
CREATE INDEX IF NOT EXISTS idx_assets_asset_code ON public.assets(asset_code);
CREATE INDEX IF NOT EXISTS idx_asset_issues_status ON public.asset_issues(status);
CREATE INDEX IF NOT EXISTS idx_asset_issues_asset_id ON public.asset_issues(asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_issues_issued_to ON public.asset_issues(issued_to);
