export const prerender = false;
export const runtime = "nodejs";

import type { APIRoute } from "astro";
import bcrypt from "bcryptjs";
import { prisma } from "../../../lib/prisma";
import { normalizeRut } from "../../../utils/rut";
import {
  SESSION_COOKIE_NAME,
  getSessionFromToken,
} from "../../../utils/session";
import { getWorkerByRut, isAdminByRut } from "../../../utils/admin";

const jsonResponse = (status: number, payload: unknown) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const sanitizeString = (value: unknown) =>
  typeof value === "string" ? value.trim() : "";

export const POST: APIRoute = async ({ request, cookies }) => {
  const token = cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return jsonResponse(401, { error: "No autorizado." });
  }

  const session = await getSessionFromToken(token);

  if (!session) {
    cookies.delete(SESSION_COOKIE_NAME, { path: "/" });
    return jsonResponse(401, { error: "Sesion invalida." });
  }

  const isAdmin = await isAdminByRut(session.usuario.rut);

  if (!isAdmin) {
    return jsonResponse(403, { error: "Requiere permisos de administrador." });
  }

  const payload = await request.json().catch(() => null);

  if (!payload || typeof payload !== "object") {
    return jsonResponse(400, { error: "Solicitud invalida." });
  }

  const rut = sanitizeString((payload as Record<string, unknown>).rut);
  const primerNombre = sanitizeString(
    (payload as Record<string, unknown>).primerNombre,
  );
  const segundoNombreRaw = sanitizeString(
    (payload as Record<string, unknown>).segundoNombre,
  );
  const apellidoPaterno = sanitizeString(
    (payload as Record<string, unknown>).apellidoPaterno,
  );
  const apellidoMaterno = sanitizeString(
    (payload as Record<string, unknown>).apellidoMaterno,
  );
  const correo = sanitizeString((payload as Record<string, unknown>).correo);
  const celular = sanitizeString((payload as Record<string, unknown>).celular);
  const direccion = sanitizeString(
    (payload as Record<string, unknown>).direccion,
  );
  const estado =
    sanitizeString((payload as Record<string, unknown>).estado) || "Activo";
  const especialidadIdValue = (payload as Record<string, unknown>)
    .especialidadId;

  if (
    !rut ||
    !primerNombre ||
    !apellidoPaterno ||
    !apellidoMaterno ||
    !correo ||
    !celular ||
    !direccion ||
    especialidadIdValue === undefined
  ) {
    return jsonResponse(400, {
      error:
        "Faltan datos obligatorios. Verifica RUT, nombres, apellidos, especialidad y datos de contacto.",
    });
  }

  const especialidadId = Number(especialidadIdValue);

  if (!Number.isInteger(especialidadId) || especialidadId <= 0) {
    return jsonResponse(400, { error: "Especialidad invalida." });
  }

  const normalizedRut = normalizeRut(rut);

  if (!normalizedRut || normalizedRut.length < 3 || !normalizedRut.includes("-")) {
    return jsonResponse(400, { error: "RUT invalido." });
  }

  const existingUser = await prisma.usuario.findUnique({
    where: { rut: normalizedRut },
    select: { id_usuario: true },
  });

  if (existingUser) {
    return jsonResponse(409, {
      error:
        "Ya existe un usuario registrado con ese RUT. Verifica la informacion antes de continuar.",
    });
  }

  const existingWorker = await getWorkerByRut(normalizedRut);

  if (existingWorker) {
    return jsonResponse(409, {
      error:
        "Ya existe un trabajador registrado con ese RUT. Si necesitas reactivar el acceso, actualiza sus datos.",
    });
  }

  const especialidad = await prisma.especialidad.findUnique({
    where: { id_especialidad: especialidadId },
    select: { id_especialidad: true, nombre_especialidad: true },
  });

  if (!especialidad) {
    return jsonResponse(404, { error: "Especialidad no encontrada." });
  }

  const primerNombreToken = primerNombre.split(/\s+/)[0]?.toLowerCase() ?? "";

  if (!primerNombreToken) {
    return jsonResponse(400, {
      error: "El primer nombre no es valido para generar la contrasena.",
    });
  }

  const initialPassword = `${normalizedRut}${primerNombreToken}`;
  const hashedPassword = await bcrypt.hash(initialPassword, 10);
  const segundoNombre =
    segundoNombreRaw.length > 0 ? segundoNombreRaw : undefined;

  try {
    const createdWorker = await prisma.$transaction(async (tx) => {
      await tx.usuario.create({
        data: {
          rut: normalizedRut,
          password: hashedPassword,
        },
      });

      return tx.trabajador.create({
        data: {
          primer_nombre_trabajador: primerNombre,
          segundo_nombre_trabajador: segundoNombre,
          apellido_p_trabajador: apellidoPaterno,
          apellido_m_trabajador: apellidoMaterno,
          rut_trabajador: normalizedRut,
          celular_trabajador: celular,
          correo_trabajador: correo,
          direccion_trabajador: direccion,
          estado_trabajador: estado,
          id_especialidad: especialidad.id_especialidad,
        },
        include: {
          especialidad: {
            select: {
              id_especialidad: true,
              nombre_especialidad: true,
            },
          },
        },
      });
    });

    return jsonResponse(201, {
      message: "Trabajador creado correctamente.",
      initialPassword,
      trabajador: {
        id: createdWorker.id_trabajador,
        nombres: `${createdWorker.primer_nombre_trabajador}${
          createdWorker.segundo_nombre_trabajador
            ? ` ${createdWorker.segundo_nombre_trabajador}`
            : ""
        }`.trim(),
        apellidos: `${createdWorker.apellido_p_trabajador} ${createdWorker.apellido_m_trabajador}`,
        rut: createdWorker.rut_trabajador,
        especialidad: createdWorker.especialidad?.nombre_especialidad ?? null,
        estado: createdWorker.estado_trabajador,
      },
    });
  } catch (error) {
    console.error("create worker error", error);
    return jsonResponse(500, {
      error:
        "No pudimos crear el trabajador. Intenta nuevamente o revisa los datos ingresados.",
    });
  }
};
