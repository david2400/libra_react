'use client';

import {SessionProvider} from 'next-auth/react';

export const SessionsProvider = ({children}: {children: React.ReactNode}) => {
  return <SessionProvider>{children}</SessionProvider>;
};
