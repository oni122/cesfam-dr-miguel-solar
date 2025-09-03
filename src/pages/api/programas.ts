import type { APIRoute } from 'astro'
import { supabase } from '../../lib/supabaseclient'

export const GET: APIRoute = async () => {
  // Traemos programas y sus servicios relacionados
  const { data: programas, error } = await supabase
    .from('programa')
    .select('id_programa, nombre, servicios(id_servicio, nombre, id_programa)')

  if (error) {
    console.error('Error Supabase:', error)
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }

  return new Response(JSON.stringify(programas), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  })
}
