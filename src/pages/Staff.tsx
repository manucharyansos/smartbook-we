import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Users,
  User,
  Search,
  Shield,
  Briefcase,
  Sparkles,
  Mail,
  Phone,
  CheckCircle2,
  Ban,
  Eye,
  EyeOff,
  ImagePlus,
  Globe2,
  CalendarCheck2,
  Pencil,
  Star,
  Info,
} from "lucide-react";

import { page, card, cardTransition } from "../lib/motion";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { PageHero } from "../components/ui/PageHero";
import { EmptyState } from "../components/ui/EmptyState";
import { Spinner } from "../components/ui/Spinner";
import { cn } from "../lib/cn";
import {
  fetchStaff,
  createStaff,
  activateStaff,
  deactivateStaff,
  updateStaff,
  type StaffUser,
} from "../lib/staffApi";
import { uploadMedia } from "../lib/mediaApi";

type StaffRoleForm = "staff" | "manager";

type FormState = {
  name: string;
  email: string;
  password: string;
  role: StaffRoleForm;
  phone: string;
  whatsapp_phone: string;
  bio: string;
  show_in_public_team: boolean;
  is_bookable: boolean;
};

const emptyForm: FormState = {
  name: "",
  email: "",
  password: "",
  role: "staff",
  phone: "",
  whatsapp_phone: "",
  bio: "",
  show_in_public_team: true,
  is_bookable: true,
};

function roleLabel(role: string) {
  if (role === "owner") return "Owner";
  if (role === "manager") return "Manager";
  if (role === "super_admin") return "Super Admin";
  return "Staff";
}

function roleUi(role: string) {
  if (role === "owner") {
    return {
      cls: "border-violet-200 bg-violet-50 text-violet-700",
      icon: <Shield className="h-3.5 w-3.5" />,
    };
  }
  if (role === "manager") {
    return {
      cls: "border-sky-200 bg-sky-50 text-sky-700",
      icon: <Briefcase className="h-3.5 w-3.5" />,
    };
  }
  if (role === "super_admin") {
    return {
      cls: "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700",
      icon: <Shield className="h-3.5 w-3.5" />,
    };
  }
  return {
    cls: "border-slate-200 bg-slate-50 text-slate-600",
    icon: <User className="h-3.5 w-3.5" />,
  };
}

function rolePreset(role: StaffRoleForm) {
  if (role === "manager") {
    return {
      title: "Մենեջեր",
      description: "Կառավարում է թիմը և օրվա հոսքը։ Լռելյայն public/bookable չէ, բայց կարող ես միացնել։",
      show_in_public_team: false,
      is_bookable: false,
      icon: Briefcase,
      accent: "from-sky-500 to-cyan-500",
      soft: "border-sky-200 bg-sky-50 text-sky-700",
    };
  }

  return {
    title: "Մասնագետ",
    description: "Ծառայություն մատուցող անդամ է։ Լռելյայն public է և booking ընդունում է։",
    show_in_public_team: true,
    is_bookable: true,
    icon: Sparkles,
    accent: "from-violet-600 to-fuchsia-600",
    soft: "border-violet-200 bg-violet-50 text-violet-700",
  };
}

function normalizeFormFromPerson(person: StaffUser): FormState {
  return {
    name: person.name ?? "",
    email: person.email ?? "",
    password: "",
    role: person.role === "manager" ? "manager" : "staff",
    phone: person.phone ?? "",
    whatsapp_phone: person.whatsapp_phone ?? "",
    bio: person.bio ?? "",
    show_in_public_team: person.show_in_public_team,
    is_bookable: person.is_bookable,
  };
}

export default function Staff() {
  const qc = useQueryClient();

  const [search, setSearch] = useState("");
  const [panelOpen, setPanelOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const staffQ = useQuery({
    queryKey: ["staff"],
    queryFn: fetchStaff,
  });

  const createMut = useMutation({
    mutationFn: createStaff,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["staff"] });
    },
  });

  const deactivateMut = useMutation({
    mutationFn: deactivateStaff,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["staff"] });
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Parameters<typeof updateStaff>[1] }) => updateStaff(id, payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["staff"] });
    },
  });

  const activateMut = useMutation({
    mutationFn: activateStaff,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["staff"] });
    },
  });

  const staff = staffQ.data ?? [];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return staff;

    return staff.filter((s: StaffUser) => {
      return (
        (s.name ?? "").toLowerCase().includes(q) ||
        (s.email ?? "").toLowerCase().includes(q) ||
        (s.phone ?? "").toLowerCase().includes(q) ||
        (s.whatsapp_phone ?? "").toLowerCase().includes(q)
      );
    });
  }, [staff, search]);

  const totals = useMemo(() => {
    const active = filtered.filter((item) => item.is_active).length;
    const publicCount = filtered.filter((item) => item.show_in_public_team).length;
    const bookable = filtered.filter((item) => item.is_bookable).length;
    return { active, publicCount, bookable };
  }, [filtered]);

  function closePanel() {
    setPanelOpen(false);
    setMode("create");
    setEditingId(null);
    setShowPassword(false);
    setFormError(null);
    setForm(emptyForm);
  }

  function openCreate() {
    setMode("create");
    setEditingId(null);
    setShowPassword(false);
    setFormError(null);
    setForm(emptyForm);
    setPanelOpen(true);
  }

  function openEdit(person: StaffUser) {
    setMode("edit");
    setEditingId(person.id);
    setShowPassword(false);
    setFormError(null);
    setForm(normalizeFormFromPerson(person));
    setPanelOpen(true);
  }

  function applyRolePreset(nextRole: StaffRoleForm) {
    const preset = rolePreset(nextRole);
    setForm((prev) => {
      const shouldAutoApplyManagerPreset = nextRole === "manager" && prev.role === "staff" && prev.show_in_public_team && prev.is_bookable;
      const shouldAutoApplyStaffPreset = nextRole === "staff" && prev.role === "manager" && !prev.show_in_public_team && !prev.is_bookable;

      return {
        ...prev,
        role: nextRole,
        show_in_public_team: shouldAutoApplyManagerPreset || shouldAutoApplyStaffPreset ? preset.show_in_public_team : prev.show_in_public_team,
        is_bookable: shouldAutoApplyManagerPreset || shouldAutoApplyStaffPreset ? preset.is_bookable : prev.is_bookable,
      };
    });
  }

  async function submit() {
    setFormError(null);

    if (!form.name.trim()) {
      setFormError("Նշիր աշխատակցի անունը։");
      return;
    }

    if (mode === "create") {
      if (!form.email.trim()) {
        setFormError("Նշիր email-ը։");
        return;
      }
      if (!form.password.trim()) {
        setFormError("Նշիր գաղտնաբառը։");
        return;
      }
    }

    try {
      if (mode === "create") {
        await createMut.mutateAsync({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          role: form.role,
          phone: form.phone.trim() || null,
          whatsapp_phone: form.whatsapp_phone.trim() || null,
          bio: form.bio.trim() || null,
          show_in_public_team: form.show_in_public_team,
          is_bookable: form.is_bookable,
        });
      } else if (editingId) {
        await updateMut.mutateAsync({
          id: editingId,
          payload: {
            name: form.name.trim(),
            role: form.role,
            phone: form.phone.trim() || null,
            whatsapp_phone: form.whatsapp_phone.trim() || null,
            bio: form.bio.trim() || null,
            show_in_public_team: form.show_in_public_team,
            is_bookable: form.is_bookable,
          },
        });
      }

      closePanel();
    } catch (error: any) {
      setFormError(error?.response?.data?.message || "Չհաջողվեց պահպանել փոփոխությունները։");
    }
  }

  const isSubmitting = createMut.isPending || updateMut.isPending;
  const currentPreset = rolePreset(form.role);
  const CurrentPresetIcon = currentPreset.icon;

  return (
    <motion.div {...page} className="space-y-6">
      <PageHero
        eyebrow={<><Sparkles className="h-4 w-4" /> Staff management</>}
        title="Աշխատակիցներ"
        description="Կառավարիր մասնագետներին, public ցուցադրումը և այն մարդկանց, որոնք իրականում ընդունում են booking-ներ։"
        actions={
          <Button onClick={openCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Նոր աշխատակից
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Ակտիվ անդամներ", value: totals.active, icon: Users, tone: "text-slate-700" },
          { label: "Public-ում երևում են", value: totals.publicCount, icon: Globe2, tone: "text-violet-700" },
          { label: "Booking ընդունում են", value: totals.bookable, icon: CalendarCheck2, tone: "text-emerald-700" },
        ].map((item) => (
          <motion.div key={item.label} variants={card} initial="initial" animate="animate" transition={cardTransition}>
            <Card className="rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm text-slate-500">{item.label}</div>
                  <div className="mt-2 text-3xl font-semibold text-slate-950">{item.value}</div>
                </div>
                <div className={cn("grid h-11 w-11 place-items-center rounded-2xl bg-slate-50", item.tone)}>
                  <item.icon className="h-5 w-5" />
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div variants={card} initial="initial" animate="animate" transition={cardTransition}>
        <Card className="rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-sm">
          <div className="flex flex-col gap-4 2xl:flex-row 2xl:items-center 2xl:justify-between">
            <div className="relative w-full max-w-md">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Փնտրել անունով, email-ով կամ հեռախոսով..."
                className="pl-11 pr-4"
              />
            </div>

            <div className="flex flex-wrap gap-2 text-xs text-slate-500">
              <div className="bb-stat-pill">Ընդամենը {filtered.length} անդամ</div>
              <div className="bb-stat-pill">{totals.publicCount} public</div>
              <div className="bb-stat-pill">{totals.bookable} bookable</div>
            </div>
          </div>
        </Card>
      </motion.div>

      {staffQ.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-[280px] animate-pulse rounded-[28px] border border-slate-200 bg-white/80" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
          {filtered.length === 0 ? (
            <div className="sm:col-span-2 2xl:col-span-3">
              <EmptyState
                icon={Users}
                title="Աշխատակիցներ չեն գտնվել"
                description={search ? "Փոխիր որոնումը կամ ավելացրու նոր անդամ։" : "Սկսելու համար ավելացրու առաջին մասնագետին կամ մենեջերին։"}
                action={!search ? (
                  <Button onClick={openCreate} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Ավելացնել աշխատակից
                  </Button>
                ) : undefined}
              />
            </div>
          ) : filtered.map((person) => {
            const role = roleUi(person.role);

            return (
              <motion.div key={person.id} variants={card} initial="initial" animate="animate" transition={cardTransition}>
                <Card className="rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-start gap-4">
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-[20px] bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white shadow-lg">
                        {person.avatar_url ? (
                          <img src={person.avatar_url} alt={person.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="grid h-full w-full place-items-center"><Users className="h-5 w-5" /></div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-lg font-semibold text-slate-950">{person.name}</h3>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <div className={cn("inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium", role.cls)}>
                            {role.icon}
                            {roleLabel(person.role)}
                          </div>
                          <div className={cn(
                            "inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium",
                            person.is_active ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-50 text-slate-600"
                          )}>
                            {person.is_active ? "Ակտիվ" : "Ապաակտիվ"}
                          </div>
                        </div>
                      </div>
                    </div>

                    <Button variant="secondary" size="sm" className="gap-2 rounded-2xl" onClick={() => openEdit(person)}>
                      <Pencil className="h-4 w-4" />
                      Խմբագրել
                    </Button>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <div className={cn("inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium", person.show_in_public_team ? "border-violet-200 bg-violet-50 text-violet-700" : "border-slate-200 bg-slate-50 text-slate-500")}>
                      <Globe2 className="mr-1 h-3.5 w-3.5" />
                      {person.show_in_public_team ? "Public-ում երևում է" : "Public-ում թաքնված է"}
                    </div>
                    <div className={cn("inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium", person.is_bookable ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-50 text-slate-500")}>
                      <CalendarCheck2 className="mr-1 h-3.5 w-3.5" />
                      {person.is_bookable ? "Booking ընդունում է" : "Booking չի ընդունում"}
                    </div>
                  </div>

                  <div className="mt-4 space-y-2 text-sm text-slate-500">
                    <div className="flex items-center gap-2 truncate">
                      <Mail className="h-4 w-4 shrink-0 text-slate-400" />
                      <span className="truncate">{person.email || "Email չկա"}</span>
                    </div>
                    <div className="flex items-center gap-2 truncate">
                      <Phone className="h-4 w-4 shrink-0 text-slate-400" />
                      <span className="truncate">{person.phone || "Phone չկա"}</span>
                    </div>
                    <div className="flex items-center gap-2 truncate">
                      <Phone className="h-4 w-4 shrink-0 text-emerald-500" />
                      <span className="truncate">{person.whatsapp_phone || "WhatsApp չկա"}</span>
                    </div>
                    {person.bio ? (
                      <div className="rounded-2xl border border-slate-100 bg-slate-50/80 px-3 py-2 text-xs leading-6 text-slate-600">{person.bio}</div>
                    ) : null}
                  </div>

                  <div className="mt-5 grid gap-3">
                    <label className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                      <span className="flex items-center gap-2"><Globe2 className="h-4 w-4 text-violet-500" /> Public բիզնեսի էջում ցույց տալ</span>
                      <input
                        type="checkbox"
                        checked={person.show_in_public_team}
                        onChange={(e) => updateMut.mutate({ id: person.id, payload: { show_in_public_team: e.target.checked, is_bookable: e.target.checked ? person.is_bookable : false } })}
                        className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                      />
                    </label>

                    <label className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                      <span className="flex items-center gap-2"><CalendarCheck2 className="h-4 w-4 text-emerald-500" /> Public booking-ում հասանելի</span>
                      <input
                        type="checkbox"
                        checked={person.is_bookable}
                        onChange={(e) => updateMut.mutate({ id: person.id, payload: { is_bookable: e.target.checked, show_in_public_team: e.target.checked ? true : person.show_in_public_team } })}
                        className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                      />
                    </label>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-violet-200 hover:bg-violet-50">
                      {updateMut.isPending ? <Spinner size={16} /> : <ImagePlus className="h-4 w-4" />}
                      Լուսանկար
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const url = await uploadMedia(file, "staff");
                          updateMut.mutate({ id: person.id, payload: { avatar_url: url } });
                          e.currentTarget.value = "";
                        }}
                      />
                    </label>

                    {person.is_active ? (
                      <Button
                        variant="secondary"
                        onClick={() => {
                          const ok = window.confirm(`Անակտիվացնե՞լ \"${person.name}\" աշխատակցին`);
                          if (ok) deactivateMut.mutate(person.id);
                        }}
                        className="w-full gap-2 rounded-2xl border border-amber-200 text-amber-700 hover:bg-amber-50"
                      >
                        <Ban className="h-4 w-4" />
                        Ապաակտիվացնել
                      </Button>
                    ) : (
                      <Button
                        variant="secondary"
                        onClick={() => activateMut.mutate(person.id)}
                        className="w-full gap-2 rounded-2xl border border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Ակտիվացնել
                      </Button>
                    )}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {panelOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/45 p-4 backdrop-blur-sm" onClick={closePanel}>
            <div className="flex min-h-full items-center justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 14 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 14 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-3xl rounded-[30px] border border-white/20 bg-white/95 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.22)] sm:p-8"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
                      {mode === "create" ? "Նոր աշխատակից" : "Խմբագրել աշխատակցին"}
                    </h2>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                      {mode === "create"
                        ? "Ստեղծիր մասնագետ կամ մենեջեր և անմիջապես որոշիր՝ public-ում երևալու՞ է և booking-ներ ընդունելու՞ է։"
                        : "Թարմացրու դերը, կոնտակտները, public visibility-ն և booking-ի կարգավիճակը մեկ տեղից։"}
                    </p>
                  </div>

                  <div className={cn("inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium", currentPreset.soft)}>
                    <CurrentPresetIcon className="h-4 w-4" />
                    {currentPreset.title}
                  </div>
                </div>

                <div className="mt-6 grid gap-4 2xl:grid-cols-[1.05fr_0.95fr]">
                  <div className="space-y-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      {(["staff", "manager"] as StaffRoleForm[]).map((role) => {
                        const preset = rolePreset(role);
                        const Icon = preset.icon;
                        const active = form.role === role;
                        return (
                          <button
                            key={role}
                            type="button"
                            onClick={() => applyRolePreset(role)}
                            className={cn(
                              "rounded-[24px] border px-4 py-4 text-left transition",
                              active ? "border-transparent bg-slate-950 text-white shadow-lg" : "border-slate-200 bg-white text-slate-700 hover:border-violet-200 hover:bg-violet-50"
                            )}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className={cn("grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br text-white", preset.accent)}>
                                <Icon className="h-4 w-4" />
                              </div>
                              {active ? <CheckCircle2 className="h-4 w-4" /> : null}
                            </div>
                            <div className="mt-3 text-sm font-semibold">{preset.title}</div>
                            <div className={cn("mt-2 text-xs leading-6", active ? "text-white/75" : "text-slate-500")}>{preset.description}</div>
                          </button>
                        );
                      })}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <label className="mb-2 block text-sm font-medium text-slate-700">Անուն</label>
                        <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
                      </div>

                      {mode === "create" ? (
                        <>
                          <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
                            <Input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
                          </div>
                          <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>
                            <div className="relative">
                              <Input
                                type={showPassword ? "text" : "password"}
                                value={form.password}
                                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                                className="pr-12"
                              />
                              <button type="button" onClick={() => setShowPassword((s) => !s)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-violet-700">
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            </div>
                          </div>
                        </>
                      ) : null}

                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">Phone</label>
                        <Input value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">WhatsApp</label>
                        <Input value={form.whatsapp_phone} onChange={(e) => setForm((p) => ({ ...p, whatsapp_phone: e.target.value }))} />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="mb-2 block text-sm font-medium text-slate-700">Bio</label>
                        <textarea
                          value={form.bio}
                          onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
                          rows={4}
                          className="w-full rounded-[22px] border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
                          placeholder="Կարճ ներկայացում՝ մասնագիտացում, փորձ, հաճախորդի համար կարևոր նշումներ..."
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-[26px] border border-slate-200 bg-slate-50/80 p-5">
                      <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                        <Info className="h-4 w-4 text-violet-500" />
                        Public & booking կարգավորումներ
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        Մասնագետը կարող է public թիմում երևալ առանց booking ընդունելու, բայց booking ընդունելու դեպքում ավտոմատ public-ում էլ երևում է։
                      </p>

                      <div className="mt-4 grid gap-3">
                        <label className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                          <span className="flex items-center gap-2"><Globe2 className="h-4 w-4 text-violet-500" /> Public բիզնեսի էջում ցույց տալ</span>
                          <input
                            type="checkbox"
                            checked={form.show_in_public_team}
                            onChange={(e) => setForm((p) => ({ ...p, show_in_public_team: e.target.checked, is_bookable: e.target.checked ? p.is_bookable : false }))}
                            className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                          />
                        </label>

                        <label className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                          <span className="flex items-center gap-2"><CalendarCheck2 className="h-4 w-4 text-emerald-500" /> Public booking-ում հասանելի</span>
                          <input
                            type="checkbox"
                            checked={form.is_bookable}
                            onChange={(e) => setForm((p) => ({ ...p, is_bookable: e.target.checked, show_in_public_team: e.target.checked ? true : p.show_in_public_team }))}
                            className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                          />
                        </label>
                      </div>
                    </div>

                    <div className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm">
                      <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                        <Star className="h-4 w-4 text-amber-500" />
                        Ինչպես կերևա համակարգում
                      </div>
                      <div className="mt-4 rounded-[22px] border border-slate-100 bg-slate-50/80 p-4">
                        <div className="text-base font-semibold text-slate-900">{form.name || "Անունը դեռ նշված չէ"}</div>
                        <div className="mt-1 text-sm text-slate-500">{currentPreset.title}</div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className={cn("inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium", form.show_in_public_team ? "border-violet-200 bg-violet-50 text-violet-700" : "border-slate-200 bg-slate-50 text-slate-500")}>
                            <Globe2 className="h-3.5 w-3.5" /> {form.show_in_public_team ? "Public-ում երևում է" : "Public-ում թաքնված է"}
                          </span>
                          <span className={cn("inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium", form.is_bookable ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-50 text-slate-500")}>
                            <CalendarCheck2 className="h-3.5 w-3.5" /> {form.is_bookable ? "Booking ընդունում է" : "Booking չի ընդունում"}
                          </span>
                        </div>
                        {form.bio ? <div className="mt-3 text-sm leading-6 text-slate-500">{form.bio}</div> : null}
                      </div>
                    </div>
                  </div>
                </div>

                {formError ? (
                  <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{formError}</div>
                ) : null}

                <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end">
                  <Button variant="secondary" onClick={closePanel} className="rounded-2xl">Փակել</Button>
                  <Button onClick={submit} disabled={isSubmitting} className="rounded-2xl">
                    {isSubmitting ? <Spinner size={16} /> : mode === "create" ? "Ստեղծել" : "Պահպանել"}
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
