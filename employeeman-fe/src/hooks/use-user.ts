'use client';

import * as React from 'react';

export function useUser() {
  const context = '';

  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }

  return context;
}
