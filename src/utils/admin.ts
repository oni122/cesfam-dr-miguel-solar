import { prisma } from "../lib/prisma";

export const ADMIN_SPECIALTY_NAME = "Administracion";

export const isAdminByRut = async (rut: string) => {
  if (!rut) {
    return false;
  }

  const adminRecord = await prisma.trabajador.findFirst({
    where: {
      rut_trabajador: rut,
      especialidad: {
        is: {
          nombre_especialidad: ADMIN_SPECIALTY_NAME,
        },
      },
    },
    select: { id_trabajador: true },
  });

  return Boolean(adminRecord);
};
