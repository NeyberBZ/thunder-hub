export const prerender = false;

import type { APIRoute } from "astro";
import { getSupabaseServer } from "../../../../lib/supabase-server";

export const POST: APIRoute = async ({ params, request }) => {

  const id = params.id;

  if (!id) {
    return new Response(
      JSON.stringify({
        success: false,
        message: "ID requerido"
      }),
      { status: 400 }
    );
  }

  const body = await request.json();

  const {
    estado,
    observaciones,
    fecha_contacto
  } = body;

  const updateData: any = {};

  if (estado !== undefined)
    updateData.estado = estado;

  if (observaciones !== undefined)
    updateData.observaciones = observaciones;

  if (fecha_contacto !== undefined)
    updateData.fecha_contacto = fecha_contacto;

  const { error } =
    await getSupabaseServer()
      .from("candidatos")
      .update(updateData)
      .eq("id", id);

  if (error) {

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      { status: 500 }
    );

  }

  return new Response(
    JSON.stringify({
      success: true
    })
  );
};