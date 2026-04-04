
import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedAdminRoute() {
    const token = localStorage.getItem('admin_token');
    const admin = localStorage.getItem('admin');

    if (!token || !admin) {
        return <Navigate to="/admin/login" replace />;
    }

    return <Outlet />;
}