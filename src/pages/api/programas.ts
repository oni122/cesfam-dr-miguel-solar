// src/pages/api/programas.ts
import type { APIRoute } from "astro";
import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

const prisma = globalThis.prisma || new PrismaClient();
if (!globalThis.prisma) globalThis.prisma = prisma;

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
    return new Response(
      JSON.stringify({ error: "Error al obtener programas" }),
      { status: 500 }
    );
  }
};
