-- Company Settings (singleton row)
CREATE TABLE IF NOT EXISTS company_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT DEFAULT 'Diotranics Enterprises Ltd',
  logo_url TEXT,
  address TEXT,
  city TEXT,
  country TEXT DEFAULT 'Kenya',
  phone TEXT,
  whatsapp TEXT,
  email TEXT,
  website TEXT,
  kra_pin TEXT,
  vat_number TEXT,
  business_reg TEXT,
  epra_license TEXT,
  nca_reg TEXT,
  motto TEXT,
  bank_name TEXT,
  bank_account TEXT,
  bank_branch TEXT,
  bank_swift TEXT,
  payment_instructions TEXT,
  footer_disclaimer TEXT,
  quotation_prefix TEXT DEFAULT 'DIO-QT',
  default_currency TEXT DEFAULT 'KES',
  default_validity INTEGER DEFAULT 30,
  default_tax_rate NUMERIC DEFAULT 16,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Clients
CREATE TABLE IF NOT EXISTS qt_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name TEXT NOT NULL,
  company TEXT,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  country TEXT DEFAULT 'Kenya',
  pin_number TEXT,
  project_location TEXT,
  notes TEXT,
  is_returning BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Service Library
CREATE TABLE IF NOT EXISTS qt_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT,
  description TEXT,
  default_unit TEXT DEFAULT 'Item',
  default_price NUMERIC DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Material Library
CREATE TABLE IF NOT EXISTS qt_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  sku TEXT,
  category TEXT,
  unit TEXT DEFAULT 'Pcs',
  default_price NUMERIC DEFAULT 0,
  supplier TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quotations (master record)
CREATE TABLE IF NOT EXISTS quotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_number TEXT UNIQUE NOT NULL,
  reference_number TEXT,
  client_id UUID REFERENCES qt_clients(id),
  project_name TEXT,
  project_location TEXT,
  prepared_by TEXT,
  sales_rep TEXT,
  currency TEXT DEFAULT 'KES',
  tax_type TEXT DEFAULT 'VAT',
  tax_rate NUMERIC DEFAULT 16,
  status TEXT DEFAULT 'draft',
  priority TEXT DEFAULT 'normal',
  validity_days INTEGER DEFAULT 30,
  issue_date DATE DEFAULT CURRENT_DATE,
  valid_until DATE,
  subtotal NUMERIC DEFAULT 0,
  discount_type TEXT DEFAULT 'percentage',
  discount_value NUMERIC DEFAULT 0,
  discount_amount NUMERIC DEFAULT 0,
  tax_amount NUMERIC DEFAULT 0,
  shipping NUMERIC DEFAULT 0,
  labour NUMERIC DEFAULT 0,
  transport NUMERIC DEFAULT 0,
  other_charges NUMERIC DEFAULT 0,
  grand_total NUMERIC DEFAULT 0,
  deposit_required NUMERIC DEFAULT 0,
  scope_of_work TEXT,
  exclusions TEXT,
  terms_conditions TEXT,
  warranty TEXT,
  payment_terms TEXT,
  delivery_time TEXT,
  project_duration TEXT,
  special_instructions TEXT,
  health_safety TEXT,
  template_style TEXT DEFAULT 'corporate',
  is_template BOOLEAN DEFAULT FALSE,
  template_name TEXT,
  notes TEXT,
  internal_notes TEXT,
  version INTEGER DEFAULT 1,
  parent_quotation_id UUID REFERENCES quotations(id),
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quotation Sections (groups of line items)
CREATE TABLE IF NOT EXISTS quotation_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id UUID REFERENCES quotations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quotation Line Items
CREATE TABLE IF NOT EXISTS quotation_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID REFERENCES quotation_sections(id) ON DELETE CASCADE,
  quotation_id UUID REFERENCES quotations(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  unit TEXT DEFAULT 'Item',
  quantity NUMERIC DEFAULT 1,
  unit_price NUMERIC DEFAULT 0,
  discount_type TEXT DEFAULT 'percentage',
  discount_value NUMERIC DEFAULT 0,
  tax_rate NUMERIC DEFAULT 0,
  total NUMERIC DEFAULT 0,
  order_index INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity Log
CREATE TABLE IF NOT EXISTS quotation_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id UUID REFERENCES quotations(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  description TEXT,
  user_email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Signatures
CREATE TABLE IF NOT EXISTS quotation_signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id UUID REFERENCES quotations(id) ON DELETE CASCADE,
  type TEXT, -- 'prepared_by' | 'approved_by' | 'customer'
  name TEXT,
  position TEXT,
  signed_at TIMESTAMPTZ,
  signature_url TEXT
);

-- Enable RLS
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE qt_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE qt_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE qt_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotation_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotation_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotation_signatures ENABLE ROW LEVEL SECURITY;

-- Public read + admin write policies (assuming existing admins table)
CREATE POLICY "Public read company settings" ON company_settings FOR SELECT USING (true);
CREATE POLICY "Admin write company settings" ON company_settings FOR ALL USING (
  EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
);

CREATE POLICY "Public read qt_clients" ON qt_clients FOR SELECT USING (true);
CREATE POLICY "Admin write qt_clients" ON qt_clients FOR ALL USING (
  EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
);

CREATE POLICY "Public read qt_services" ON qt_services FOR SELECT USING (true);
CREATE POLICY "Admin write qt_services" ON qt_services FOR ALL USING (
  EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
);

CREATE POLICY "Public read qt_materials" ON qt_materials FOR SELECT USING (true);
CREATE POLICY "Admin write qt_materials" ON qt_materials FOR ALL USING (
  EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
);

CREATE POLICY "Public read quotations" ON quotations FOR SELECT USING (true);
CREATE POLICY "Admin write quotations" ON quotations FOR ALL USING (
  EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
);

CREATE POLICY "Public read quotation_sections" ON quotation_sections FOR SELECT USING (true);
CREATE POLICY "Admin write quotation_sections" ON quotation_sections FOR ALL USING (
  EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
);

CREATE POLICY "Public read quotation_items" ON quotation_items FOR SELECT USING (true);
CREATE POLICY "Admin write quotation_items" ON quotation_items FOR ALL USING (
  EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
);

CREATE POLICY "Public read quotation_activity" ON quotation_activity FOR SELECT USING (true);
CREATE POLICY "Admin write quotation_activity" ON quotation_activity FOR ALL USING (
  EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
);

CREATE POLICY "Public read quotation_signatures" ON quotation_signatures FOR SELECT USING (true);
CREATE POLICY "Admin write quotation_signatures" ON quotation_signatures FOR ALL USING (
  EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
);

-- Insert initial company settings if empty
INSERT INTO company_settings (company_name, email, phone, website)
SELECT 'Diotranics Enterprises Ltd', 'info@diotranics.com', '+254123456789', 'www.diotranics.com'
WHERE NOT EXISTS (SELECT 1 FROM company_settings);
