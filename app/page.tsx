/* Components */
import { Counter } from './components/Counter/Counter';

import prisma from '../lib/prisma';
import User from './components/PrismaExample/User';

import React from 'react';

export default async function IndexPage(): Promise<React.ReactElement<any, string>> {
  const feed = await prisma.user.findMany();
  return (
    <div>
      <Counter />
      <>
        {feed.map((user) => (
          <div key={user.userId}>
            <User user={user} />
          </div>
        ))}
      </>
    </div>
  );
}

export const metadata = {
  title: 'Redux Toolkit',
};
