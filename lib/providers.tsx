'use client';

/* Core */
import { Provider } from 'react-redux';
import * as React from 'react';

/* Instruments */
import { reduxStore } from '@/lib/redux';

export const Providers = (props: React.PropsWithChildren): React.ReactElement => {
  return <Provider store={reduxStore}>{props.children}</Provider>;
};
