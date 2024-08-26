import dayjs from 'dayjs';
import 'dayjs/locale/id';
import { Employee } from './employee-types';
import { config } from '@/config';

dayjs.locale('id');

export const getStatusChipColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'probation':
      return 'warning';
    case 'kontrak':
      return 'info';
    case 'tetap':
      return 'success';
    default:
      return 'default';
  }
};

export const getPhotoUrl = (photoPath: string) => {
  if (!photoPath) return '';
  return photoPath.startsWith('http')
    ? photoPath
    : `${config.serverURL}/media/file/${photoPath}`;
};

export const formatDate = (dateString: string) => {
  return dayjs(dateString).format('D MMMM YYYY');
};

export const convertToCSV = (data: Employee[]) => {
  const header = ['nama', 'nomor', 'jabatan', 'departemen', 'tanggal_masuk', 'foto', 'status'];
  const rows = data.map(employee => [
    employee.name,
    employee.no,
    employee.position,
    employee.department,
    employee.join_date,
    getPhotoUrl(employee.photo),
    employee.status
  ]);
  const csvContent = [
    header.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');
  return csvContent;
};

export const dataForUpdate = (updatedEmployee: Employee) => {
  const { id, name, position, department, join_date, status, no } = updatedEmployee;
  return { name, position, department, join_date, status, no };
};