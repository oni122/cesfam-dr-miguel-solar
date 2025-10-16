import type { APIRoute } from "astro";
import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";
import { normalizeRut } from "../../utils/rut";
import {
  SESSION_COOKIE_NAME,
  createUserSession,
  sessionCookieOptions,
} from "../../utils/session";

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
    return jsonResponse(400, { error: "Solicitud inv&aacute;lida." });
  }

  const rut = body.rut?.trim() ?? "";
  const password = body.password ?? "";

  if (!rut || !password) {
    return jsonResponse(400, { error: "Debes ingresar tu RUT y contrase&ntilde;a." });
  }

  const normalizedRut = normalizeRut(rut);

  try {
    const user = await prisma.usuario.findUnique({ where: { rut: normalizedRut } });

    if (!user) {
      return jsonResponse(401, { error: "RUT o contrase&ntilde;a incorrectos." });
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return jsonResponse(401, { error: "RUT o contrase&ntilde;a incorrectos." });
    }

    await prisma.session.deleteMany({ where: { user_id: user.id_usuario } });
    const { token, expiresAt } = await createUserSession(user.id_usuario);
    context.cookies.set(SESSION_COOKIE_NAME, token, sessionCookieOptions(expiresAt));

    return jsonResponse(200, {
      message: "Autenticaci&oacute;n exitosa.",
      redirect: "/perfil",
    });
  } catch (error) {
    console.error("login error", error);
    return jsonResponse(500, { error: "No pudimos iniciar tu sesi&oacute;n. Int&eacute;ntalo m&aacute;s tarde." });
  }
};
