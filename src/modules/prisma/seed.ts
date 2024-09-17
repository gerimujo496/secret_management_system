import { PrismaClient } from '@prisma/client';

export const seed = async () => {
  try {
    const prisma = new PrismaClient();

    await prisma.$queryRaw`DELETE FROM "Roles"`;
    await prisma.role.create({ data: { roleName: 'ADMIN' } });
    await prisma.role.create({ data: { roleName: 'EDITOR' } });
    await prisma.role.create({ data: { roleName: 'VIEWER' } });
  } catch (error) {
    console.error(error);
  }
};
