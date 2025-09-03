// src/pages/api/programas.ts
import type { APIRoute } from 'astro';
import { supabase } from '../../lib/supabaseclient';

export const GET: APIRoute = async () => {
  // Traer programas junto con sus servicios usando relación
  const { data, error } = await supabase
    .from('programa')
    .select(`
      id_programa,
      nombre,
      servicio (
        id_servicio,
        nombre
      )
    `);

  if (error) {
    console.error('Error Supabase:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};
