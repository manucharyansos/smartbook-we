
import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

import { AppRouteLoader } from '@/components/AppRouteLoader';
import { adminService } from '../services/adminApi';

export default function ProtectedAdminRoute() {
    const token = localStorage.getItem('admin_token');
    const [status, setStatus] = useState<'checking' | 'authenticated' | 'guest'>(token ? 'checking' : 'guest');

    useEffect(() => {
        let active = true;

        if (!token) {
            return () => { active = false; };
        }

        adminService.me()
            .then((response) => {
                if (!active) return;
                const admin = response.data?.data?.admin;
                if (!admin) {
                    localStorage.removeItem('admin_token');
                    localStorage.removeItem('admin');
                    setStatus('guest');
                    return;
                }

                localStorage.setItem('admin', JSON.stringify(admin));
                setStatus('authenticated');
            })
            .catch(() => {
                if (!active) return;
                localStorage.removeItem('admin_token');
                localStorage.removeItem('admin');
                setStatus('guest');
            });

        return () => { active = false; };
    }, [token]);

    if (status === 'checking') {
        return <AppRouteLoader />;
    }

    if (status === 'guest') {
        return <Navigate to="/admin/login" replace />;
    }

    return <Outlet />;
}
