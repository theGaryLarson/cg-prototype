import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
export const prisma = globalForPrisma.prisma ? globalForPrisma.prisma : new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
