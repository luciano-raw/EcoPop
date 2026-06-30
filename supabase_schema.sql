-- SQL Schema for EcoPop Database (Supabase)
-- You can copy-paste this directly into the Supabase SQL Editor

-- 1. Users Table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    points INTEGER DEFAULT 0 NOT NULL,
    club_id VARCHAR(50) UNIQUE NOT NULL,
    recycled_count INTEGER DEFAULT 0 NOT NULL,
    co2_saved DECIMAL(10, 2) DEFAULT 0.0 NOT NULL,
    water_saved DECIMAL(10, 2) DEFAULT 0.0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (id)
);

-- Enable RLS for users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow individual read" ON public.users 
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Allow individual update" ON public.users 
    FOR UPDATE USING (auth.uid() = id);

-- 2. QR Codes Table (The recyclable items)
CREATE TABLE IF NOT EXISTS public.qr_codes (
    code VARCHAR(100) PRIMARY KEY,
    points_value INTEGER DEFAULT 100 NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for qr_codes
ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read of active state" ON public.qr_codes 
    FOR SELECT USING (true);

-- 3. Claimed Codes Log Table
CREATE TABLE IF NOT EXISTS public.claimed_codes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    code VARCHAR(100) REFERENCES public.qr_codes(code) NOT NULL,
    claimed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (code) -- A QR code can only be claimed once
);

-- Enable RLS for claimed_codes
ALTER TABLE public.claimed_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow individual read of claims" ON public.claimed_codes 
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow individual insertion of claims" ON public.claimed_codes 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 4. Coupons Table (Claimed Rewards)
CREATE TABLE IF NOT EXISTS public.user_coupons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    reward_id VARCHAR(100) NOT NULL,
    coupon_code VARCHAR(100) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'active' NOT NULL CHECK (status IN ('active', 'used')),
    claimed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for user_coupons
ALTER TABLE public.user_coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow individual read of coupons" ON public.user_coupons 
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow individual insertion of coupons" ON public.user_coupons 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow individual updates to coupons" ON public.user_coupons 
    FOR UPDATE USING (auth.uid() = user_id);


-- ==========================================
-- Triggers and Functions for Automated Point Accumulation
-- ==========================================

-- Function to handle QR Code claim logic securely on the server
CREATE OR REPLACE FUNCTION public.claim_qr_code(p_user_id UUID, p_code VARCHAR)
RETURNS JSON AS $$
DECLARE
    v_qr_points INTEGER;
    v_qr_active BOOLEAN;
    v_recycled_count INTEGER;
BEGIN
    -- Check if QR code exists and is active
    SELECT points_value, is_active INTO v_qr_points, v_qr_active
    FROM public.qr_codes
    WHERE code = p_code;

    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'message', 'El código QR no es válido.');
    END IF;

    IF NOT v_qr_active THEN
        RETURN json_build_object('success', false, 'message', 'Este vaso ya ha sido reciclado y reclamado.');
    END IF;

    -- Deactivate the QR Code
    UPDATE public.qr_codes
    SET is_active = false
    WHERE code = p_code;

    -- Create claim record
    INSERT INTO public.claimed_codes (user_id, code)
    VALUES (p_user_id, p_code);

    -- Get user's current recycled count to update impact calculations
    SELECT recycled_count + 1 INTO v_recycled_count
    FROM public.users
    WHERE id = p_user_id;

    -- Update User Points and Stats
    UPDATE public.users
    SET 
        points = points + v_qr_points,
        recycled_count = v_recycled_count,
        co2_saved = ROUND((v_recycled_count * 0.12)::numeric, 2),
        water_saved = ROUND((v_recycled_count * 0.25)::numeric, 2)
    WHERE id = p_user_id;

    RETURN json_build_object(
        'success', true, 
        'message', '¡Código QR validado! Puntos acreditados.', 
        'points_earned', v_qr_points
    );
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'message', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Function to handle Reward Purchase securely on the server
CREATE OR REPLACE FUNCTION public.claim_reward(p_user_id UUID, p_reward_id VARCHAR, p_points_cost INTEGER)
RETURNS JSON AS $$
DECLARE
    v_user_points INTEGER;
    v_coupon_code VARCHAR;
    v_new_coupon public.user_coupons;
BEGIN
    -- Get user points
    SELECT points INTO v_user_points
    FROM public.users
    WHERE id = p_user_id;

    IF v_user_points < p_points_cost THEN
        RETURN json_build_object('success', false, 'message', 'Puntos insuficientes para realizar el canje.');
    END IF;

    -- Generate random coupon code
    v_coupon_code := 'ECO-' || UPPER(SUBSTRING(p_reward_id FROM 5 FOR 3)) || '-' || FLOOR(100000 + RANDOM() * 900000)::VARCHAR;

    -- Deduct points
    UPDATE public.users
    SET points = points - p_points_cost
    WHERE id = p_user_id;

    -- Create Coupon
    INSERT INTO public.user_coupons (user_id, reward_id, coupon_code)
    VALUES (p_user_id, p_reward_id, v_coupon_code)
    RETURNING * INTO v_new_coupon;

    RETURN json_build_object(
        'success', true, 
        'message', '¡Canje exitoso!', 
        'coupon', json_build_object(
            'id', v_new_coupon.id,
            'coupon_code', v_new_coupon.coupon_code,
            'reward_id', v_new_coupon.reward_id,
            'status', v_new_coupon.status
        )
    );
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'message', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
