-- Migración para añadir premios y resultados finales
ALTER TABLE public.mundial_matches 
ADD COLUMN IF NOT EXISTS prize TEXT DEFAULT 'Premio por definir',
ADD COLUMN IF NOT EXISTS final_score_a INTEGER,
ADD COLUMN IF NOT EXISTS final_score_b INTEGER;

-- Actualizar políticas para permitir ver predicciones en el panel admin
-- (Nota: Para un panel admin web simple, permitiremos lectura con una clave de servicio o política de visualización)
-- Por ahora, habilitaremos lectura si se requiere en el panel admin.
DROP POLICY IF EXISTS "Solo administradores leen predicciones" ON public.mundial_predictions;

CREATE POLICY "Lectura de predicciones para el panel admin" 
ON public.mundial_predictions FOR SELECT 
USING (true); -- En un entorno real, esto se filtraría por rol de usuario
