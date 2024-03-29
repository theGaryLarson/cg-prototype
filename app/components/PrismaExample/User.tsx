'use client';
import React from 'react';
import type { User as UserType } from '@prisma/client';

export default function User({ user }: { user: UserType }): React.ReactElement {
  const userName = user.userName !== '' ? user.userName : 'unknown username';
  return (
    <div>
      <h1>{userName}</h1>
      <p>{user.email}</p>
    </div>
  );
}
