'use client';

import React, { useState, useEffect } from 'react';
import { useForm, type SubmitHandler, Controller } from 'react-hook-form';
import {
  Stack, Typography, TextField, Button, FormControl, InputLabel,
  Select, MenuItem, Box, Paper, Grid, Autocomplete, createFilterOptions
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { CheckCircle } from '@phosphor-icons/react';
import { config } from '@/config';

interface IFormInput {
  name: string;
  no: string;
  position: string;
  department: string;
  join_date: string;
  status: string;
  file: FileList;
}

interface DepartmentOption {
  inputValue?: string;
  title: string;
}

interface DepartmentResponse {
  departments: string[];
}

const filter = createFilterOptions<DepartmentOption>();

export const AddEmployeeForm: React.FC = () => {
  const { register, handleSubmit, formState: { errors }, watch, control, reset } = useForm<IFormInput>();
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const router = useRouter();

  const watchFile = watch("file");

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    if (watchFile && watchFile.length > 0) {
      const file = watchFile[0];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewImage(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setPreviewImage(null);
      }
    }
  }, [watchFile]);

  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      const value: any = data[key as keyof IFormInput];

      if (key === 'file') {
        formData.append(key, data[key][0]);
      } else {
        formData.append(key, value);
      }
    });

    try {
      const response = await fetch(`${config.serverURL}/employees`, {
        method: 'POST',
        body: formData,
      });
      if (response.ok) {
        setIsSubmitted(true);
      } else {
        alert('Gagal menambahkan data karyawan');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Terjadi kesalahan saat menambahkan data karyawan');
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const handleReload = () => {
    setIsSubmitted(false);
    reset(); // Reset form fields
    setPreviewImage(null); // Reset image preview
  };

  if (isSubmitted) {
    return (
      <Paper elevation={3} >
        <Stack spacing={2} alignItems="center" style={{ padding: '82px 20px', textAlign: 'center' }}>
          {/* <CheckCircleIcon style={{ fontSize: 60, color: 'green' }} /> */}
          <Typography variant="h5">Form Terkirim</Typography>
          <CheckCircle size={182} color='green' />
        </Stack>

        <Grid container padding={2}>
          <Grid item xs={12}>
            <Box display="flex" justifyContent="space-between">
              <Button
                type="button"
                variant="contained"
                color="primary"
                onClick={handleReload}
                style={{ width: '48%' }}
              >
                Tambah Karyawan
              </Button>

              <Button
                type="button"
                variant="outlined"
                color="error"
                onClick={handleCancel}
                style={{ width: '48%' }}
              >
                Kembali
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    );
  }


  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Paper elevation={3} style={{ padding: '20px' }}>
        <Grid container spacing={4}>
          {/* Right side - Other fields */}
          <Grid item xs={12} md={7}>
            <Stack spacing={2}>
              <TextField
                {...register('name', { required: 'Nama wajib diisi' })}
                label="Nama"
                error={Boolean(errors.name)}
                helperText={errors.name?.message}
              />
              <TextField
                {...register('no', { required: 'Nomor wajib diisi' })}
                label="Nomor"
                error={Boolean(errors.no)}
                helperText={errors.no?.message}
              />
              <TextField
                {...register('position', { required: 'Posisi wajib diisi' })}
                label="Posisi"
                error={Boolean(errors.position)}
                helperText={errors.position?.message}
              />
              <Controller
                name="department"
                control={control}
                rules={{ required: 'Departemen wajib diisi' }}
                render={({ field }) => (
                  <Autocomplete
                    {...field}
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
                      <TextField
                        {...params}
                        label="Departemen"
                        error={Boolean(errors.department)}
                        helperText={errors.department?.message}
                      />
                    )}
                    onChange={(_, newValue) => {
                      if (typeof newValue === 'string') {
                        field.onChange(newValue);
                      } else if (newValue?.inputValue) {
                        // Create a new value from the user input
                        field.onChange(newValue.inputValue);
                      } else {
                        field.onChange(newValue ? newValue.title : '');
                      }
                    }}
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
                  />
                )}
              />
              <TextField
                {...register('join_date', { required: 'Tanggal bergabung wajib diisi' })}
                type="date"
                label="Tanggal Bergabung"
                InputLabelProps={{ shrink: true }}
                error={Boolean(errors.join_date)}
                helperText={errors.join_date?.message}
              />
              <FormControl error={Boolean(errors.status)}>
                <InputLabel>Status</InputLabel>
                <Select
                  {...register('status', { required: 'Status wajib diisi' })}
                  label="Status"
                >
                  <MenuItem value="probation">Probation</MenuItem>
                  <MenuItem value="tetap">Tetap</MenuItem>
                  <MenuItem value="kontrak">Kontrak</MenuItem>
                </Select>
                {errors.status ? <Typography color="error">{errors.status.message}</Typography> : null}
              </FormControl>
            </Stack>
          </Grid>

          {/* Left side - File upload */}
          <Grid item xs={12} md={5}>
            <Stack spacing={2}>
              <TextField
                type="file"
                {...register('file', {
                  required: 'File wajib diupload',
                  validate: (value) => {
                    if (value[0]) {
                      return value[0].type.startsWith('image/') || 'Hanya file gambar yang diperbolehkan';
                    }
                    return true;
                  }
                })}
                error={Boolean(errors.file)}
                helperText={errors.file?.message}
                InputLabelProps={{ shrink: true }}
                inputProps={{ accept: "image/*" }}
              />

              {previewImage ? <Box mt={2}>
                <Typography variant="subtitle1">Preview:</Typography>
                <img src={previewImage} alt="Preview" style={{ maxWidth: '100%', maxHeight: '300px' }} />
              </Box> : null}
            </Stack>
          </Grid>

          {/* Submit button */}
          <Grid item xs={7}>
            <Box display="flex" justifyContent="space-between">
              <Button
                type="submit"
                variant="contained"
                color="primary"
                style={{ width: '48%' }}
              >
                Tambah Karyawan
              </Button>

              <Button
                type="button"
                variant="outlined"
                color="error"
                onClick={handleCancel}
                style={{ width: '48%' }}
              >
                Kembali
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </form>
  );
};