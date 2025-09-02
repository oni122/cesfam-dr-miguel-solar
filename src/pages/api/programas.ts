import type { APIRoute } from "astro";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const GET: APIRoute = async () => {
  try {
    const programas = await prisma.programa.findMany({
      include: { servicios: true },
    });
    return new Response(JSON.stringify(programas), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error en API programas:", error);
    return new Response(JSON.stringify({ error: "Error al obtener programas" }), { status: 500 });
  }
};
