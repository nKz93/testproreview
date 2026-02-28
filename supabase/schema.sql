-- ============================================
-- ProReview - Schéma de base de données Supabase
-- ============================================

-- Table des commerçants
CREATE TABLE businesses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  google_place_id TEXT,
  google_review_url TEXT,
  logo_url TEXT,
  business_type TEXT DEFAULT 'restaurant',
  sms_template TEXT DEFAULT 'Bonjour {name}, merci pour votre visite chez {business} ! Votre avis compte pour nous 🙏 {link}',
  email_template TEXT DEFAULT 'Bonjour {name}, merci pour votre visite chez {business} ! Votre avis compte beaucoup pour nous.',
  auto_send_enabled BOOLEAN DEFAULT false,
  auto_send_delay_hours INTEGER DEFAULT 2,
  send_method TEXT DEFAULT 'sms' CHECK (send_method IN ('sms', 'email', 'both')),
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'pro', 'business')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  monthly_sms_limit INTEGER DEFAULT 50,
  monthly_sms_used INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des clients du commerçant
CREATE TABLE customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  visit_date TIMESTAMPTZ DEFAULT NOW(),
  tags TEXT[] DEFAULT '{}',
  source TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'csv', 'api', 'qr')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Demandes d'avis envoyées
CREATE TABLE review_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  unique_code TEXT UNIQUE NOT NULL,
  method TEXT NOT NULL CHECK (method IN ('sms', 'email')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'opened', 'clicked', 'reviewed', 'feedback', 'failed')),
  sent_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tracking des clics
CREATE TABLE review_clicks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID REFERENCES review_requests(id) ON DELETE CASCADE,
  satisfaction_score INTEGER CHECK (satisfaction_score BETWEEN 1 AND 5),
  action TEXT CHECK (action IN ('redirect_google', 'private_feedback')),
  user_agent TEXT,
  ip_address TEXT,
  clicked_at TIMESTAMPTZ DEFAULT NOW()
);

-- Feedbacks privés (avis négatifs interceptés)
CREATE TABLE private_feedbacks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  request_id UUID REFERENCES review_requests(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  score INTEGER CHECK (score BETWEEN 1 AND 5),
  message TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  is_read BOOLEAN DEFAULT false,
  is_resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- QR Codes générés
CREATE TABLE qr_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'QR Code Principal',
  short_code TEXT UNIQUE NOT NULL,
  scan_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  design_config JSONB DEFAULT '{"color": "#3B82F6", "style": "rounded"}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Campagnes d'envoi groupé
CREATE TABLE campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  method TEXT NOT NULL CHECK (method IN ('sms', 'email', 'both')),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'completed')),
  total_recipients INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  scheduled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Factures
CREATE TABLE invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  stripe_invoice_id TEXT,
  amount_cents INTEGER NOT NULL,
  status TEXT DEFAULT 'pending',
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,
  pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Row Level Security
-- ============================================

ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE private_feedbacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Policies : chaque commerçant ne voit que ses propres données
CREATE POLICY "Users see own business" ON businesses FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Users see own customers" ON customers FOR ALL USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));
CREATE POLICY "Users see own requests" ON review_requests FOR ALL USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));
CREATE POLICY "Users see own clicks" ON review_clicks FOR ALL USING (request_id IN (SELECT id FROM review_requests WHERE business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid())));
CREATE POLICY "Users see own feedbacks" ON private_feedbacks FOR ALL USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));
CREATE POLICY "Users see own qr" ON qr_codes FOR ALL USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));
CREATE POLICY "Users see own campaigns" ON campaigns FOR ALL USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));
CREATE POLICY "Users see own invoices" ON invoices FOR ALL USING (business_id IN (SELECT id FROM businesses WHERE user_id = auth.uid()));

-- Accès public pour la page avis client (sans auth)
CREATE POLICY "Public can read review requests by code" ON review_requests FOR SELECT USING (true);
CREATE POLICY "Public can insert clicks" ON review_clicks FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can insert feedbacks" ON private_feedbacks FOR INSERT WITH CHECK (true);

-- ============================================
-- Indexes pour les performances
-- ============================================

CREATE INDEX idx_businesses_user_id ON businesses(user_id);
CREATE INDEX idx_customers_business_id ON customers(business_id);
CREATE INDEX idx_review_requests_business_id ON review_requests(business_id);
CREATE INDEX idx_review_requests_unique_code ON review_requests(unique_code);
CREATE INDEX idx_review_requests_customer_id ON review_requests(customer_id);
CREATE INDEX idx_review_clicks_request_id ON review_clicks(request_id);
CREATE INDEX idx_private_feedbacks_business_id ON private_feedbacks(business_id);
CREATE INDEX idx_private_feedbacks_is_read ON private_feedbacks(is_read);
CREATE INDEX idx_qr_codes_short_code ON qr_codes(short_code);
CREATE INDEX idx_campaigns_business_id ON campaigns(business_id);

-- ============================================
-- Trigger pour updated_at automatique
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_businesses_updated_at
  BEFORE UPDATE ON businesses
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

-- ============================================
-- Fonction RPC pour incrémenter le compteur SMS
-- ============================================

CREATE OR REPLACE FUNCTION increment_sms_count(p_business_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE businesses SET monthly_sms_used = monthly_sms_used + 1 WHERE id = p_business_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
