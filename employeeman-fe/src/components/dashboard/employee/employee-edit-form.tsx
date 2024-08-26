import React, { useEffect, useState } from 'react';
import {
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  Typography,
  Box,
  Avatar,
  Autocomplete,
  createFilterOptions,
} from '@mui/material';
import dayjs from 'dayjs';
import { config } from '@/config';
import { type Employee } from './employee-types';
import { useForm, Controller } from 'react-hook-form';

interface EmployeeEditFormProps {
  employee: Employee | null;
  onSave: (updatedEmployee: Employee, newPhoto: File | null) => void;
  onCancel: () => void;
}

interface DepartmentOption {
  inputValue?: string;
  title: string;
}

interface DepartmentResponse {
  departments: string[];
}

const filter = createFilterOptions<DepartmentOption>();

const EmployeeEditForm: React.FC<EmployeeEditFormProps> = ({
  employee,
  onSave,
  onCancel,
}) => {
  const { control, handleSubmit, setValue } = useForm<Employee>({
    defaultValues: employee || {},
  });
  const [newPhoto, setNewPhoto] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);

  useEffect(() => {
    if (employee) {
      Object.entries(employee).forEach(([key, value]) => {
        setValue(key as keyof Employee, value);
      });
      setPreviewUrl(getPhotoUrl(employee.photo));
    }

    // Fetch departments
    const fetchDepartments = async () => {
      try {
        const response = await fetch(`${config.serverURL}/employees/departments/search`);
        if (!response.ok) {
          throw new Error('Failed to fetch departments');
        }
        const data: DepartmentResponse = await response.json();
        setDepartments(data.departments.map(dept => ({ title: dept })));
      } catch (error) {
        console.error('Error fetching departments:', error);
      }
    };

    fetchDepartments();
  }, [employee, setValue]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewPhoto(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const onSubmit = (data: Employee) => {
    onSave(data, newPhoto);
  };

  if (!employee) {
    console.log('Loading employees data...');
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={3}>
        <Typography variant="h6">Edit Data Karyawan</Typography>

        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label="Nama"
            />
          )}
        />
        <Controller
          name="no"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label="Nomor Karyawan"
            />
          )}
        />
        <Controller
          name="position"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label="Jabatan"
            />
          )}
        />
        <Controller
          name="department"
          control={control}
          render={({ field }) => (
            <Autocomplete
              {...field}
              onChange={(event, newValue) => {
                if (typeof newValue === 'string') {
                  field.onChange(newValue);
                } else if (newValue && newValue.inputValue) {
                  field.onChange(newValue.inputValue);
                } else {
                  field.onChange(newValue ? newValue.title : '');
                }
              }}
              filterOptions={(options, params) => {
                const filtered = filter(options, params);
                const { inputValue } = params;
                const isExisting = options.some((option) => inputValue === option.title);
                if (inputValue !== '' && !isExisting) {
                  filtered.push({
                    inputValue,
                    title: `Tambah "${inputValue}"`,
                  });
                }
                return filtered;
              }}
              selectOnFocus
              clearOnBlur
              handleHomeEndKeys
              options={departments}
              getOptionLabel={(option) => {
                if (typeof option === 'string') {
                  return option;
                }
                if (option.inputValue) {
                  return option.inputValue;
                }
                return option.title;
              }}
              renderOption={(props, option) => <li {...props}>{option.title}</li>}
              freeSolo
              renderInput={(params) => (
                <TextField {...params} label="Departemen" fullWidth />
              )}
            />
          )}
        />
        <Controller
          name="join_date"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label="Tanggal Bergabung"
              type="date"
              value={dayjs(field.value).format('YYYY-MM-DD')}
              InputLabelProps={{
                shrink: true,
              }}
            />
          )}
        />
        <FormControl fullWidth>
          <InputLabel>Status</InputLabel>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Select {...field}>
                <MenuItem value="probation">Probation</MenuItem>
                <MenuItem value="kontrak">Kontrak</MenuItem>
                <MenuItem value="tetap">Tetap</MenuItem>
              </Select>
            )}
          />
        </FormControl>

        {/* Photo upload section */}
        <Box>
          <Typography variant="subtitle1">Foto Karyawan</Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar
              src={previewUrl || undefined}
              alt={employee.name}
              sx={{ width: 100, height: 100 }}
            />
            <Button
              variant="outlined"
              component="label"
            >
              Pilih Foto Baru
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handlePhotoChange}
              />
            </Button>
          </Stack>
        </Box>

        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button onClick={onCancel} variant="outlined">
            Batal
          </Button>
          <Button type="submit" variant="contained">
            Simpan
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

export default EmployeeEditForm;

// Helper function to get the photo URL
const getPhotoUrl = (photoPath: string) => {
  if (!photoPath) return '';
  return photoPath.startsWith('http')
    ? photoPath
    : `${config.serverURL}/media/file/${photoPath}`;
};