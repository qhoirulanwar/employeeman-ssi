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
} from '@mui/material';
import { Download as DownloadIcon } from '@phosphor-icons/react/dist/ssr/Download';
import { Plus as PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';
import { Upload as UploadIcon } from '@phosphor-icons/react/dist/ssr/Upload';
import { SortAscending, Funnel } from '@phosphor-icons/react';
import Link from 'next/link';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ImportCSVModal from './import-csv-modal';
import EmployeeEditForm from './employee-edit-form';
import { useEmployees } from './use-employees';
import { EmployeeTable } from './employee-table';
import { FilterPopover, EmployeeFilters, SortPopover } from './employee-filters';
import { convertToCSV, dataForUpdate } from './employee-utils';
import { Employee } from './employee-types';
import { config } from '@/config';

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

  const queryClient = useQueryClient();

  const { data, isLoading, error } = useEmployees(department, status, sortBy, sortOrder, page, rowsPerPage);

  const updateEmployeeMutation = useMutation(
    async (updatedData: { employee: Employee; newPhoto: File | null }) => {
      const formData = new FormData();
      Object.entries(dataForUpdate(updatedData.employee)).forEach(([key, value]) => {
        formData.append(key, value as string);
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

  // React.useEffect(() => {
  //   setAnchorEl(null);
  // }, [department, status, sortBy, sortOrder, page, rowsPerPage]);

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
    return <Typography>Error: {(error as Error).message}</Typography>;
  }

  console.log('Rendering EmployeePage with data:', data);

  const handleImportModalOpen = () => setImportModalOpen(true);
  const handleImportModalClose = () => setImportModalOpen(false);

  const exportToPDF = () => {
    if (!data || !data.data) {
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
    if (!data || !data.data) {
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
      <Stack direction="row" spacing={3}>
        <Stack spacing={3} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4">Data Karyawan</Typography>
        </Stack>
        <div>
          <Button color="inherit" startIcon={<SortAscending fontSize="var(--icon-fontSize-md)" />}
            onClick={handleSortClick}
          >
            Sort
          </Button>
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

          <Button
            color="inherit"
            startIcon={<Funnel fontSize="var(--icon-fontSize-md)" />}
            onClick={handleFilterClick}
          >
            Filter
          </Button>
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
        </div>
      </Stack>

      <Stack justifyContent="space-between" direction="row" spacing={1} sx={{ paddingBottom: '12px' }}>
        <Stack direction={'row'} spacing={2}>
          <Link href="/dashboard/employee/add">
            <Button startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />} variant="contained">
              Tambah Karyawan
            </Button>
          </Link>
          <Button startIcon={<UploadIcon fontSize="var(--icon-fontSize-md)" />}
            onClick={handleImportModalOpen}
          >
            Import CSV
          </Button>
        </Stack>

        <Stack direction={'row'} spacing={2}>
          <Button
            color="inherit"
            startIcon={<DownloadIcon fontSize="var(--icon-fontSize-md)" />}
            onClick={exportToCSV}
          >
            Export ke CSV
          </Button>
          <Button color="inherit" startIcon={<DownloadIcon fontSize="var(--icon-fontSize-md)" />}
            onClick={exportToPDF}
          >
            Export ke PDF
          </Button>
        </Stack>
      </Stack>

      {data && (
        <EmployeeTable
          employees={data.data}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {data && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
          <FormControl>
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
          <Typography>
            Halaman {page} dari {data.meta.totalPages} (Total {data.meta.total} data)
          </Typography>
          <Pagination
            count={data.meta.totalPages}
            page={page}
            onChange={(event, value) => setPage(value)}
            color="primary"
          />
        </Box>
      )}

      <ImportCSVModal open={importModalOpen} onClose={handleImportModalClose} />

      <Modal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        aria-labelledby="edit-employee-modal"
        aria-describedby="modal-to-edit-employee-data"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
        }}>
          <EmployeeEditForm
            employee={selectedEmployee}
            onSave={handleSaveEdit}
            onCancel={() => setEditModalOpen(false)}
          />
        </Box>
      </Modal>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Konfirmasi Penghapusan"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Apakah Anda yakin ingin menghapus karyawan {selectedEmployee?.name}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Batal</Button>
          <Button onClick={handleConfirmDelete} autoFocus>
            Hapus
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}