'use client';

import * as React from 'react';
import { useMutation, useQueryClient } from 'react-query';
import {
  Button,
  Stack,
  Typography,
  Popover,
  Box,
  FormControl,
  Select,
  MenuItem,
  Pagination,
  Modal,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Grid,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Download as DownloadIcon } from '@phosphor-icons/react/dist/ssr/Download';
import { Plus as PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';
import { Upload as UploadIcon } from '@phosphor-icons/react/dist/ssr/Upload';
import { SortAscending, Funnel, FileArrowDown } from '@phosphor-icons/react';
import Link from 'next/link';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { config } from '@/config';
import ImportCSVModal from './import-csv-modal';
import EmployeeEditForm from './employee-edit-form';
import { useEmployees } from './use-employees';
import { EmployeeTable } from './employee-table';
import { FilterPopover, EmployeeFilters, SortPopover } from './employee-filters';
import { convertToCSV, dataForUpdate } from './employee-utils';
import { type Employee } from './employee-types';

export default function EmployeePage(): React.JSX.Element {
  console.log('Rendering EmployeePage');
  const [department, setDepartment] = React.useState('');
  const [status, setStatus] = React.useState('');
  const [sortBy, setSortBy] = React.useState('name');
  const [sortOrder, setSortOrder] = React.useState('ASC');
  const [page, setPage] = React.useState(1);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);
  const [sortAnchorEl, setSortAnchorEl] = React.useState<HTMLButtonElement | null>(null);
  const [importModalOpen, setImportModalOpen] = React.useState(false);
  const [editModalOpen, setEditModalOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [selectedEmployee, setSelectedEmployee] = React.useState<Employee | null>(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const queryClient = useQueryClient();

  const { data, isLoading, error } = useEmployees(department, status, sortBy, sortOrder, page, rowsPerPage);

  const updateEmployeeMutation = useMutation(
    async (updatedData: { employee: Employee; newPhoto: File | null }) => {
      const formData = new FormData();
      Object.entries(dataForUpdate(updatedData.employee)).forEach(([key, value]) => {
        formData.append(key, value);
      });

      if (updatedData.newPhoto) {
        formData.append('file', updatedData.newPhoto);
      }

      const response = await fetch(`${config.serverURL}/employees/${updatedData.employee.id}`, {
        method: 'PATCH',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to update employee');
      }

      return response.json();
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('employees');
        setEditModalOpen(false);
      },
    }
  );

  const handleSaveEdit = (updatedEmployee: Employee, newPhoto: File | null) => {
    updateEmployeeMutation.mutate({ employee: updatedEmployee, newPhoto });
  };

  const deleteEmployeeMutation = useMutation(
    (id: number) =>
      fetch(`${config.serverURL}/employees/${id}`, {
        method: 'DELETE',
      }).then((res) => res.json()),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('employees');
        setDeleteDialogOpen(false);
      },
    }
  );

  React.useEffect(() => {
    console.log('EmployeePage mounted');
    return () => {
      console.log('EmployeePage unmounted');
    };
  }, []);

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(column);
      setSortOrder('ASC');
    }
  };

  const handleFilterClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setAnchorEl(null);
  };

  const handleSortClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setSortAnchorEl(event.currentTarget);
  };

  const handleSortClose = () => {
    setSortAnchorEl(null);
  };

  const handleEdit = (id: number) => {
    const employeeToEdit = data?.data.find((emp) => emp.id === id);
    if (employeeToEdit) {
      setSelectedEmployee(employeeToEdit);
      setEditModalOpen(true);
    }
  };

  const handleDelete = (id: number) => {
    console.log(`Delete employee with id: ${id}`);
    const employeeToDelete = data?.data.find((emp) => emp.id === id);
    if (employeeToDelete) {
      setSelectedEmployee(employeeToDelete);
      setDeleteDialogOpen(true);
    }
  };

  const handleConfirmDelete = () => {
    if (selectedEmployee) {
      deleteEmployeeMutation.mutate(selectedEmployee.id);
    }
  };

  if (isLoading) {
    console.log('Loading employees data...');
  }
  if (error) {
    console.error('Error loading employees:', error);
    return <Typography>Error: {(error).message}</Typography>;
  }

  console.log('Rendering EmployeePage with data:', data);

  const handleImportModalOpen = () => { setImportModalOpen(true); };
  const handleImportModalClose = () => { setImportModalOpen(false); };

  const exportToPDF = () => {
    if (!data?.data) {
      console.error('No data available for PDF export');
      return;
    }

    const doc = new jsPDF();

    doc.text('Data Karyawan', 14, 15);

    const tableData = data.data.map(employee => [
      employee.name,
      employee.no,
      employee.position,
      employee.department,
      employee.join_date,
      employee.status
    ]);

    autoTable(doc, {
      head: [['Nama', 'No', 'Posisi', 'Departemen', 'Tanggal Bergabung', 'Status']],
      body: tableData,
      startY: 20
    });

    doc.save('data_karyawan.pdf');
  };

  const handleChangeRowsPerPage: any = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1);
  };

  const exportToCSV = () => {
    if (!data?.data) {
      console.error('No data available for CSV export');
      return;
    }

    const csvContent = convertToCSV(data.data);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'data_karyawan.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <Stack spacing={3}>
      <Grid container spacing={2} alignItems="center" justifyContent="space-between">
        <Grid item xs={12} sm={6}>
          <Typography variant={isMobile ? "h5" : "h4"}>Data Karyawan</Typography>
        </Grid>
        <Grid item xs={12} sm={6} container justifyContent="flex-end" spacing={1}>
          <Grid item>
            <Button
              color="inherit"
              startIcon={<SortAscending fontSize="var(--icon-fontSize-md)" />}
              onClick={handleSortClick}
              size={isMobile ? "small" : "medium"}
            >
              Sort
            </Button>
          </Grid>
          <Grid item>
            <Button
              color="inherit"
              startIcon={<Funnel fontSize="var(--icon-fontSize-md)" />}
              onClick={handleFilterClick}
              size={isMobile ? "small" : "medium"}
            >
              Filter
            </Button>
          </Grid>
        </Grid>
      </Grid>

      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={6} container spacing={1}>
          <Grid item>
            <Link href="/dashboard/employee/add">
              <Button
                startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />}
                variant="contained"
                size={isMobile ? "small" : "medium"}
              >
                Tambah Karyawan
              </Button>
            </Link>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              startIcon={<UploadIcon fontSize="var(--icon-fontSize-md)" />}
              onClick={handleImportModalOpen}
              size={isMobile ? "small" : "medium"}
            >
              Import CSV
            </Button>
          </Grid>
        </Grid>
        <Grid item xs={12} sm={6} container justifyContent="flex-end" spacing={1}>
          <Grid item>
            <Button
              color="success"
              variant="outlined"
              startIcon={<FileArrowDown fontSize="var(--icon-fontSize-md)" />}
              onClick={exportToCSV}
              size={isMobile ? "small" : "medium"}
            >
              Export ke CSV
            </Button>
          </Grid>
          <Grid item>
            <Button
              color="error"
              variant="outlined"
              startIcon={<FileArrowDown fontSize="var(--icon-fontSize-md)" />}
              onClick={exportToPDF}
              size={isMobile ? "small" : "medium"}
            >
              Export ke PDF
            </Button>
          </Grid>
        </Grid>
      </Grid>

      {data ? <EmployeeTable
        employees={data.data}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        onEdit={handleEdit}
        onDelete={handleDelete}
      /> : null}

      {data ? (
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={2} alignItems="center" justifyContent="space-between">
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth size={isMobile ? "small" : "small"}>
                <Select
                  value={rowsPerPage}
                  onChange={handleChangeRowsPerPage}
                  displayEmpty
                  inputProps={{ 'aria-label': 'Rows per page' }}
                >
                  <MenuItem value={5}>5 baris per halaman</MenuItem>
                  <MenuItem value={10}>10 baris per halaman</MenuItem>
                  <MenuItem value={25}>25 baris per halaman</MenuItem>
                  <MenuItem value={50}>50 baris per halaman</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography align="center">
                Halaman {page} dari {data.meta.totalPages} (Total {data.meta.total} data)
              </Typography>
            </Grid>
            <Grid item xs={12} sm={5} justifyContent="center">
              <Pagination
                count={data.meta.totalPages}
                page={page}
                onChange={(event, value) => { setPage(value); }}
                color="primary"
                size="medium"
              />
            </Grid>
          </Grid>
        </Box>
      ) : null}

      <ImportCSVModal open={importModalOpen} onClose={handleImportModalClose} />

      <Modal
        open={editModalOpen}
        onClose={() => { setEditModalOpen(false); }}
        aria-labelledby="edit-employee-modal"
        aria-describedby="modal-to-edit-employee-data"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: isMobile ? '90%' : 400,
          maxWidth: '100%',
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
        }}>
          <EmployeeEditForm
            employee={selectedEmployee}
            onSave={handleSaveEdit}
            onCancel={() => { setEditModalOpen(false); }}
          />
        </Box>
      </Modal>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => { setDeleteDialogOpen(false); }}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Konfirmasi Penghapusan
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Apakah Anda yakin ingin menghapus karyawan {selectedEmployee?.name}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setDeleteDialogOpen(false); }}>Batal</Button>
          <Button onClick={handleConfirmDelete} autoFocus>
            Hapus
          </Button>
        </DialogActions>
      </Dialog>

      <Popover
        open={Boolean(sortAnchorEl)}
        anchorEl={sortAnchorEl}
        onClose={handleSortClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <SortPopover
          sortBy={sortBy}
          setSortBy={setSortBy}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
        />
      </Popover>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleFilterClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <FilterPopover
          department={department}
          setDepartment={setDepartment}
          status={status}
          setStatus={setStatus}
        />
      </Popover>
    </Stack>
  );
}