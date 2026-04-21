import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const workspace = await prisma.workspace.findFirst();
  if (!workspace) throw new Error("Create a workspace first");

  const clients = [
    {
      name: "Acme Corp",
      email: "acme@example.com",
      company: "Acme Inc",
      workspaceId: workspace.id,
    },
    {
      name: "Globex Inc",
      email: "globex@example.com",
      company: "Globex",
      workspaceId: workspace.id,
    },
    {
      name: "Wayne Enterprises",
      email: "wayne@example.com",
      company: "Wayne Corp",
      workspaceId: workspace.id,
    },
  ];

  for (const client of clients) {
    await prisma.client.upsert({
      where: { id: "dummy" }, // forces create
      update: {},
      create: client,
    });
  }

  const all = await prisma.client.findMany({
    where: { workspaceId: workspace.id },
  });
  console.log(
    "Clients:",
    all.map((c) => `${c.name} (${c.id})`),
  );
}

main().finally(() => prisma.$disconnect());
