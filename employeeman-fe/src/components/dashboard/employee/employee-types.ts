export interface Employee {
  id: number;
  name: string;
  no: string;
  position: string;
  department: string;
  join_date: string;
  photo: string;
  status: string;
}

export interface ApiResponse {
  data: Employee[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface DepartmentOption {
  title: string;
}

export interface DepartmentResponse {
  departments: string[];
}