import { useQuery } from 'react-query';
import { config } from '@/config';
import { type ApiResponse } from './employee-types';

export const useEmployees = (
  department: string,
  status: string,
  sortBy: string,
  sortOrder: string,
  page: number,
  rowsPerPage: number
) => {
  return useQuery<ApiResponse, Error>(
    ['employees', department, status, sortBy, sortOrder, page, rowsPerPage],
    async () => {
      console.log('Fetching employees data...');
      const response = await fetch(
        `${config.serverURL}/employees?department=${department}&status=${status}&sortBy=${sortBy}&sortOrder=${sortOrder}&page=${page}&limit=${rowsPerPage}`
      );
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      console.log('Fetched data:', data);
      return data;
    },
    {
      onError: (error) => {
        console.error('Error fetching employees:', error);
      },
    }
  );
};