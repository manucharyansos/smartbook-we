import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
    Shield,
    Search,
    MoreHorizontal,
    Mail,
    Phone,
    UserCircle,
    CheckCircle2,
    XCircle,
    Plus,
    Crown,
    Users,
    Settings,
    AlertCircle
} from 'lucide-react';
import { adminAdminsApi } from '../services/adminAdminsApi';
import { PageHero } from '@/components/ui/PageHero';

interface Admin {
    id: number;
    name: string;
    email: string;
    phone?: string;
    role: 'super_admin' | 'admin' | 'support' | 'finance';
    is_active: boolean;
    last_login_at?: string;
    created_at: string;
}

interface PaginatedResponse {
    current_page: number;
    data: Admin[];
    first_page_url: string;
    from: number | null;
    last_page: number;
    last_page_url: string;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number | null;
    total: number;
}

interface ApiResponse {
    data: PaginatedResponse;
}

export default function AdminAdmins() {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);

    const { data, isLoading, error } = useQuery({
        queryKey: ['admin', 'admins', search, page],
        queryFn: async () => {
            const res = await adminAdminsApi.list({
                search: search || undefined,
                page: page,
                per_page: 20,
            });
            return res.data as unknown as ApiResponse;
        },
    });


    // Extract data from paginated response
    const pagination = data?.data;
    const admins = pagination?.data || [];

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'super_admin':
                return (
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs flex items-center gap-1">
                        <Crown size={12} />
                        Super Admin
                    </span>
                );
            case 'admin':
                return (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs flex items-center gap-1">
                        <Shield size={12} />
                        Admin
                    </span>
                );
            case 'support':
                return (
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs flex items-center gap-1">
                        <Users size={12} />
                        Support
                    </span>
                );
            case 'finance':
                return (
                    <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs flex items-center gap-1">
                        <Settings size={12} />
                        Finance
                    </span>
                );
            default:
                return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">{role}</span>;
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
                <div className="flex items-center gap-2">
                    <AlertCircle size={20} />
                    <span>Չհաջողվեց բեռնել ադմինների ցուցակը</span>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <PageHero
                eyebrow={<><Shield className="h-4 w-4" /> Admin team</>}
                title="Ադմիններ"
                description="Super admin, finance, support և admin թիմի մուտքերն ու կարգավիճակները։"
                actions={<button className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 text-sm font-medium text-white shadow-[0_12px_24px_rgba(124,58,237,0.22)]"><Plus size={18} /><span>Նոր ադմին</span></button>}
            />

            {/* Search */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Որոնել ադմիններ..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#C5A28A]"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Ադմին</th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Դեր</th>
                            <th className="px-6 py-4 text-center text-sm font-medium text-gray-500">Կարգավիճակ</th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Վերջին մուտք</th>
                            <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">Գրանցված</th>
                            <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">Գործողություններ</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                        {admins.map((admin: Admin, index: number) => (
                            <motion.tr
                                key={admin.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.03 }}
                                className="hover:bg-gray-50"
                            >
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#C5A28A]/20 to-[#B88E72]/20
                                                              flex items-center justify-center">
                                            <UserCircle size={20} className="text-[#C5A28A]" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900">{admin.name}</div>
                                            <div className="text-xs text-gray-500 flex flex-col gap-1">
                                                <div className="flex items-center gap-1">
                                                    <Mail size={12} />
                                                    {admin.email}
                                                </div>
                                                {admin.phone && (
                                                    <div className="flex items-center gap-1">
                                                        <Phone size={12} />
                                                        {admin.phone}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">{getRoleBadge(admin.role)}</td>
                                <td className="px-6 py-4 text-center">
                                    {admin.is_active ? (
                                        <span className="inline-flex items-center gap-1 text-green-600">
                                                <CheckCircle2 size={16} />
                                                <span className="text-xs">Ակտիվ</span>
                                            </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 text-gray-400">
                                                <XCircle size={16} />
                                                <span className="text-xs">Ապաակտիվ</span>
                                            </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    {admin.last_login_at
                                        ? new Date(admin.last_login_at).toLocaleString('hy-AM')
                                        : 'Երբևէ'}
                                </td>
                                <td className="px-6 py-4 text-right text-sm text-gray-500">
                                    {new Date(admin.created_at).toLocaleDateString('hy-AM')}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                                        <MoreHorizontal size={18} className="text-gray-500" />
                                    </button>
                                </td>
                            </motion.tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                {admins.length === 0 && (
                    <div className="text-center py-12">
                        <Shield size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500">Ադմիններ չեն գտնվել</p>
                    </div>
                )}

                {/* Pagination */}
                {pagination && pagination.last_page > 1 && (
                    <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                            Ցուցադրվում է {pagination.from} - {pagination.to} ընդհանուր {pagination.total}-ից
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-3 py-1 border border-gray-200 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                                Նախորդ
                            </button>
                            <span className="px-3 py-1 text-sm">
                                Էջ {page} / {pagination.last_page}
                            </span>
                            <button
                                onClick={() => setPage(p => Math.min(pagination.last_page, p + 1))}
                                disabled={page === pagination.last_page}
                                className="px-3 py-1 border border-gray-200 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                                Հաջորդ
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}