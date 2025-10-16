import type { APIRoute } from "astro";
import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";
import { normalizeRut } from "../../utils/rut";

const jsonResponse = (status: number, payload: unknown) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });

export const POST: APIRoute = async ({ request }) => {
  const body = (await request.json().catch(() => null)) as {
    rut?: string;
    password?: string;
  } | null;

  if (!body) {
    return jsonResponse(400, { error: "Solicitud inválida." });
  }

  const rut = body.rut?.trim() ?? "";
  const password = body.password ?? "";

  if (!rut || !password) {
    return jsonResponse(400, { error: "Debes ingresar tu RUT y contraseña." });
  }

  const normalizedRut = normalizeRut(rut);

  try {
    const user = await prisma.usuario.findUnique({ where: { rut: normalizedRut } });

    if (!user) {
      return jsonResponse(401, { error: "RUT o contraseña incorrectos." });
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return jsonResponse(401, { error: "RUT o contraseña incorrectos." });
    }

    return jsonResponse(200, { message: "Autenticación exitosa." });
  } catch (error) {
    console.error("login error", error);
    return jsonResponse(500, { error: "No pudimos iniciar tu sesión. Inténtalo más tarde." });
  }
};
