export const prerender = false;

import type { APIRoute } from "astro";
import { getSupabaseServer } from "../../lib/supabase-server";

export const POST: APIRoute = async ({ request }) => {
  try {

    console.log("METHOD:", request.method);
    console.log("CONTENT TYPE:", request.headers.get("content-type"));

    const formData = await request.formData();

    const nombres = formData.get("nombres")?.toString();
    const apellidos = formData.get("apellidos")?.toString();
    const telefono = formData.get("telefono")?.toString();
    const email = formData.get("email")?.toString();
    const dni = formData.get("dni")?.toString();
    const edad = Number(formData.get("edad"));
    const distrito = formData.get("distrito")?.toString();

    const puesto = formData.get("puesto")?.toString();

    const licencia = formData.get("licencia")?.toString();

    const categoria = formData.get("categoria")?.toString();

    const experiencia = Number(
      formData.get("experiencia")
    );

    const cv = formData.get("cv") as File;

    let cvUrl = "";

    if (cv && cv.size > 0) {

      const fileName =
        `${Date.now()}-${cv.name}`;

      console.log("ANTES DE SUBIR");

      const { error: uploadError } =
        await getSupabaseServer().storage
          .from("cv-candidatos")
          .upload(fileName, cv);

      console.log("DESPUES DE SUBIR");

      if (uploadError) {
        throw uploadError;
      }

      const { data } =
        getSupabaseServer().storage
          .from("cv-candidatos")
          .getPublicUrl(fileName);

      cvUrl = data.publicUrl;
    }

    const { error } =
      await getSupabaseServer()
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
          cv_url: cvUrl
        });

    if (error) {
      throw error;
    }

    return new Response(
      JSON.stringify({
        success: true
      }),
      { status: 200 }
    );

  } catch (error) {

    console.error(error);

    return new Response(
      JSON.stringify({
        success: false
      }),
      { status: 500 }
    );
  }
};