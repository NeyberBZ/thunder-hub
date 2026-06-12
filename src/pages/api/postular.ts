export const prerender = false;

import type { APIRoute } from "astro";
import { getSupabaseServer } from "../../lib/supabase-server";

function cleanFileName(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9.-]/g, "_");
}

function badRequest(message: string) {
  return new Response(
    JSON.stringify({
      success: false,
      error: message,
    }),
    { status: 400 }
  );
}

export const POST: APIRoute = async ({ request }) => {
  const supabase = getSupabaseServer();

  try {
    // 🔹 Validación de método (extra seguridad)
    if (request.method !== "POST") {
      return badRequest("Método no permitido");
    }

    const formData = await request.formData();

    // 🔹 Extraer datos
    const nombres = formData.get("nombres")?.toString()?.trim();
    const apellidos = formData.get("apellidos")?.toString()?.trim();
    const telefono = formData.get("telefono")?.toString()?.trim();
    const email = formData.get("email")?.toString()?.trim();
    const dni = formData.get("dni")?.toString()?.trim();
    const distrito = formData.get("distrito")?.toString()?.trim();
    const puesto = formData.get("puesto")?.toString()?.trim();
    const licencia = formData.get("licencia")?.toString()?.trim();
    const categoria = formData.get("categoria")?.toString()?.trim();

    const edadRaw = formData.get("edad");
    const experienciaRaw = formData.get("experiencia");

    const edad = edadRaw ? Number(edadRaw) : null;
    const experiencia = experienciaRaw ? Number(experienciaRaw) : null;

    const cv = formData.get("cv");

    // 🔴 VALIDACIÓN CRÍTICA
    if (
      !nombres ||
      !apellidos ||
      !telefono ||
      !email ||
      !dni ||
      !puesto
    ) {
      return badRequest("Faltan campos obligatorios");
    }

    if (!(cv instanceof File)) {
      return badRequest("CV inválido");
    }

    if (cv.size === 0) {
      return badRequest("El archivo CV está vacío");
    }

    let cvUrl = null;

    // 🔹 UPLOAD SEGURO
    try {
      const fileName = `${Date.now()}-${cleanFileName(cv.name)}`;

      const { error: uploadError } = await supabase.storage
        .from("cv-candidatos")
        .upload(fileName, cv, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        return badRequest("Error subiendo el CV");
      }

      const { data } = supabase.storage
        .from("cv-candidatos")
        .getPublicUrl(fileName);

      cvUrl = data.publicUrl;
    } catch (err) {
      console.error("Storage crash:", err);
      return badRequest("Error procesando archivo");
    }

    // 🔹 INSERT SEGURO EN DB
    const { error: dbError } = await supabase
      .from("candidatos")
      .insert({
        nombres,
        apellidos,
        telefono,
        email,
        dni,
        edad,
        distrito,
        puesto_postular: puesto,
        licencia_conducir: licencia,
        categoria_licencia: categoria,
        experiencia_anios: experiencia,
        cv_url: cvUrl,
        estado: "Nuevo",
        created_at: new Date().toISOString(),
      });

    if (dbError) {
      console.error("DB error:", dbError);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Error guardando candidato",
        }),
        { status: 500 }
      );
    }

    // 🔹 RESPUESTA PRO
    return new Response(
      JSON.stringify({
        success: true,
        message: "Candidato registrado correctamente",
      }),
      { status: 200 }
    );

  } catch (error) {
    console.error("UNEXPECTED ERROR:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: "Error interno del servidor",
      }),
      { status: 500 }
    );
  }
};