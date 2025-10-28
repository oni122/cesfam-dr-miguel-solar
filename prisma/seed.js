import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seed: iniciando carga básica...');

  const programaSaludMental = await prisma.programa.create({
    data: { nombre: 'Programa de Salud Mental' },
  });

  const programaCardio = await prisma.programa.create({
    data: { nombre: 'Programa Cardiovascular' },
  });

  await prisma.servicio.createMany({
    data: [
      { nombre: 'Atención Psicológica', id_programa: programaSaludMental.id_programa },
      { nombre: 'Taller de Apoyo Emocional', id_programa: programaSaludMental.id_programa },
      { nombre: 'Control de Hipertensión', id_programa: programaCardio.id_programa },
      { nombre: 'Examen de Colesterol', id_programa: programaCardio.id_programa },
    ],
  });

  await prisma.especialidad.createMany({
    data: [
      { nombre_especialidad: 'Medicina General' },
      { nombre_especialidad: 'Pediatría' },
      { nombre_especialidad: 'Ginecología' },
      { nombre_especialidad: 'Psiquiatría' },
    ],
  });

  await prisma.estadoReserva.createMany({
    data: [
      { nombre_estado: 'Pendiente' },
      { nombre_estado: 'Confirmada' },
      { nombre_estado: 'Cancelada' },
      { nombre_estado: 'Completada' },
    ],
  });

  const laboratorio = await prisma.areaExamen.create({
    data: { nombre_area: 'Laboratorio' },
  });

  const imagenologia = await prisma.areaExamen.create({
    data: { nombre_area: 'Imagenología' },
  });

  await prisma.examen.createMany({
    data: [
      { nombre_examen: 'Hemograma Completo', id_area_examen: laboratorio.id_area_examen },
      { nombre_examen: 'Examen de Orina', id_area_examen: laboratorio.id_area_examen },
      { nombre_examen: 'Radiografía de Tórax', id_area_examen: imagenologia.id_area_examen },
      { nombre_examen: 'Ecografía Abdominal', id_area_examen: imagenologia.id_area_examen },
    ],
  });

  const [demoPassword, adminPassword] = await Promise.all([
    bcrypt.hash('ContrasenaDemo1!', 10),
    bcrypt.hash('AdminDemo1!', 10),
  ]);

  await Promise.all([
    prisma.usuario.upsert({
      where: { rut: '11111111-1' },
      update: { password: demoPassword },
      create: {
        rut: '11111111-1',
        password: demoPassword,
      },
    }),
    prisma.usuario.upsert({
      where: { rut: '22222222-2' },
      update: { password: adminPassword },
      create: {
        rut: '22222222-2',
        password: adminPassword,
      },
    }),
  ]);

  console.log('Seed: datos insertados correctamente. Usuarios disponibles: 11111111-1 / ContrasenaDemo1!, 22222222-2 / AdminDemo1!');
}

main()
  .catch((e) => {
    console.error('Seed: error al insertar datos', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
