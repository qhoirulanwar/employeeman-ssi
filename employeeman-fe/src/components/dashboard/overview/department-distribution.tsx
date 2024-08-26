'use client';

import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import type { SxProps } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { ApexOptions } from 'apexcharts';
import { Chart } from '@/components/core/chart';
import { config } from '@/config';

export interface DepartmentDistributionProps {
  sx?: SxProps;
}

export function DepartmentDistribution({ sx }: DepartmentDistributionProps): React.JSX.Element {
  const [chartSeries, setChartSeries] = React.useState<number[]>([]);
  const [labels, setLabels] = React.useState<string[]>([]);
  const [departemenValue, setDepartemenValue] = React.useState<number[]>([]);

  React.useEffect(() => {
    async function fetchData() {
      try {
        // Mengambil daftar departemen
        const departmentsResponse = await fetch(`${config.serverURL}/employees/departments/search`);
        const departmentsData = await departmentsResponse.json();
        const departments = departmentsData.departments;

        // Mengambil jumlah karyawan untuk setiap departemen
        const departmentCounts = await Promise.all(
          departments.map(async (department: string) => {
            const response = await fetch(`${config.serverURL}/employees?department=${department}`);
            const data = await response.json();
            return { department, count: data.meta.total };
          })
        );

        // Menghitung total karyawan
        const totalEmployees = departmentCounts.reduce((sum, dept) => sum + dept.count, 0);

        // Menghitung persentase untuk setiap departemen
        const percentages = departmentCounts.map(dept => ({
          department: dept.department,
          count: dept.count,
          percentage: (dept.count / totalEmployees) * 100
        }));

        // Memperbarui state
        setLabels(percentages.map(p => p.department));
        setDepartemenValue(percentages.map(p => parseFloat(p.count.toFixed(2))));
        setChartSeries(percentages.map(p => parseFloat(p.percentage.toFixed(2))));
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }

    fetchData();
  }, []);

  const chartOptions = useChartOptions(labels);

  return (
    <Card sx={sx}>
      <CardHeader title="Distribusi Departemen Karyawan" />
      <CardContent>
        <Stack spacing={2}>
          <Chart height={300} options={chartOptions} series={departemenValue} type="pie" width="100%" />
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
            {chartSeries.map((item, index) => {
              const label = labels[index];

              return (
                <Stack key={label} spacing={1} sx={{ alignItems: 'center', margin: 1 }}>
                  <Typography variant="h6">{label}</Typography>
                  <Typography color="text.secondary" variant="subtitle2">
                    {item}%
                  </Typography>
                </Stack>
              );
            })}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

function useChartOptions(labels: string[]): ApexOptions {
  const theme = useTheme();

  return {
    chart: { background: 'transparent' },
    colors: [
      theme.palette.primary.main,
      theme.palette.secondary.main,
      theme.palette.success.main,
      theme.palette.warning.main,
      theme.palette.error.main,
      theme.palette.info.main,
    ],
    dataLabels: { enabled: false },
    labels,
    legend: { show: false },
    plotOptions: { pie: { expandOnClick: false } },
    states: { active: { filter: { type: 'none' } }, hover: { filter: { type: 'none' } } },
    stroke: { width: 0 },
    theme: { mode: theme.palette.mode },
    tooltip: { fillSeriesColor: false },
  };
}
