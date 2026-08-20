import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  CheckCircle2,
  Crown,
  Edit3,
  Mail,
  Plus,
  Search,
  Shield,
  Trash2,
  UserCircle,
  Users,
  WalletCards,
  XCircle,
} from 'lucide-react';

import { adminAdminsApi, type AdminCreatePayload, type AdminUpdatePayload } from '../services/adminAdminsApi';
import type { Admin } from '../types/admin.types';
import { PageHero } from '@/components/ui/PageHero';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Toast } from '@/components/ui/Toast';
import { getErrorMessage } from '@/lib/http';

type PaginatedAdmins = {
  current_page: number;
  data: Admin[];
  from: number | null;
  last_page: number;
  per_page: number;
  to: number | null;
  total: number;
};

type AdminForm = {
  name: string;
  email: string;
  role: Admin['role'];
  is_active: boolean;
  password: string;
  password_confirmation: string;
};

const emptyForm: AdminForm = {
  name: '',
  email: '',
  role: 'admin',
  is_active: true,
  password: '',
  password_confirmation: '',
};

const roleMeta: Record<Admin['role'], { label: string; className: string; icon: typeof Shield }> = {
  super_admin: { label: 'Super Admin', className: 'bg-violet-100 text-violet-700', icon: Crown },
  admin: { label: 'Admin', className: 'bg-sky-100 text-sky-700', icon: Shield },
  support: { label: 'Support', className: 'bg-emerald-100 text-emerald-700', icon: Users },
  finance: { label: 'Finance', className: 'bg-amber-100 text-amber-700', icon: WalletCards },
};

function readCurrentAdmin(): Partial<Admin> {
  try {
    return JSON.parse(localStorage.getItem('admin') || '{}');
  } catch {
    return {};
  }
}

export default function AdminAdmins() {
  const queryClient = useQueryClient();
  const currentAdmin = useMemo(() => readCurrentAdmin(), []);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Admin | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<AdminForm>(emptyForm);
  const [formError, setFormError] = useState('');
  const [confirm, setConfirm] = useState<{ type: 'toggle' | 'delete'; admin: Admin } | null>(null);
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const adminsQuery = useQuery({
    queryKey: ['admin', 'admins', search, page],
    queryFn: async () => {
      const response = await adminAdminsApi.list({
        search: search || undefined,
        page,
        per_page: 20,
      });
      return response.data.data as unknown as PaginatedAdmins;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editing) {
        const payload: AdminUpdatePayload = {
          name: form.name.trim(),
          email: form.email.trim(),
          role: form.role,
          is_active: form.is_active,
        };
        const response = await adminAdminsApi.update(editing.id, payload);
        if (form.password) {
          await adminAdminsApi.updatePassword(editing.id, form.password, form.password_confirmation);
        }
        return response;
      }

      const payload: AdminCreatePayload = {
        name: form.name.trim(),
        email: form.email.trim(),
        role: form.role,
        is_active: form.is_active,
        password: form.password,
        password_confirmation: form.password_confirmation,
      };
      return adminAdminsApi.create(payload);
    },
    onSuccess: async () => {
      const wasEditing = !!editing;
      await queryClient.invalidateQueries({ queryKey: ['admin', 'admins'] });
      setFormOpen(false);
      setEditing(null);
      setForm(emptyForm);
      setFormError('');
      setToast({ text: wasEditing ? 'Ադմինի տվյալները թարմացվեցին' : 'Նոր ադմինը ստեղծվեց', type: 'success' });
    },
    onError: (error: unknown) => setFormError(getErrorMessage(error, 'Չհաջողվեց պահպանել ադմինին')),
  });

  const actionMutation = useMutation({
    mutationFn: async (action: { type: 'toggle' | 'delete'; admin: Admin }) => (
      action.type === 'toggle'
        ? adminAdminsApi.toggleActive(action.admin.id)
        : adminAdminsApi.delete(action.admin.id)
    ),
    onSuccess: async (_, action) => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'admins'] });
      setConfirm(null);
      setToast({
        text: action.type === 'delete'
          ? 'Ադմինը ջնջվեց'
          : action.admin.is_active ? 'Ադմինը ապաակտիվացվեց' : 'Ադմինը ակտիվացվեց',
        type: 'success',
      });
    },
    onError: (error: unknown) => {
      setConfirm(null);
      setToast({ text: getErrorMessage(error, 'Գործողությունը չհաջողվեց'), type: 'error' });
    },
  });

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormError('');
    setFormOpen(true);
  };

  const openEdit = (admin: Admin) => {
    setEditing(admin);
    setForm({
      name: admin.name,
      email: admin.email,
      role: admin.role,
      is_active: admin.is_active,
      password: '',
      password_confirmation: '',
    });
    setFormError('');
    setFormOpen(true);
  };

  const pagination = adminsQuery.data;
  const admins = pagination?.data ?? [];

  if (adminsQuery.isLoading) {
    return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-b-2 border-slate-900" /></div>;
  }

  if (adminsQuery.isError) {
    return <div className="rounded-[28px] border border-rose-200 bg-rose-50 p-5 text-rose-700"><div className="flex items-center gap-2"><AlertCircle size={20} />Չհաջողվեց բեռնել ադմինների ցուցակը</div></div>;
  }

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow={<><Shield className="h-4 w-4" /> Admin team</>}
        title="Ադմիններ"
        description="Կառավարիր հարթակի ադմինների դերերը և հասանելիությունը։ Գաղտնաբառերը երբեք չեն ցուցադրվում կամ գրանցվում մատյանում։"
        actions={<Button onClick={openCreate}><Plus size={18} /> Նոր ադմին</Button>}
      />

      <Card className="rounded-[28px] p-4 sm:p-5">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(event) => { setSearch(event.target.value); setPage(1); }}
            placeholder="Որոնել անունով կամ էլ. փոստով..."
            className="pl-11"
          />
        </div>
      </Card>

      <Card className="overflow-hidden rounded-[30px] p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="border-b border-slate-200 bg-slate-50/80">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-500">Ադմին</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-500">Դեր</th>
                <th className="px-6 py-4 text-center text-sm font-medium text-slate-500">Վիճակ</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-500">Վերջին մուտք</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-slate-500">Գործողություններ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {admins.map((admin, index) => {
                const meta = roleMeta[admin.role];
                const RoleIcon = meta.icon;
                const isSelf = Number(currentAdmin.id) === admin.id;
                return (
                  <motion.tr key={admin.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.02 }} className="hover:bg-violet-50/40">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-violet-100 text-violet-700"><UserCircle size={21} /></div>
                        <div>
                          <div className="font-medium text-slate-900">{admin.name}{isSelf ? <span className="ml-2 text-xs text-violet-600">Դուք</span> : null}</div>
                          <div className="mt-1 flex items-center gap-1 text-xs text-slate-500"><Mail size={12} />{admin.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4"><span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs ${meta.className}`}><RoleIcon size={13} />{meta.label}</span></td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center gap-1 text-xs ${admin.is_active ? 'text-emerald-600' : 'text-slate-400'}`}>
                        {admin.is_active ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                        {admin.is_active ? 'Ակտիվ' : 'Ապաակտիվ'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">{admin.last_login_at ? new Date(admin.last_login_at).toLocaleString('hy-AM') : 'Դեռ չի մուտք գործել'}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <Button variant="secondary" size="sm" onClick={() => openEdit(admin)} aria-label="Խմբագրել"><Edit3 size={15} /></Button>
                        <Button variant="secondary" size="sm" disabled={isSelf} onClick={() => setConfirm({ type: 'toggle', admin })}>{admin.is_active ? 'Ապաակտիվացնել' : 'Ակտիվացնել'}</Button>
                        <Button variant="danger" size="sm" disabled={isSelf} onClick={() => setConfirm({ type: 'delete', admin })} aria-label="Ջնջել"><Trash2 size={15} /></Button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {admins.length === 0 ? <div className="py-12 text-center text-slate-500">Ադմիններ չեն գտնվել</div> : null}
      </Card>

      {pagination && pagination.last_page > 1 ? (
        <div className="flex flex-col gap-3 rounded-[24px] border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <div>{pagination.from}–{pagination.to}՝ ընդհանուր {pagination.total}-ից</div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>Նախորդ</Button>
            <Button variant="secondary" size="sm" disabled={page >= pagination.last_page} onClick={() => setPage((value) => value + 1)}>Հաջորդ</Button>
          </div>
        </div>
      ) : null}

      <Modal
        open={formOpen}
        onClose={() => !saveMutation.isPending && setFormOpen(false)}
        title={editing ? 'Խմբագրել ադմինին' : 'Նոր ադմին'}
        description={editing ? 'Փոփոխությունները անմիջապես կկիրառվեն հաջորդ API հարցումից։' : 'Ստեղծիր միայն անհրաժեշտ նվազագույն իրավունքներով հաշիվ։'}
        footer={
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={() => setFormOpen(false)} disabled={saveMutation.isPending}>Չեղարկել</Button>
            <Button type="submit" form="admin-form" loading={saveMutation.isPending}>Պահպանել</Button>
          </div>
        }
      >
        <form id="admin-form" className="grid gap-4 sm:grid-cols-2" onSubmit={(event) => {
          event.preventDefault();
          setFormError('');
          if (form.password !== form.password_confirmation) {
            setFormError('Գաղտնաբառերը չեն համընկնում');
            return;
          }
          if (form.password && form.password.length < 12) {
            setFormError('Գաղտնաբառը պետք է պարունակի առնվազն 12 նիշ');
            return;
          }
          saveMutation.mutate();
        }}>
          {formError ? <div role="alert" className="sm:col-span-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{formError}</div> : null}
          <label className="space-y-2 text-sm text-slate-700"><span>Անուն</span><Input required value={form.name} onChange={(event) => setForm((value) => ({ ...value, name: event.target.value }))} /></label>
          <label className="space-y-2 text-sm text-slate-700"><span>Էլ. փոստ</span><Input required type="email" autoComplete="off" value={form.email} onChange={(event) => setForm((value) => ({ ...value, email: event.target.value }))} /></label>
          <label className="space-y-2 text-sm text-slate-700">
            <span>Դեր</span>
            <select className="bb-input" value={form.role} disabled={Number(currentAdmin.id) === editing?.id} onChange={(event) => setForm((value) => ({ ...value, role: event.target.value as Admin['role'] }))}>
              <option value="super_admin">Super Admin</option>
              <option value="admin">Admin</option>
              <option value="support">Support</option>
              <option value="finance">Finance</option>
            </select>
          </label>
          <label className="flex items-center gap-3 self-end rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700">
            <input type="checkbox" checked={form.is_active} disabled={Number(currentAdmin.id) === editing?.id} onChange={(event) => setForm((value) => ({ ...value, is_active: event.target.checked }))} />
            Ակտիվ հաշիվ
          </label>
          <label className="space-y-2 text-sm text-slate-700"><span>{editing ? 'Նոր գաղտնաբառ՝ ըստ ցանկության' : 'Գաղտնաբառ՝ առնվազն 12 նիշ'}</span><Input required={!editing} minLength={12} type="password" autoComplete="new-password" value={form.password} onChange={(event) => setForm((value) => ({ ...value, password: event.target.value }))} /></label>
          <label className="space-y-2 text-sm text-slate-700"><span>Կրկնել գաղտնաբառը</span><Input required={!editing || !!form.password} minLength={12} type="password" autoComplete="new-password" value={form.password_confirmation} onChange={(event) => setForm((value) => ({ ...value, password_confirmation: event.target.value }))} /></label>
        </form>
      </Modal>

      <ConfirmModal
        open={!!confirm}
        title={confirm?.type === 'delete' ? 'Ջնջե՞լ ադմինի հաշիվը' : confirm?.admin.is_active ? 'Ապաակտիվացնե՞լ ադմինին' : 'Ակտիվացնե՞լ ադմինին'}
        description={confirm ? `${confirm.admin.name} · ${confirm.admin.email}` : undefined}
        confirmText={confirm?.type === 'delete' ? 'Ջնջել' : 'Հաստատել'}
        danger={confirm?.type === 'delete' || !!confirm?.admin.is_active}
        loading={actionMutation.isPending}
        onClose={() => !actionMutation.isPending && setConfirm(null)}
        onConfirm={() => confirm && actionMutation.mutate(confirm)}
      />

      <Toast open={!!toast} text={toast?.text || ''} type={toast?.type} />
    </div>
  );
}
