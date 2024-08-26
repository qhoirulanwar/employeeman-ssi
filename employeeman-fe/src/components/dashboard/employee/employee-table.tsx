import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import { CaretUp as CaretUpIcon } from '@phosphor-icons/react/dist/ssr/CaretUp';
import { CaretDown as CaretDownIcon } from '@phosphor-icons/react/dist/ssr/CaretDown';
import { DotsThreeOutlineVertical, Pencil, Trash } from '@phosphor-icons/react';
import { type Employee } from './employee-types';
import { getStatusChipColor, getPhotoUrl, formatDate } from './employee-utils';

interface EmployeeTableProps {
  employees: Employee[];
  sortBy: string;
  sortOrder: string;
  onSort: (column: string) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

export const EmployeeTable: React.FC<EmployeeTableProps> = ({
  employees,
  sortBy,
  sortOrder,
  onSort,
  onEdit,
  onDelete,
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedEmployee, setSelectedEmployee] = React.useState<number | null>(null);

  const renderSortIcon = (column: string) => {
    if (sortBy === column) {
      return sortOrder === 'ASC' ? <CaretUpIcon /> : <CaretDownIcon />;
    }
    return null;
  };

  const handleSort = (column: string) => {
    onSort(column);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, employeeId: number) => {
    setAnchorEl(event.currentTarget);
    setSelectedEmployee(employeeId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedEmployee(null);
  };

  const handleEdit = () => {
    if (selectedEmployee !== null) {
      onEdit(selectedEmployee);
      handleMenuClose();
    }
  };

  const handleDelete = () => {
    if (selectedEmployee !== null) {
      onDelete(selectedEmployee);
      handleMenuClose();
    }
  };

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell onClick={() => { handleSort('name'); }} style={{ cursor: 'pointer' }}>
              Nama {renderSortIcon('name')}
            </TableCell>
            <TableCell>Nomor Karyawan</TableCell>
            <TableCell>Jabatan</TableCell>
            <TableCell onClick={() => { handleSort('department'); }} style={{ cursor: 'pointer' }}>
              Departemen {renderSortIcon('department')}
            </TableCell>
            <TableCell onClick={() => { handleSort('join_date'); }} style={{ cursor: 'pointer' }}>
              Tanggal Bergabung {renderSortIcon('join_date')}
            </TableCell>
            <TableCell>Foto</TableCell>
            <TableCell onClick={() => { handleSort('status'); }} style={{ cursor: 'pointer' }}>
              Status {renderSortIcon('status')}
            </TableCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {employees.map((employee) => (
            <TableRow key={employee.id}>
              <TableCell>{employee.name}</TableCell>
              <TableCell>{employee.no}</TableCell>
              <TableCell>{employee.position}</TableCell>
              <TableCell>{employee.department}</TableCell>
              <TableCell>{formatDate(employee.join_date)}</TableCell>
              <TableCell>
                <Avatar
                  src={getPhotoUrl(employee.photo)}
                  alt={employee.name}
                  sx={{ width: 40, height: 40 }}
                  variant='rounded'
                >
                  {employee.name.charAt(0)}
                </Avatar>
              </TableCell>
              <TableCell>
                <Chip
                  style={{ textTransform: 'uppercase' }}
                  label={employee.status}
                  color={getStatusChipColor(employee.status)}
                  size="small"
                />
              </TableCell>
              <TableCell>
                <IconButton
                  aria-label="more"
                  aria-controls="long-menu"
                  aria-haspopup="true"
                  onClick={(event) => { handleMenuOpen(event, employee.id); }}
                >
                  <DotsThreeOutlineVertical />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Menu
        id="long-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEdit}>
          <Pencil style={{ marginRight: '8px' }} /> Edit
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          <Trash color='red' style={{ marginRight: '8px' }} /> Hapus
        </MenuItem>
      </Menu>
    </TableContainer>
  );
};