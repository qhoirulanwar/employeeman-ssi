import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import type { SxProps } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { ArrowDown as ArrowDownIcon } from '@phosphor-icons/react/dist/ssr/ArrowDown';
import { ArrowUp as ArrowUpIcon } from '@phosphor-icons/react/dist/ssr/ArrowUp';
import { CurrencyDollar as CurrencyDollarIcon } from '@phosphor-icons/react/dist/ssr/CurrencyDollar';
import { ResponsiveStyleValue } from '@mui/system';

export interface BudgetProps {
  // diff?: number;
  // trend: 'up' | 'down';
  title: string;
  color?: ResponsiveStyleValue<string>;
  sx?: SxProps;
  value: string;
}

export function EmployeeInfoCard({ title, color = 'text.primary', sx, value }: BudgetProps): React.JSX.Element {

  return (
    <Card sx={sx}>
      <CardContent>
        <Stack spacing={3}>
          <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }} spacing={3}>
            <Stack spacing={1}>
              <Typography color={color} variant="h6">
                {title}
              </Typography>
              <Typography color={color} variant="h4">{value}</Typography>
            </Stack>
            {/* <Avatar sx={{ backgroundColor: 'var(--mui-palette-primary-main)', height: '56px', width: '56px' }}>
              <CurrencyDollarIcon fontSize="var(--icon-fontSize-lg)" />
            </Avatar> */}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
