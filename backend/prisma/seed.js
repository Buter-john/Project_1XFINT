const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const manager = await prisma.users.findUnique({
    where: { email: "manager@supherman.com" },
  });

  if (!manager) {
    const hashedPassword = await bcrypt.hash("Suph3rm4n!", 10);
    await prisma.users.create({
      data: {
        email: "manager@supherman.com",
        password: hashedPassword,
        role: "MANAGER",
        firstConnection: false,
      },
    });
    console.log("Manager créé !");
  } else {
    console.log("Manager existe déjà.");
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
