import * as React from 'react';
import {
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  TextField,
} from '@mui/material';
import { config } from '@/config';
import { type DepartmentOption } from './employee-types';

interface FilterPopoverProps {
  department: string;
  setDepartment: (value: string) => void;
  status: string;
  setStatus: (value: string) => void;
}

export const FilterPopover: React.FC<FilterPopoverProps> = ({
  department,
  setDepartment,
  status,
  setStatus,
}) => {
  const [departments, setDepartments] = React.useState<DepartmentOption[]>([]);

  React.useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await fetch(`${config.serverURL}/employees/departments/search`);
        if (!response.ok) {
          throw new Error('Failed to fetch departments');
        }
        const data = await response.json();
        setDepartments(data.departments.map((dept: string) => ({ title: dept })));
      } catch (error) {
        console.error('Error fetching departments:', error);
      }
    };

    fetchDepartments();
  }, []);

  return (
    <Stack spacing={2} sx={{ p: 2, minWidth: 200 }}>
      <Autocomplete
        value={department}
        onChange={(event: any, newValue: string | null) => {
          setDepartment(newValue || '');
        }}
        options={departments.map((option) => option.title)}
        renderInput={(params) => <TextField {...params} label="Departemen" />}
        freeSolo
      />
      <FormControl fullWidth>
        <InputLabel>Status</InputLabel>
        <Select value={status} onChange={(e) => { setStatus(e.target.value); }}>
          <MenuItem value="">Semua</MenuItem>
          <MenuItem value="probation">Probation</MenuItem>
          <MenuItem value="kontrak">Kontrak</MenuItem>
          <MenuItem value="tetap">Tetap</MenuItem>
        </Select>
      </FormControl>
    </Stack>
  );
};

interface EmployeeFiltersProps {
  sortBy: string;
  setSortBy: (value: string) => void;
  sortOrder: string;
  setSortOrder: (value: string) => void;
}

export const EmployeeFilters: React.FC<EmployeeFiltersProps> = ({
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
}) => (
  <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
    <FormControl fullWidth>
      <InputLabel>Urutkan Berdasarkan</InputLabel>
      <Select value={sortBy} onChange={(e) => { setSortBy(e.target.value); }}>
        <MenuItem value="name">Nama</MenuItem>
        <MenuItem value="join_date">Tanggal Bergabung</MenuItem>
        <MenuItem value="department">Departemen</MenuItem>
        <MenuItem value="status">Status</MenuItem>
      </Select>
    </FormControl>
    <FormControl fullWidth>
      <InputLabel>Urutan</InputLabel>
      <Select value={sortOrder} onChange={(e) => { setSortOrder(e.target.value); }}>
        <MenuItem value="ASC">Menaik</MenuItem>
        <MenuItem value="DESC">Menurun</MenuItem>
      </Select>
    </FormControl>
  </Stack>
);

export const SortPopover: React.FC<{
  sortBy: string;
  setSortBy: (value: string) => void;
  sortOrder: string;
  setSortOrder: (value: string) => void;
}> = ({ sortBy, setSortBy, sortOrder, setSortOrder }) => (
  <Stack spacing={2} sx={{ p: 2, minWidth: 200 }}>
    <FormControl fullWidth>
      <InputLabel>Urutkan Berdasarkan</InputLabel>
      <Select value={sortBy} onChange={(e) => { setSortBy(e.target.value); }}>
        <MenuItem value="name">Nama</MenuItem>
        <MenuItem value="join_date">Tanggal Bergabung</MenuItem>
        <MenuItem value="department">Departemen</MenuItem>
        <MenuItem value="status">Status</MenuItem>
      </Select>
    </FormControl>
    <FormControl fullWidth>
      <InputLabel>Urutan</InputLabel>
      <Select value={sortOrder} onChange={(e) => { setSortOrder(e.target.value); }}>
        <MenuItem value="ASC">Menaik</MenuItem>
        <MenuItem value="DESC">Menurun</MenuItem>
      </Select>
    </FormControl>
  </Stack>
);