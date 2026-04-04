// src/admin/pages/AdminUsers.tsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
    Users,
    Search,
    MoreHorizontal,
    Mail,
    UserCircle,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Building2
} from 'lucide-react';
import { adminUsersApi } from '../services/adminUsersApi';
import { PageHero } from '@/components/ui/PageHero';

interface User {
    id: number;
    name: string;
    email: string;
    role: 'owner' | 'manager' | 'staff';
    is_active: boolean;
    business?: {
        id: number;
        name: string;
        business_type: string;
    };
    created_at: string;
}

interface PaginatedResponse {
    current_page: number;
    data: User[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
}

interface ApiResponse {
    success: boolean;
    data: PaginatedResponse;
}

export default function AdminUsers() {
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [page, setPage] = useState(1);

    const { data, isLoading, error } = useQuery({
        queryKey: ['admin', 'users', search, roleFilter, statusFilter, page],
        queryFn: async () => {
            const res = await adminUsersApi.list({
                search: search || undefined,
                role: roleFilter || undefined,
                is_active: statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined,
                page: page,
                per_page: 20,
            });
            return res.data as unknown as ApiResponse;
        },
    });


    // Extract users from paginated response - ՍԱ Է ԿԱՐԵՎՈՐ ՓՈՓՈԽՈՒԹՅՈՒՆԸ
    const users = data?.data?.data || [];
    const pagination = data?.data;

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'owner':
                return <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">Սեփականատեր</span>;
            case 'manager':
                return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">Կառավարիչ</span>;
            case 'staff':
                return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">Աշխատակից</span>;
            default:
                return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">{role}</span>;
        }
    };

    const getBusinessTypeBadge = (type?: string) => {
        if (!type) return null;
        return type === 'beauty'
            ? <span className="ml-2 px-1.5 py-0.5 bg-purple-50 text-purple-600 rounded text-xs">Beauty</span>
            : <span className="ml-2 px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-xs">Clinic</span>;
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
                    <span>Չհաջողվեց բեռնել օգտատերերի ցուցակը</span>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <PageHero
                eyebrow={<><Users className="h-4 w-4" /> User management</>}
                title="Օգտատերեր"
                description="Բոլոր business user-երը, նրանց դերը և ակտիվության վիճակը մեկ տեղում։"
            />

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Որոնել օգտատերեր..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#C5A28A]"
                        />
                    </div>

                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#C5A28A]"
                    >
                        <option value="">Բոլոր դերերը</option>
                        <option value="owner">Սեփականատեր</option>
                        <option value="manager">Կառավարիչ</option>
                        <option value="staff">Աշխատակից</option>
                    </select>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#C5A28A]"
                    >
                        <option value="">Բոլոր կարգավիճակները</option>
                        <option value="active">Ակտիվ</option>
                        <option value="inactive">Ապաակտիվ</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Օգտատեր</th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Դեր</th>
                            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Բիզնես</th>
                            <th className="px-6 py-4 text-center text-sm font-medium text-gray-500">Կարգավիճակ</th>
                            <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">Գրանցված</th>
                            <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">Գործողություններ</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                        {Array.isArray(users) && users.map((user: User, index: number) => (
                            <motion.tr
                                key={user.id}
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
                                            <div className="font-medium text-gray-900">{user.name}</div>
                                            <div className="text-xs text-gray-500 flex items-center gap-1">
                                                <Mail size={12} />
                                                {user.email}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">{getRoleBadge(user.role)}</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-1">
                                        <Building2 size={14} className="text-gray-400" />
                                        <span className="text-sm text-gray-700">
                                                {user.business?.name || '—'}
                                            </span>
                                        {user.business?.business_type && getBusinessTypeBadge(user.business.business_type)}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    {user.is_active ? (
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
                                <td className="px-6 py-4 text-right text-sm text-gray-500">
                                    {new Date(user.created_at).toLocaleDateString('hy-AM')}
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

                {(!Array.isArray(users) || users.length === 0) && (
                    <div className="text-center py-12">
                        <Users size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500">Օգտատերեր չեն գտնվել</p>
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