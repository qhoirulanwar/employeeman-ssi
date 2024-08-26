import * as React from 'react';
import type { Metadata } from 'next';

import { config } from '@/config';
import EmployeePage from '@/components/dashboard/employee/employee-page';

export const metadata = { title: `Karyawan | Dashboard | ${config.site.name}` } satisfies Metadata;

export default function Page(): React.JSX.Element {
  return <div style={{ marginTop: '-28px' }}>
    <EmployeePage />
  </div>;
}
