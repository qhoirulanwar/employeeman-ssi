import React, { useState, useEffect } from 'react';
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
  const [formData, setFormData] = useState<Employee | null>(null);
  const [newPhoto, setNewPhoto] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);

  useEffect(() => {
    if (employee) {
      setFormData(employee);
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
  }, [employee]);

  const handleChange: any = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setFormData((prevData: any) => ({
      ...prevData!,
      [name!]: value,
    }));
  };

  const handleDepartmentChange = (event: React.SyntheticEvent, newValue: string | DepartmentOption | null) => {
    if (typeof newValue === 'string') {
      setFormData((prevData: any) => ({
        ...prevData!,
        department: newValue,
      }));
    } else if (newValue?.inputValue) {
      // Create a new value from the user input
      setFormData((prevData: any) => ({
        ...prevData!,
        department: newValue.inputValue,
      }));
    } else {
      setFormData((prevData: any) => ({
        ...prevData!,
        department: newValue ? newValue.title : '',
      }));
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNewPhoto(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData) {
      onSave(formData, newPhoto);
    }
  };

  if (!formData) {
    console.log('Loading employees data...');
    return <Typography />;
  }

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack spacing={3}>
        <Typography variant="h6">Edit Data Karyawan</Typography>

        <TextField
          fullWidth
          label="Nama"
          name="name"
          value={formData.name}
          onChange={handleChange}
        />
        <TextField
          fullWidth
          label="Nomor Karyawan"
          name="no"
          value={formData.no}
          onChange={handleChange}
        />
        <TextField
          fullWidth
          label="Jabatan"
          name="position"
          value={formData.position}
          onChange={handleChange}
        />
        <Autocomplete
          value={formData.department}
          onChange={handleDepartmentChange}
          filterOptions={(options, params) => {
            const filtered = filter(options, params);

            const { inputValue } = params;
            // Suggest the creation of a new value
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
        <TextField
          fullWidth
          label="Tanggal Bergabung"
          name="join_date"
          type="date"
          value={dayjs(formData.join_date).format('YYYY-MM-DD')}
          onChange={handleChange}
          InputLabelProps={{
            shrink: true,
          }}
        />
        <FormControl fullWidth>
          <InputLabel>Status</InputLabel>
          <Select
            name="status"
            value={formData.status}
            onChange={handleChange}
          >
            <MenuItem value="probation">Probation</MenuItem>
            <MenuItem value="kontrak">Kontrak</MenuItem>
            <MenuItem value="tetap">Tetap</MenuItem>
          </Select>
        </FormControl>

        {/* Photo upload section */}
        <Box>
          <Typography variant="subtitle1">Foto Karyawan</Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar
              src={previewUrl || undefined}
              alt={formData.name}
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