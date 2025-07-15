CREATE TABLE public.geo_block_logs (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    ip_address text NOT NULL,
    country text,
    region text,
    city text,
    blocked_at timestamp with time zone DEFAULT NOW(),
    reason text,
    additional_info jsonb
);
CREATE INDEX idx_geo_block_logs_ip ON public.geo_block_logs(ip_address);
CREATE INDEX idx_geo_block_logs_blocked_at ON public.geo_block_logs(blocked_at);
ALTER TABLE public.geo_block_logs ENABLE ROW LEVEL SECURITY;
CREATE TABLE public.geo_block_settings (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    blocked_country text NOT NULL,
    is_active boolean DEFAULT true,
    block_reason text,
    created_at timestamp with time zone DEFAULT NOW(),
    updated_at timestamp with time zone DEFAULT NOW()
);
CREATE UNIQUE INDEX idx_geo_block_settings_country ON public.geo_block_settings(blocked_country);
ALTER TABLE public.geo_block_settings ENABLE ROW LEVEL SECURITY;
CREATE TABLE public.hero_slides (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    title text NOT NULL,
    subtitle text,
    image_url text NOT NULL,
    link_url text,
    display_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT NOW(),
    updated_at timestamp with time zone DEFAULT NOW()
);
CREATE INDEX idx_hero_slides_display_order ON public.hero_slides(display_order);
CREATE INDEX idx_hero_slides_active ON public.hero_slides(is_active);
ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;
CREATE TABLE public.url_clicks (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    original_url text NOT NULL,
    short_code text UNIQUE NOT NULL,
    click_count bigint DEFAULT 0,
    created_at timestamp with time zone DEFAULT NOW(),
    last_clicked_at timestamp with time zone,
    user_id uuid REFERENCES auth.users(id) ON DELETE
    SET NULL
);
CREATE INDEX idx_url_clicks_short_code ON public.url_clicks(short_code);
CREATE INDEX idx_url_clicks_user_id ON public.url_clicks(user_id);
ALTER TABLE public.url_clicks ENABLE ROW LEVEL SECURITY;