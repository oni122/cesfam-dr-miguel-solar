import type { MiddlewareHandler } from "astro";
import { SESSION_COOKIE_NAME, getSessionFromToken } from "./utils/session";
import { isAdminByRut } from "./utils/admin";

export const onRequest: MiddlewareHandler = async (context, next) => {
  const token = context.cookies.get(SESSION_COOKIE_NAME)?.value;
  let user: { id: number; rut: string; isAdmin: boolean } | null = null;

  if (token) {
    const session = await getSessionFromToken(token);

    if (session) {
      const isAdmin = await isAdminByRut(session.usuario.rut);
      user = {
        id: session.usuario.id_usuario,
        rut: session.usuario.rut,
        isAdmin,
      };
    } else {
      context.cookies.delete(SESSION_COOKIE_NAME, { path: "/" });
    }
  }

  context.locals.user = user;

  const pathname = context.url.pathname;
  const isProtectedRoute =
    pathname.startsWith("/perfil") || pathname.startsWith("/reserva");
  const isAdminRoute = pathname.startsWith("/admin");

  if (isProtectedRoute && !user) {
    return context.redirect("/login");
  }

  if (isAdminRoute) {
    if (!user) {
      return context.redirect("/login");
    }

    if (!user.isAdmin) {
      return context.redirect("/");
    }
  }

  return next();
};
