'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import type { Metadata } from 'next';
import Grid from '@mui/material/Unstable_Grid2';
import { DepartmentDistribution } from '@/components/dashboard/overview/department-distribution';
import { EmployeeInfoCard } from '@/components/dashboard/overview/employee-info-card';
import { config } from '@/config';

// export const metadata = { title: `Overview | Dashboard | ${config.site.name}` } satisfies Metadata;

export default function Page(): React.JSX.Element {
  const [totalEmployees, setTotalEmployees] = useState<number | null>(null);
  const [totalKontrak, setTotalKontrak] = useState<number | null>(null);
  const [totalProbation, setTotalProbation] = useState<number | null>(null);

  useEffect(() => {
    const fetchTotalEmployees = async () => {
      try {
        const response = await fetch(`${config.serverURL}/employees?limit=1`);
        const data = await response.json();
        setTotalEmployees(data.meta.total);
      } catch (error) {
        console.error('Error fetching total employees:', error);
      }
    };

    const fetchTotalKontrak = async () => {
      try {
        const response = await fetch(`${config.serverURL}/employees?status=kontrak&page=1&limit=1`);
        const data = await response.json();
        setTotalKontrak(data.meta.total);
      } catch (error) {
        console.error('Error fetching total employees:', error);
      }
    };

    const fetchTotalProbation = async () => {
      try {
        const response = await fetch(`${config.serverURL}/employees?status=probation&page=1&limit=1`);
        const data = await response.json();
        setTotalProbation(data.meta.total);
      } catch (error) {
        console.error('Error fetching total employees:', error);
      }
    };

    fetchTotalEmployees();
    fetchTotalKontrak();
    fetchTotalProbation();
  }, []);

  return (
    <Grid container spacing={3}>
      <Grid lg={4} sm={6} xs={12}>
        <EmployeeInfoCard
          title="Total Karyawan"
          sx={{ height: '140px' }}
          value={totalEmployees !== null ? totalEmployees.toString() : '~'}
        />
      </Grid>
      <Grid lg={4} sm={6} xs={12}>
        <EmployeeInfoCard title="Kontrak" sx={{ height: '140px' }} color="primary.main"
          value={totalKontrak !== null ? totalKontrak.toString() : '~'}
        />
      </Grid>
      <Grid lg={4} sm={6} xs={12}>
        <EmployeeInfoCard title="Probation" sx={{ height: '140px' }} color="warning.main"
          value={totalProbation !== null ? totalProbation.toString() : '~'}
        />
      </Grid>

      <Grid lg={12} md={12} xs={12}>
        <DepartmentDistribution sx={{ height: '100%' }} />
      </Grid>
    </Grid>
  );
}
