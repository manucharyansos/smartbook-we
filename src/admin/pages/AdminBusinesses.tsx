import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertCircle, Building2, Download, Search, Sparkles, Award, HandCoins } from 'lucide-react';

import { adminBusinessesApi } from '../services/adminBusinessesApi';
import { PageHero } from '@/components/ui/PageHero';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { AdminStatCard } from '../components/AdminStatCard';
import { adminAnalyticsService } from '../services/adminAnalyticsApi';
import { downloadBlob, filenameFromContentDisposition } from '../lib/download';
import { Toast } from '@/components/ui/Toast';
import { getErrorMessage } from '@/lib/http';

interface Business {
  id: number;
  name: string;
  slug: string;
  business_type: string;
  vertical?: 'services' | 'healthcare';
  status: 'active' | 'suspended' | 'pending';
  users_count?: number;
  bookings_count?: number;
  total_revenue?: number;
  created_at: string;
}

interface PaginatedResponse {
  current_page: number;
  data: Business[];
  last_page: number;
  per_page: number;
  total: number;
}

interface ApiResponse {
  success: boolean;
  data: PaginatedResponse;
}

const statusLabel: Record<string, string> = { active: 'Ակտիվ', suspended: 'Կասեցված', pending: 'Սպասման մեջ' };

function fmtAMD(n: number) {
  return `${new Intl.NumberFormat('hy-AM').format(n)} ֏`;
}

function businessTypeLabel(type: string) {
  return ['dental', 'clinic', 'healthcare'].includes(type) ? 'Առողջապահություն' : 'Ծառայություններ';
}

export default function AdminBusinesses() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [exporting, setExporting] = useState(false);
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const canExport = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('admin') || '{}')?.role === 'super_admin';
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'businesses', search, statusFilter, typeFilter, page],
    queryFn: async () => {
      const res = await adminBusinessesApi.list({
        search: search || undefined,
        status: statusFilter || undefined,
        business_type: typeFilter || undefined,
        page,
        per_page: 20,
      });
      return res.data as unknown as ApiResponse;
    },
  });

  const businesses = useMemo(() => data?.data?.data || [], [data?.data?.data]);
  const pagination = data?.data;

  const summary = useMemo(() => {
    const totalRevenue = businesses.reduce((sum, item) => sum + Number(item.total_revenue || 0), 0);
    const active = businesses.filter((item) => item.status === 'active').length;
    const healthcare = businesses.filter((item) => ['dental', 'clinic', 'healthcare'].includes(item.vertical || item.business_type)).length;
    return { totalRevenue, active, healthcare };
  }, [businesses]);

  const handleExport = async () => {
    if (exporting) return;
    setExporting(true);
    try {
      const response = await adminAnalyticsService.exportBusinesses({
        search: search || undefined,
        status: (statusFilter || undefined) as 'active' | 'suspended' | 'pending' | undefined,
        business_type: (typeFilter || undefined) as 'services' | 'healthcare' | undefined,
      });
      const disposition = response.headers?.['content-disposition'] || response.headers?.['Content-Disposition'];
      downloadBlob(response.data, filenameFromContentDisposition(disposition) || 'vizit-businesses.csv');
      setToast({ text: 'Բիզնեսների CSV ֆայլը պատրաստ է', type: 'success' });
    } catch (exportError: unknown) {
      setToast({ text: getErrorMessage(exportError, 'CSV արտահանումը չհաջողվեց'), type: 'error' });
    } finally {
      setExporting(false);
    }
  };

  if (isLoading) {
    return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-b-2 border-slate-900" /></div>;
  }

  if (error) {
    return <div className="rounded-[28px] border border-red-200 bg-red-50 p-4 text-red-700"><div className="flex items-center gap-2"><AlertCircle size={20} /><span>Չհաջողվեց բեռնել բիզնեսների ցուցակը</span></div></div>;
  }

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow={<><Building2 className="h-4 w-4" /> Business management</>}
        title="Բիզնեսների կառավարում"
        description="Ընտրիր բիզնեսը, տես նրա subscription/profile վիճակը, տուր անհատական առաջարկ կամ ստուգիր health-ը մեկ տեղից։"
        actions={canExport ? <Button variant="secondary" className="gap-2" onClick={handleExport} loading={exporting}><Download className="h-4 w-4" /> Արտահանել CSV</Button> : undefined}
      />

      <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
        <AdminStatCard title="Filtered total" value={pagination?.total ?? 0} hint="Ընթացիկ ֆիլտրերի համապատասխան բիզնեսներ" icon={Building2} tone="violet" />
        <AdminStatCard title="Active in page" value={summary.active} hint="Ընթացիկ էջի ակտիվ բիզնեսներ" icon={Sparkles} tone="emerald" />
        <AdminStatCard title="Healthcare in page" value={summary.healthcare} hint="Առողջապահական բիզնեսներ այս էջում" icon={Award} tone="sky" />
        <AdminStatCard title="Revenue in page" value={fmtAMD(summary.totalRevenue)} hint="Ընթացիկ էջի բոլոր բիզնեսների գումարային revenue" icon={HandCoins} tone="amber" />
      </div>

      <Card className="rounded-[28px] p-4 sm:p-5">
        <div className="grid gap-3 2xl:grid-cols-[minmax(0,1fr)_220px_220px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Որոնել բիզնեսներ..." className="pl-11" />
          </div>
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="bb-input">
            <option value="">Բոլոր կարգավիճակները</option>
            <option value="active">Ակտիվ</option>
            <option value="suspended">Կասեցված</option>
            <option value="pending">Սպասման մեջ</option>
          </select>
          <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }} className="bb-input">
            <option value="">Բոլոր տեսակները</option>
            <option value="services">Ծառայություններ</option>
            <option value="healthcare">Առողջապահություն</option>
          </select>
        </div>
      </Card>

      <div className="space-y-3 lg:hidden">
        {businesses.map((business, index) => (
          <motion.button key={business.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }} onClick={() => canExport && navigate(`/admin/businesses/${business.id}`)} disabled={!canExport} className="w-full text-left disabled:cursor-default">
            <Card className="rounded-[28px] p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-lg font-semibold text-slate-950">{business.name}</div>
                  <div className="mt-1 text-sm text-slate-500">{business.slug}</div>
                </div>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600">{statusLabel[business.status] || business.status}</span>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-full bg-violet-50 px-3 py-1 text-violet-700">{businessTypeLabel(business.business_type)}</span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">{business.users_count || 0} users</span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">{business.bookings_count || 0} bookings</span>
              </div>
              <div className="mt-4 text-sm text-slate-500">Revenue {fmtAMD(Number(business.total_revenue || 0))}</div>
            </Card>
          </motion.button>
        ))}
      </div>

      <Card className="hidden overflow-hidden rounded-[30px] p-0 lg:block">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="border-b border-slate-200 bg-slate-50/80">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-500">Բիզնես</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-500">Տեսակ</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-500">Կարգավիճակ</th>
                <th className="px-6 py-4 text-center text-sm font-medium text-slate-500">Users</th>
                <th className="px-6 py-4 text-center text-sm font-medium text-slate-500">Bookings</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-slate-500">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {businesses.map((business, index) => (
                <motion.tr key={business.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.02 }} className={canExport ? 'cursor-pointer transition hover:bg-violet-50/50' : ''} onClick={() => canExport && navigate(`/admin/businesses/${business.id}`)}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-violet-100 to-fuchsia-100 text-violet-700"><Building2 className="h-5 w-5" /></div>
                      <div>
                        <div className="font-medium text-slate-900">{business.name}</div>
                        <div className="text-xs text-slate-500">{business.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4"><span className="rounded-full bg-violet-50 px-3 py-1 text-xs text-violet-700">{businessTypeLabel(business.business_type)}</span></td>
                  <td className="px-6 py-4"><span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600">{statusLabel[business.status] || business.status}</span></td>
                  <td className="px-6 py-4 text-center text-sm text-slate-600">{business.users_count || 0}</td>
                  <td className="px-6 py-4 text-center text-sm text-slate-600">{business.bookings_count || 0}</td>
                  <td className="px-6 py-4 text-right text-sm font-medium text-slate-900">{fmtAMD(Number(business.total_revenue || 0))}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {pagination ? (
        <div className="flex flex-col gap-3 rounded-[24px] border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <div>Page {pagination.current_page} / {pagination.last_page} · {pagination.total} businesses</div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" disabled={pagination.current_page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</Button>
            <Button variant="secondary" size="sm" disabled={pagination.current_page >= pagination.last_page} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </div>
        </div>
      ) : null}

      <Toast open={!!toast} text={toast?.text || ''} type={toast?.type} />
    </div>
  );
}
