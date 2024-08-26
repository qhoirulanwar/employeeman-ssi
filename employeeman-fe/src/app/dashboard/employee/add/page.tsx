import * as React from 'react';
import { Stack, Typography } from '@mui/material';
import dynamic from 'next/dynamic';

const AddEmployeeForm = dynamic(() => import('@/components/dashboard/employee/add-employee-form').then(mod => mod.AddEmployeeForm), { ssr: false });

export default function Page(): React.JSX.Element {
  return (
    <div style={{ marginTop: '-28px' }}>
      <Stack spacing={3}>
        <div>
          <Typography variant="h4">Form Input Karyawan</Typography>
        </div>
        <AddEmployeeForm />
      </Stack>
    </div>
  );
}
