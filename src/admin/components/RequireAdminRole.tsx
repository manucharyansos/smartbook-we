import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

import type { Admin } from '../types/admin.types';

type Props = {
  roles: Admin['role'][];
  children: ReactNode;
  fallback?: string;
};

export default function RequireAdminRole({ roles, children, fallback = '/admin/businesses' }: Props) {
  let role: Admin['role'] | undefined;

  try {
    role = JSON.parse(localStorage.getItem('admin') || '{}')?.role;
  } catch {
    role = undefined;
  }

  if (!role || !roles.includes(role)) {
    return <Navigate to={fallback} replace />;
  }

  return children;
}
