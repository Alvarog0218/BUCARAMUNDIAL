-- Tabla de partidos
CREATE TABLE IF NOT EXISTS public.mundial_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_a TEXT NOT NULL,
    team_b TEXT NOT NULL,
    match_time TIMESTAMPTZ NOT NULL,
    flag_a TEXT, 
    flag_b TEXT, 
    final_score_a INTEGER,
    final_score_b INTEGER,
    prize TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla de predicciones
CREATE TABLE IF NOT EXISTS public.mundial_predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID NOT NULL REFERENCES public.mundial_matches(id) ON DELETE CASCADE,
    cedula TEXT NOT NULL,
    nombre TEXT NOT NULL,
    whatsapp TEXT NOT NULL,
    score_a INTEGER NOT NULL,
    score_b INTEGER NOT NULL,
    claimed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    
    -- Restricción única: Una persona (cédula) solo puede votar una vez por partido
    UNIQUE(match_id, cedula)
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.mundial_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mundial_predictions ENABLE ROW LEVEL SECURITY;

-- Políticas para mundial_matches: Cualquiera puede ver los partidos
CREATE POLICY "Permitir lectura pública de partidos" 
ON public.mundial_matches FOR SELECT 
USING (true);

-- Políticas para mundial_predictions: Cualquiera puede insertar, pero no leer las de otros
CREATE POLICY "Permitir inserción pública de predicciones" 
ON public.mundial_predictions FOR INSERT 
WITH CHECK (true);

-- Política para evitar lectura pública de predicciones (privacidad)
CREATE POLICY "Solo administradores leen predicciones" 
ON public.mundial_predictions FOR SELECT 
USING (false); -- Cambiar esto si se requiere un panel de admin
