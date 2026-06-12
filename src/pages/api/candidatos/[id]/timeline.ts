export const prerender = false;

import type { APIRoute } from "astro";
import { supabaseServer } from "../../../../lib/supabase-server";

export const POST: APIRoute = async ({ params, request }) => {

  const candidatoId = params.id;

  const body =
    await request.json();

  const {
    tipo,
    comentario
  } = body;

  const { data, error } =
  await supabaseServer
    .from("candidato_seguimiento")
    .insert({
      candidato_id: candidatoId,
      tipo,
      comentario
    })
    .select()
    .single();

  if (error) {

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      { status: 500 }
    );

  }

  return Response.json({
    success: true,
    data
  });
};