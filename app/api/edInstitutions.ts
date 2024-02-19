// app/api/edInstitutions.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { EdInstitution } from '@prisma/client';

type ResponseData = EdInstitution[] | { error: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  if (req.method === 'GET') {
    try {
      const edInstitutions: EdInstitution[] = await prisma.edInstitution.findMany();
      res.status(200).json(edInstitutions);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch educational institutions.' });
    }
  } else {
    // Optionally handle other methods such as POST, PUT, DELETE
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
