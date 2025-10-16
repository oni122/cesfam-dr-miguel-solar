import type { MiddlewareHandler } from "astro";
import {
  SESSION_COOKIE_NAME,
  getSessionFromToken,
} from "./utils/session";

export const onRequest: MiddlewareHandler = async (context, next) => {
  const token = context.cookies.get(SESSION_COOKIE_NAME)?.value;
  let user: { id: number; rut: string } | null = null;

  if (token) {
    const session = await getSessionFromToken(token);

    if (session) {
      user = {
        id: session.usuario.id_usuario,
        rut: session.usuario.rut,
      };
    } else {
      context.cookies.delete(SESSION_COOKIE_NAME, { path: "/" });
    }
  }

  context.locals.user = user;

  const pathname = context.url.pathname;
  const isProtectedRoute =
    pathname.startsWith("/perfil") || pathname.startsWith("/reserva");

  if (isProtectedRoute && !user) {
    return context.redirect("/login");
  }

  return next();
};
