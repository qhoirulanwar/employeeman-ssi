import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';

export const navItems = [
  { key: 'overview', title: 'Dashboard', href: paths.dashboard.overview, icon: 'chart-pie' },
  { key: 'karyawan', title: 'Karyawan', href: paths.dashboard.employee, icon: 'users' },
] satisfies NavItemConfig[];
