'use client';

import * as React from 'react';
import type { Viewport } from 'next';
import { QueryClient, QueryClientProvider } from 'react-query';

import '@/styles/global.css';

import { LocalizationProvider } from '@/components/core/localization-provider';
import { ThemeProvider } from '@/components/core/theme-provider/theme-provider';

export const viewport = { width: 'device-width', initialScale: 1 } satisfies Viewport;

interface LayoutProps {
  children: React.ReactNode;
}

// Create a client
const queryClient = new QueryClient();

export default function Layout({ children }: LayoutProps): React.JSX.Element {
  return (
    <html lang="en">
      <body>
        <QueryClientProvider client={queryClient}>
          <LocalizationProvider>
            <ThemeProvider>{children}</ThemeProvider>
          </LocalizationProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
