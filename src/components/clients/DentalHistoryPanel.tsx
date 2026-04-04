import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, ClipboardList, Pencil, Plus, Save, ShieldAlert, Stethoscope, Trash2 } from "lucide-react";

import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Modal } from "../ui/Modal";
import { cn } from "../../lib/cn";
import {
  createDentalTreatment,
  deleteDentalTooth,
  deleteDentalTreatment,
  type ClientDetails,
  type DentalProfilePayload,
  type DentalToothPayload,
  type DentalToothRecord,
  type DentalTreatmentPayload,
  type DentalTreatmentRecord,
  updateDentalTreatment,
  upsertDentalProfile,
  upsertDentalTooth,
} from "../../lib/clientsApi";

type Props = {
  client: ClientDetails;
  clientId: number;
  canManage: boolean;
  formatDateTime: (value?: string | null) => string;
  formatMoney: (value?: number | null) => string;
};

type ProfileFormState = {
  chief_complaint: string;
  dental_history: string;
  current_medications: string;
  treatment_alerts: string;
  insurance_provider: string;
  insurance_number: string;
  preferred_doctor: string;
  pain_level: string;
  oral_hygiene_status: "" | "good" | "fair" | "poor";
  periodontal_risk: "" | "low" | "medium" | "high";
  last_xray_at: string;
  next_follow_up_at: string;
};

type TreatmentFormState = {
  procedure_name: string;
  procedure_code: string;
  diagnosis: string;
  visit_date: string;
  treated_teeth: string;
  surfaces: string;
  notes: string;
  recommendation: string;
  treatment_status: "planned" | "in_progress" | "completed" | "cancelled";
  priority: "routine" | "urgent" | "emergency";
  cost: string;
  follow_up_at: string;
};

type ToothFormState = {
  status: "healthy" | "attention" | "planned" | "treated" | "monitoring" | "missing";
  condition_label: string;
  surface_summary: string;
  notes: string;
  recommendation: string;
  priority: "routine" | "urgent" | "emergency";
  last_treated_at: string;
  next_action_due_at: string;
};

const emptyTreatmentForm: TreatmentFormState = {
  procedure_name: "",
  procedure_code: "",
  diagnosis: "",
  visit_date: "",
  treated_teeth: "",
  surfaces: "",
  notes: "",
  recommendation: "",
  treatment_status: "completed",
  priority: "routine",
  cost: "",
  follow_up_at: "",
};

const emptyToothForm: ToothFormState = {
  status: "healthy",
  condition_label: "",
  surface_summary: "",
  notes: "",
  recommendation: "",
  priority: "routine",
  last_treated_at: "",
  next_action_due_at: "",
};

const TOOTH_ARCHES = {
  upperRight: ["18", "17", "16", "15", "14", "13", "12", "11"],
  upperLeft: ["21", "22", "23", "24", "25", "26", "27", "28"],
  lowerRight: ["48", "47", "46", "45", "44", "43", "42", "41"],
  lowerLeft: ["31", "32", "33", "34", "35", "36", "37", "38"],
} as const;

const ALL_TEETH = [
  ...TOOTH_ARCHES.upperRight,
  ...TOOTH_ARCHES.upperLeft,
  ...TOOTH_ARCHES.lowerRight,
  ...TOOTH_ARCHES.lowerLeft,
];
const ALL_TEETH_SET = new Set<string>(ALL_TEETH);

function toDateTimeLocal(value?: string | null) {
  if (!value) return "";
  const normalized = String(value).replace(" ", "T");
  const d = new Date(normalized);
  if (!Number.isNaN(d.getTime())) {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }
  return normalized.slice(0, 16);
}

function normalizeDateTime(value: string) {
  return value ? value : null;
}

function splitCsv(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function toothTone(status?: DentalToothRecord["status"] | ToothFormState["status"] | null) {
  switch (status) {
    case "treated":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "attention":
      return "border-rose-200 bg-rose-50 text-rose-700";
    case "planned":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "monitoring":
      return "border-violet-200 bg-violet-50 text-violet-700";
    case "missing":
      return "border-slate-300 bg-slate-100 text-slate-500";
    case "healthy":
    default:
      return "border-slate-200 bg-white text-slate-700";
  }
}

function toothStatusLabel(status?: string | null) {
  switch (status) {
    case "treated":
      return "Treated";
    case "attention":
      return "Needs attention";
    case "planned":
      return "Planned";
    case "monitoring":
      return "Monitoring";
    case "missing":
      return "Missing";
    case "healthy":
    default:
      return "Healthy";
  }
}

function mapProfileFromClient(client: ClientDetails): ProfileFormState {
  const profile = client.dental_profile;
  return {
    chief_complaint: profile?.chief_complaint ?? "",
    dental_history: profile?.dental_history ?? "",
    current_medications: profile?.current_medications ?? "",
    treatment_alerts: profile?.treatment_alerts ?? "",
    insurance_provider: profile?.insurance_provider ?? "",
    insurance_number: profile?.insurance_number ?? "",
    preferred_doctor: profile?.preferred_doctor ?? "",
    pain_level: profile?.pain_level !== null && profile?.pain_level !== undefined ? String(profile.pain_level) : "",
    oral_hygiene_status: (profile?.oral_hygiene_status as ProfileFormState["oral_hygiene_status"]) ?? "",
    periodontal_risk: (profile?.periodontal_risk as ProfileFormState["periodontal_risk"]) ?? "",
    last_xray_at: toDateTimeLocal(profile?.last_xray_at),
    next_follow_up_at: toDateTimeLocal(profile?.next_follow_up_at),
  };
}

function mapTreatmentToForm(record?: DentalTreatmentRecord | null): TreatmentFormState {
  if (!record) return { ...emptyTreatmentForm };
  return {
    procedure_name: record.procedure_name ?? "",
    procedure_code: record.procedure_code ?? "",
    diagnosis: record.diagnosis ?? "",
    visit_date: toDateTimeLocal(record.visit_date),
    treated_teeth: (record.treated_teeth ?? []).join(", "),
    surfaces: (record.surfaces ?? []).join(", "),
    notes: record.notes ?? "",
    recommendation: record.recommendation ?? "",
    treatment_status: record.treatment_status ?? "completed",
    priority: record.priority ?? "routine",
    cost: record.cost !== null && record.cost !== undefined ? String(record.cost) : "",
    follow_up_at: toDateTimeLocal(record.follow_up_at),
  };
}

function mapToothToForm(record?: DentalToothRecord | null): ToothFormState {
  if (!record) return { ...emptyToothForm };
  return {
    status: (record.status as ToothFormState["status"]) ?? "healthy",
    condition_label: record.condition_label ?? "",
    surface_summary: (record.surface_summary ?? []).join(", "),
    notes: record.notes ?? "",
    recommendation: record.recommendation ?? "",
    priority: record.priority ?? "routine",
    last_treated_at: toDateTimeLocal(record.last_treated_at),
    next_action_due_at: toDateTimeLocal(record.next_action_due_at),
  };
}

function formatToothHistoryTitle(record: DentalTreatmentRecord) {
  return record.procedure_name || record.procedure_code || record.diagnosis || "Visit entry";
}

export function DentalHistoryPanel({ client, clientId, canManage, formatDateTime, formatMoney }: Props) {
  const qc = useQueryClient();
  const [profileForm, setProfileForm] = useState<ProfileFormState>(() => mapProfileFromClient(client));
  const [treatmentModalOpen, setTreatmentModalOpen] = useState(false);
  const [editingTreatment, setEditingTreatment] = useState<DentalTreatmentRecord | null>(null);
  const [treatmentForm, setTreatmentForm] = useState<TreatmentFormState>({ ...emptyTreatmentForm });
  const [selectedTooth, setSelectedTooth] = useState<string>(client.dental_chart?.[0]?.tooth_number ?? "11");
  const [toothForm, setToothForm] = useState<ToothFormState>({ ...emptyToothForm });

  useEffect(() => {
    setProfileForm(mapProfileFromClient(client));
  }, [client]);

  useEffect(() => {
    const preferredTooth = client.dental_chart?.find((record) => ALL_TEETH_SET.has(record.tooth_number))?.tooth_number ?? "11";
    setSelectedTooth((prev) => (ALL_TEETH_SET.has(prev) ? prev : preferredTooth));
  }, [client.dental_chart]);

  const treatmentRecords = client.dental_treatments ?? [];
  const dentalStats = client.crm?.dental;
  const chartRecords = client.dental_chart ?? [];

  const chartMap = useMemo(() => new Map(chartRecords.map((record) => [record.tooth_number, record])), [chartRecords]);
  const toothTreatmentCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const record of treatmentRecords) {
      for (const tooth of record.treated_teeth ?? []) {
        map.set(tooth, (map.get(tooth) ?? 0) + 1);
      }
    }
    return map;
  }, [treatmentRecords]);

  const selectedToothRecord = chartMap.get(selectedTooth) ?? null;
  const selectedToothHistory = useMemo(
    () => treatmentRecords.filter((record) => (record.treated_teeth ?? []).includes(selectedTooth)),
    [treatmentRecords, selectedTooth]
  );

  useEffect(() => {
    setToothForm(mapToothToForm(selectedToothRecord));
  }, [selectedToothRecord, selectedTooth]);

  const saveProfileMut = useMutation({
    mutationFn: (payload: DentalProfilePayload) => upsertDentalProfile(clientId, payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["client", clientId] });
    },
  });

  const createTreatmentMut = useMutation({
    mutationFn: (payload: DentalTreatmentPayload) => createDentalTreatment(clientId, payload),
    onSuccess: async () => {
      setTreatmentModalOpen(false);
      setEditingTreatment(null);
      setTreatmentForm({ ...emptyTreatmentForm });
      await qc.invalidateQueries({ queryKey: ["client", clientId] });
    },
  });

  const updateTreatmentMut = useMutation({
    mutationFn: ({ recordId, payload }: { recordId: number; payload: Partial<DentalTreatmentPayload> }) => updateDentalTreatment(clientId, recordId, payload),
    onSuccess: async () => {
      setTreatmentModalOpen(false);
      setEditingTreatment(null);
      setTreatmentForm({ ...emptyTreatmentForm });
      await qc.invalidateQueries({ queryKey: ["client", clientId] });
    },
  });

  const deleteTreatmentMut = useMutation({
    mutationFn: (recordId: number) => deleteDentalTreatment(clientId, recordId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["client", clientId] });
    },
  });

  const saveToothMut = useMutation({
    mutationFn: ({ toothNumber, payload }: { toothNumber: string; payload: DentalToothPayload }) => upsertDentalTooth(clientId, toothNumber, payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["client", clientId] });
    },
  });

  const deleteToothMut = useMutation({
    mutationFn: (recordId: number) => deleteDentalTooth(clientId, recordId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["client", clientId] });
    },
  });

  const openCreateTreatment = (prefillTooth?: string) => {
    setEditingTreatment(null);
    setTreatmentForm({
      ...emptyTreatmentForm,
      treated_teeth: prefillTooth ?? "",
    });
    setTreatmentModalOpen(true);
  };

  const openEditTreatment = (record: DentalTreatmentRecord) => {
    setEditingTreatment(record);
    setTreatmentForm(mapTreatmentToForm(record));
    setTreatmentModalOpen(true);
  };

  const submitProfile = () => {
    const payload: DentalProfilePayload = {
      chief_complaint: profileForm.chief_complaint.trim() || null,
      dental_history: profileForm.dental_history.trim() || null,
      current_medications: profileForm.current_medications.trim() || null,
      treatment_alerts: profileForm.treatment_alerts.trim() || null,
      insurance_provider: profileForm.insurance_provider.trim() || null,
      insurance_number: profileForm.insurance_number.trim() || null,
      preferred_doctor: profileForm.preferred_doctor.trim() || null,
      pain_level: profileForm.pain_level === "" ? null : Number(profileForm.pain_level),
      oral_hygiene_status: profileForm.oral_hygiene_status || null,
      periodontal_risk: profileForm.periodontal_risk || null,
      last_xray_at: normalizeDateTime(profileForm.last_xray_at),
      next_follow_up_at: normalizeDateTime(profileForm.next_follow_up_at),
    };

    saveProfileMut.mutate(payload);
  };

  const submitTreatment = () => {
    if (!treatmentForm.procedure_name.trim()) return;

    const payload: DentalTreatmentPayload = {
      procedure_name: treatmentForm.procedure_name.trim(),
      procedure_code: treatmentForm.procedure_code.trim() || null,
      diagnosis: treatmentForm.diagnosis.trim() || null,
      visit_date: normalizeDateTime(treatmentForm.visit_date),
      treated_teeth: splitCsv(treatmentForm.treated_teeth),
      surfaces: splitCsv(treatmentForm.surfaces),
      notes: treatmentForm.notes.trim() || null,
      recommendation: treatmentForm.recommendation.trim() || null,
      treatment_status: treatmentForm.treatment_status,
      priority: treatmentForm.priority,
      cost: treatmentForm.cost.trim() ? Number(treatmentForm.cost) : null,
      follow_up_at: normalizeDateTime(treatmentForm.follow_up_at),
    };

    if (editingTreatment) {
      updateTreatmentMut.mutate({ recordId: editingTreatment.id, payload });
    } else {
      createTreatmentMut.mutate(payload);
    }
  };

  const submitToothRecord = () => {
    const payload: DentalToothPayload = {
      status: toothForm.status,
      condition_label: toothForm.condition_label.trim() || null,
      surface_summary: splitCsv(toothForm.surface_summary),
      notes: toothForm.notes.trim() || null,
      recommendation: toothForm.recommendation.trim() || null,
      priority: toothForm.priority,
      last_treated_at: normalizeDateTime(toothForm.last_treated_at),
      next_action_due_at: normalizeDateTime(toothForm.next_action_due_at),
    };

    saveToothMut.mutate({ toothNumber: selectedTooth, payload });
  };

  return (
    <div className="mt-4 space-y-4">
      <div className="rounded-[28px] border border-sky-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="text-sm font-semibold text-slate-950">Dental history center</div>
            <div className="mt-1 text-sm leading-6 text-slate-500">
              Այստեղ պահում ենք patient intake-ը, structured treatment history-ն և արդեն նաև per-tooth chart-ը, որպեսզի history-ն չմնա պարզապես note-երի մեջ։
            </div>
          </div>
          <span
            className={cn(
              "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
              dentalStats?.chart_status === "ready" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
            )}
          >
            {dentalStats?.chart_status === "ready" ? "Dental data ready" : "Dental data incomplete"}
          </span>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="text-[11px] uppercase tracking-wide text-slate-400">Emergency այցեր</div>
            <div className="mt-1 text-xl font-semibold text-slate-950">{dentalStats?.emergency_visits_count ?? 0}</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="text-[11px] uppercase tracking-wide text-slate-400">Treatment records</div>
            <div className="mt-1 text-xl font-semibold text-slate-950">{dentalStats?.treatment_records_count ?? treatmentRecords.length}</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="text-[11px] uppercase tracking-wide text-slate-400">Profile completion</div>
            <div className="mt-1 text-xl font-semibold text-slate-950">{Math.min((dentalStats?.profile_completion_score ?? 0) * 10, 100)}%</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="text-[11px] uppercase tracking-wide text-slate-400">Վերջին diagnosis</div>
            <div className="mt-1 text-sm font-semibold leading-6 text-slate-900">{dentalStats?.last_diagnosis || "—"}</div>
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 md:col-span-2">
            <div className="text-[11px] uppercase tracking-wide text-slate-400">Վերջին clinical note</div>
            <div className="mt-1 text-sm font-medium leading-6 text-slate-900">{dentalStats?.last_clinical_note || "Դեռ clinical note չի գրանցվել։"}</div>
            {dentalStats?.last_clinical_note_at ? <div className="mt-2 text-xs text-slate-500">Վերջին թարմացում՝ {formatDateTime(dentalStats.last_clinical_note_at)}</div> : null}
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="text-[11px] uppercase tracking-wide text-slate-400">Վերջին visit</div>
            <div className="mt-1 text-sm font-semibold text-slate-900">{formatDateTime(dentalStats?.last_visit_date)}</div>
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="text-[11px] uppercase tracking-wide text-slate-400">Charted teeth</div>
            <div className="mt-1 text-xl font-semibold text-slate-950">{dentalStats?.charted_teeth_count ?? chartRecords.length}</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="text-[11px] uppercase tracking-wide text-slate-400">Need attention</div>
            <div className="mt-1 text-xl font-semibold text-slate-950">{dentalStats?.attention_teeth_count ?? chartRecords.filter((item) => ["attention", "planned", "monitoring"].includes(item.status ?? "")).length}</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="text-[11px] uppercase tracking-wide text-slate-400">Chart updated</div>
            <div className="mt-1 text-sm font-semibold text-slate-900">{formatDateTime(dentalStats?.last_chart_update_at)}</div>
          </div>
        </div>

        <div className="mt-4">
          <div className="text-[11px] uppercase tracking-wide text-slate-400">Treatment / ADA codes</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {(dentalStats?.recent_treatment_codes ?? []).length ? (
              (dentalStats?.recent_treatment_codes ?? []).map((code) => (
                <span key={code} className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">{code}</span>
              ))
            ) : (
              <span className="text-sm text-slate-500">Դեռ treatment code-եր չկան։</span>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
              <Stethoscope className="h-4 w-4 text-sky-600" /> Tooth chart / odontogram base
            </div>
            <div className="mt-1 text-sm leading-6 text-slate-500">
              Սեղմի՛ր ատամի վրա, տես state-ը, նշումները ու հենց այդ tooth-ի treatment history-ն։ Սա արդեն per-tooth clinical history-ի usable հիմքն է։
            </div>
          </div>
          {canManage ? (
            <Button size="sm" onClick={() => openCreateTreatment(selectedTooth)}>
              <Plus className="mr-2 h-4 w-4" /> Add treatment for tooth {selectedTooth}
            </Button>
          ) : null}
        </div>

        <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.9fr)]">
          <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
            <div className="overflow-x-auto pb-2">
              <div className="min-w-[680px] space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-white bg-white/80 p-3">
                    <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Upper right</div>
                    <div className="grid grid-cols-8 gap-2">
                      {TOOTH_ARCHES.upperRight.map((tooth) => {
                        const record = chartMap.get(tooth);
                        const isSelected = selectedTooth === tooth;
                        const count = toothTreatmentCounts.get(tooth) ?? 0;
                        return (
                          <button
                            key={tooth}
                            type="button"
                            onClick={() => setSelectedTooth(tooth)}
                            className={cn(
                              "rounded-2xl border px-2 py-3 text-center text-sm font-semibold transition",
                              toothTone(record?.status),
                              isSelected && "ring-2 ring-slate-900/10"
                            )}
                          >
                            <div>{tooth}</div>
                            <div className="mt-1 text-[10px] font-medium opacity-70">{count ? `${count} visits` : toothStatusLabel(record?.status).split(" ")[0]}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white bg-white/80 p-3">
                    <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Upper left</div>
                    <div className="grid grid-cols-8 gap-2">
                      {TOOTH_ARCHES.upperLeft.map((tooth) => {
                        const record = chartMap.get(tooth);
                        const isSelected = selectedTooth === tooth;
                        const count = toothTreatmentCounts.get(tooth) ?? 0;
                        return (
                          <button
                            key={tooth}
                            type="button"
                            onClick={() => setSelectedTooth(tooth)}
                            className={cn(
                              "rounded-2xl border px-2 py-3 text-center text-sm font-semibold transition",
                              toothTone(record?.status),
                              isSelected && "ring-2 ring-slate-900/10"
                            )}
                          >
                            <div>{tooth}</div>
                            <div className="mt-1 text-[10px] font-medium opacity-70">{count ? `${count} visits` : toothStatusLabel(record?.status).split(" ")[0]}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white bg-white/80 p-3">
                    <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Lower right</div>
                    <div className="grid grid-cols-8 gap-2">
                      {TOOTH_ARCHES.lowerRight.map((tooth) => {
                        const record = chartMap.get(tooth);
                        const isSelected = selectedTooth === tooth;
                        const count = toothTreatmentCounts.get(tooth) ?? 0;
                        return (
                          <button
                            key={tooth}
                            type="button"
                            onClick={() => setSelectedTooth(tooth)}
                            className={cn(
                              "rounded-2xl border px-2 py-3 text-center text-sm font-semibold transition",
                              toothTone(record?.status),
                              isSelected && "ring-2 ring-slate-900/10"
                            )}
                          >
                            <div>{tooth}</div>
                            <div className="mt-1 text-[10px] font-medium opacity-70">{count ? `${count} visits` : toothStatusLabel(record?.status).split(" ")[0]}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white bg-white/80 p-3">
                    <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Lower left</div>
                    <div className="grid grid-cols-8 gap-2">
                      {TOOTH_ARCHES.lowerLeft.map((tooth) => {
                        const record = chartMap.get(tooth);
                        const isSelected = selectedTooth === tooth;
                        const count = toothTreatmentCounts.get(tooth) ?? 0;
                        return (
                          <button
                            key={tooth}
                            type="button"
                            onClick={() => setSelectedTooth(tooth)}
                            className={cn(
                              "rounded-2xl border px-2 py-3 text-center text-sm font-semibold transition",
                              toothTone(record?.status),
                              isSelected && "ring-2 ring-slate-900/10"
                            )}
                          >
                            <div>{tooth}</div>
                            <div className="mt-1 text-[10px] font-medium opacity-70">{count ? `${count} visits` : toothStatusLabel(record?.status).split(" ")[0]}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              {[
                ["healthy", "Healthy"],
                ["attention", "Needs attention"],
                ["planned", "Planned"],
                ["treated", "Treated"],
                ["monitoring", "Monitoring"],
                ["missing", "Missing"],
              ].map(([value, label]) => (
                <span key={value} className={cn("rounded-full border px-3 py-1 font-semibold", toothTone(value as ToothFormState["status"]))}>
                  {label}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="text-sm font-semibold text-slate-950">Selected tooth #{selectedTooth}</div>
                <div className="mt-1 flex flex-wrap gap-2">
                  <span className={cn("rounded-full border px-3 py-1 text-xs font-semibold", toothTone(selectedToothRecord?.status ?? toothForm.status))}>
                    {toothStatusLabel(selectedToothRecord?.status ?? toothForm.status)}
                  </span>
                  {selectedToothRecord?.priority ? <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">{selectedToothRecord.priority}</span> : null}
                </div>
              </div>
              <div className="text-right text-xs text-slate-500">
                <div>{selectedToothHistory.length} related treatment record</div>
                <div className="mt-1">Last update: {formatDateTime(selectedToothRecord?.updated_at)}</div>
              </div>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="text-sm text-slate-600">
                Status
                <select
                  disabled={!canManage}
                  value={toothForm.status}
                  onChange={(e) => setToothForm((prev) => ({ ...prev, status: e.target.value as ToothFormState["status"] }))}
                  className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
                >
                  <option value="healthy">Healthy</option>
                  <option value="attention">Needs attention</option>
                  <option value="planned">Planned</option>
                  <option value="treated">Treated</option>
                  <option value="monitoring">Monitoring</option>
                  <option value="missing">Missing</option>
                </select>
              </label>
              <label className="text-sm text-slate-600">
                Priority
                <select
                  disabled={!canManage}
                  value={toothForm.priority}
                  onChange={(e) => setToothForm((prev) => ({ ...prev, priority: e.target.value as ToothFormState["priority"] }))}
                  className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
                >
                  <option value="routine">Routine</option>
                  <option value="urgent">Urgent</option>
                  <option value="emergency">Emergency</option>
                </select>
              </label>
              <label className="text-sm text-slate-600 md:col-span-2">
                Condition / label
                <Input
                  className="mt-1"
                  disabled={!canManage}
                  value={toothForm.condition_label}
                  onChange={(e) => setToothForm((prev) => ({ ...prev, condition_label: e.target.value }))}
                  placeholder="Secondary caries, crown issue, implant planning..."
                />
              </label>
              <label className="text-sm text-slate-600 md:col-span-2">
                Surface summary
                <Input
                  className="mt-1"
                  disabled={!canManage}
                  value={toothForm.surface_summary}
                  onChange={(e) => setToothForm((prev) => ({ ...prev, surface_summary: e.target.value }))}
                  placeholder="MO, DO, Buccal"
                />
              </label>
              <label className="text-sm text-slate-600">
                Last treated
                <input
                  type="datetime-local"
                  disabled={!canManage}
                  value={toothForm.last_treated_at}
                  onChange={(e) => setToothForm((prev) => ({ ...prev, last_treated_at: e.target.value }))}
                  className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
                />
              </label>
              <label className="text-sm text-slate-600">
                Next action due
                <input
                  type="datetime-local"
                  disabled={!canManage}
                  value={toothForm.next_action_due_at}
                  onChange={(e) => setToothForm((prev) => ({ ...prev, next_action_due_at: e.target.value }))}
                  className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
                />
              </label>
            </div>

            <label className="mt-4 block text-sm text-slate-600">
              Tooth notes
              <textarea
                value={toothForm.notes}
                disabled={!canManage}
                onChange={(e) => setToothForm((prev) => ({ ...prev, notes: e.target.value }))}
                rows={4}
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
                placeholder="Clinical observation հենց այս ատամի համար..."
              />
            </label>

            <label className="mt-4 block text-sm text-slate-600">
              Recommendation
              <textarea
                value={toothForm.recommendation}
                disabled={!canManage}
                onChange={(e) => setToothForm((prev) => ({ ...prev, recommendation: e.target.value }))}
                rows={3}
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
                placeholder="Recall, crown consult, endo follow-up..."
              />
            </label>

            {canManage ? (
              <div className="mt-4 flex flex-wrap gap-2">
                <Button size="sm" onClick={submitToothRecord} loading={saveToothMut.isPending}>
                  <Save className="mr-2 h-4 w-4" /> Save tooth record
                </Button>
                {selectedToothRecord ? (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => deleteToothMut.mutate(selectedToothRecord.id)}
                    loading={deleteToothMut.isPending}
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Clear tooth record
                  </Button>
                ) : null}
              </div>
            ) : null}

            <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
                <ClipboardList className="h-4 w-4 text-violet-600" /> Tooth {selectedTooth} history
              </div>
              <div className="mt-3 space-y-3">
                {selectedToothHistory.length ? (
                  selectedToothHistory.map((record) => (
                    <div key={record.id} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="font-semibold text-slate-900">{formatToothHistoryTitle(record)}</div>
                          <div className="mt-1 text-xs text-slate-500">{formatDateTime(record.visit_date)}</div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {record.treatment_status ? <span className="rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-semibold text-violet-700">{record.treatment_status}</span> : null}
                          {record.priority ? <span className="rounded-full bg-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-700">{record.priority}</span> : null}
                        </div>
                      </div>
                      {record.diagnosis ? <div className="mt-2 text-sm text-slate-700"><span className="font-medium text-slate-900">Diagnosis:</span> {record.diagnosis}</div> : null}
                      {record.notes ? <div className="mt-2 text-sm leading-6 text-slate-600">{record.notes}</div> : null}
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-5 text-sm text-slate-500">Այս ատամի համար դեռ treatment history չկա։</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
            <Stethoscope className="h-4 w-4 text-sky-600" /> Patient dental profile
          </div>
          {canManage ? <Button size="sm" onClick={submitProfile} loading={saveProfileMut.isPending}><Save className="mr-2 h-4 w-4" /> Պահպանել profile-ը</Button> : null}
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <label className="text-sm text-slate-600">
            Chief complaint
            <textarea value={profileForm.chief_complaint} disabled={!canManage} onChange={(e) => setProfileForm((p) => ({ ...p, chief_complaint: e.target.value }))} rows={3} className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm" placeholder="Հիմնական բողոք / reason for visit" />
          </label>
          <label className="text-sm text-slate-600">
            Dental history
            <textarea value={profileForm.dental_history} disabled={!canManage} onChange={(e) => setProfileForm((p) => ({ ...p, dental_history: e.target.value }))} rows={3} className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm" placeholder="Նախկին բուժումներ, implant, surgery, orthodontics..." />
          </label>
          <label className="text-sm text-slate-600">
            Current medications
            <textarea value={profileForm.current_medications} disabled={!canManage} onChange={(e) => setProfileForm((p) => ({ ...p, current_medications: e.target.value }))} rows={3} className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm" placeholder="Ընթացիկ դեղեր" />
          </label>
          <label className="text-sm text-slate-600">
            Treatment alerts
            <textarea value={profileForm.treatment_alerts} disabled={!canManage} onChange={(e) => setProfileForm((p) => ({ ...p, treatment_alerts: e.target.value }))} rows={3} className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm" placeholder="Լատեքս, anesthesia sensitivity, anticoagulants..." />
          </label>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <label className="text-sm text-slate-600">
            Insurance provider
            <Input className="mt-1" disabled={!canManage} value={profileForm.insurance_provider} onChange={(e) => setProfileForm((p) => ({ ...p, insurance_provider: e.target.value }))} placeholder="Ապահովագրական ընկերություն" />
          </label>
          <label className="text-sm text-slate-600">
            Insurance number
            <Input className="mt-1" disabled={!canManage} value={profileForm.insurance_number} onChange={(e) => setProfileForm((p) => ({ ...p, insurance_number: e.target.value }))} placeholder="Քարտ/պոլիս" />
          </label>
          <label className="text-sm text-slate-600">
            Preferred doctor
            <Input className="mt-1" disabled={!canManage} value={profileForm.preferred_doctor} onChange={(e) => setProfileForm((p) => ({ ...p, preferred_doctor: e.target.value }))} placeholder="Բժիշկ" />
          </label>
          <label className="text-sm text-slate-600">
            Pain level (0-10)
            <Input className="mt-1" type="number" min={0} max={10} disabled={!canManage} value={profileForm.pain_level} onChange={(e) => setProfileForm((p) => ({ ...p, pain_level: e.target.value }))} placeholder="0" />
          </label>
          <label className="text-sm text-slate-600">
            Oral hygiene status
            <select disabled={!canManage} value={profileForm.oral_hygiene_status} onChange={(e) => setProfileForm((p) => ({ ...p, oral_hygiene_status: e.target.value as ProfileFormState["oral_hygiene_status"] }))} className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm">
              <option value="">Ընտրել</option>
              <option value="good">Լավ</option>
              <option value="fair">Միջին</option>
              <option value="poor">Թույլ</option>
            </select>
          </label>
          <label className="text-sm text-slate-600">
            Periodontal risk
            <select disabled={!canManage} value={profileForm.periodontal_risk} onChange={(e) => setProfileForm((p) => ({ ...p, periodontal_risk: e.target.value as ProfileFormState["periodontal_risk"] }))} className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm">
              <option value="">Ընտրել</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>
          <label className="text-sm text-slate-600">
            Last X-ray
            <input type="datetime-local" disabled={!canManage} value={profileForm.last_xray_at} onChange={(e) => setProfileForm((p) => ({ ...p, last_xray_at: e.target.value }))} className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm" />
          </label>
          <label className="text-sm text-slate-600">
            Next follow-up
            <input type="datetime-local" disabled={!canManage} value={profileForm.next_follow_up_at} onChange={(e) => setProfileForm((p) => ({ ...p, next_follow_up_at: e.target.value }))} className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm" />
          </label>
        </div>
      </div>

      <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
            <ClipboardList className="h-4 w-4 text-violet-600" /> Treatment history timeline
          </div>
          {canManage ? <Button size="sm" onClick={() => openCreateTreatment()}><Plus className="mr-2 h-4 w-4" /> Ավելացնել treatment record</Button> : null}
        </div>

        <div className="mt-4 space-y-3">
          {treatmentRecords.length ? treatmentRecords.map((record) => (
            <div key={record.id} className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="font-semibold text-slate-950">{record.procedure_name}</div>
                    {record.procedure_code ? <span className="rounded-full bg-sky-50 px-2.5 py-1 text-[11px] font-semibold text-sky-700">{record.procedure_code}</span> : null}
                    {record.priority ? <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-semibold", record.priority === "emergency" ? "bg-rose-50 text-rose-700" : record.priority === "urgent" ? "bg-amber-50 text-amber-700" : "bg-slate-200 text-slate-700")}>{record.priority}</span> : null}
                    {record.treatment_status ? <span className="rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-semibold text-violet-700">{record.treatment_status}</span> : null}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">{formatDateTime(record.visit_date)} {record.follow_up_at ? `· Follow-up ${formatDateTime(record.follow_up_at)}` : ""}</div>
                </div>
                {canManage ? (
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => openEditTreatment(record)} className="rounded-full border border-slate-200 bg-white p-2 text-slate-500 transition hover:border-violet-200 hover:text-violet-700"><Pencil className="h-4 w-4" /></button>
                    <button type="button" onClick={() => deleteTreatmentMut.mutate(record.id)} className="rounded-full border border-slate-200 bg-white p-2 text-slate-500 transition hover:border-rose-200 hover:text-rose-700"><Trash2 className="h-4 w-4" /></button>
                  </div>
                ) : null}
              </div>

              <div className="mt-3 grid gap-3 lg:grid-cols-2">
                <div className="rounded-2xl border border-white bg-white/80 px-4 py-3">
                  <div className="text-[11px] uppercase tracking-wide text-slate-400">Diagnosis</div>
                  <div className="mt-1 text-sm font-medium leading-6 text-slate-900">{record.diagnosis || "—"}</div>
                </div>
                <div className="rounded-2xl border border-white bg-white/80 px-4 py-3">
                  <div className="text-[11px] uppercase tracking-wide text-slate-400">Estimated / recorded cost</div>
                  <div className="mt-1 text-sm font-medium text-slate-900">{record.cost !== null && record.cost !== undefined ? `${formatMoney(record.cost)} դր` : "—"}</div>
                </div>
              </div>

              {(record.treated_teeth?.length || record.surfaces?.length) ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {(record.treated_teeth ?? []).map((tooth) => (
                    <button
                      key={`${record.id}-tooth-${tooth}`}
                      type="button"
                      onClick={() => setSelectedTooth(tooth)}
                      className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700"
                    >
                      Tooth {tooth}
                    </button>
                  ))}
                  {(record.surfaces ?? []).map((surface) => <span key={`${record.id}-surface-${surface}`} className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">{surface}</span>)}
                </div>
              ) : null}

              {record.notes ? (
                <div className="mt-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-700">
                  <div className="mb-1 text-[11px] uppercase tracking-wide text-slate-400">Clinical notes</div>
                  {record.notes}
                </div>
              ) : null}

              {record.recommendation ? (
                <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800">
                  <div className="mb-1 flex items-center gap-2 text-[11px] uppercase tracking-wide text-amber-700"><ShieldAlert className="h-3.5 w-3.5" /> Recommendation / follow-up</div>
                  {record.recommendation}
                </div>
              ) : null}
            </div>
          )) : (
            <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-5 text-sm text-slate-500">Դեռ treatment record-ներ չկան։ Ավելացնենք առաջին diagnosis/visit entry-ն։</div>
          )}
        </div>
      </div>

      <Modal open={treatmentModalOpen} onClose={() => setTreatmentModalOpen(false)} title={editingTreatment ? "Խմբագրել treatment record-ը" : "Նոր treatment record"}>
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm text-slate-600">
              Procedure name
              <Input className="mt-1" value={treatmentForm.procedure_name} onChange={(e) => setTreatmentForm((p) => ({ ...p, procedure_name: e.target.value }))} placeholder="Cleaning, Filling, Extraction..." />
            </label>
            <label className="text-sm text-slate-600">
              Procedure code
              <Input className="mt-1" value={treatmentForm.procedure_code} onChange={(e) => setTreatmentForm((p) => ({ ...p, procedure_code: e.target.value }))} placeholder="D1110" />
            </label>
            <label className="text-sm text-slate-600">
              Diagnosis
              <Input className="mt-1" value={treatmentForm.diagnosis} onChange={(e) => setTreatmentForm((p) => ({ ...p, diagnosis: e.target.value }))} placeholder="Caries, gingivitis, pain..." />
            </label>
            <label className="text-sm text-slate-600">
              Visit date
              <input type="datetime-local" value={treatmentForm.visit_date} onChange={(e) => setTreatmentForm((p) => ({ ...p, visit_date: e.target.value }))} className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm" />
            </label>
            <label className="text-sm text-slate-600">
              Treated teeth
              <Input className="mt-1" value={treatmentForm.treated_teeth} onChange={(e) => setTreatmentForm((p) => ({ ...p, treated_teeth: e.target.value }))} placeholder="11, 12, 36" />
            </label>
            <label className="text-sm text-slate-600">
              Surfaces
              <Input className="mt-1" value={treatmentForm.surfaces} onChange={(e) => setTreatmentForm((p) => ({ ...p, surfaces: e.target.value }))} placeholder="MO, DO, Lingual" />
            </label>
            <label className="text-sm text-slate-600">
              Status
              <select value={treatmentForm.treatment_status} onChange={(e) => setTreatmentForm((p) => ({ ...p, treatment_status: e.target.value as TreatmentFormState["treatment_status"] }))} className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm">
                <option value="planned">Planned</option>
                <option value="in_progress">In progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </label>
            <label className="text-sm text-slate-600">
              Priority
              <select value={treatmentForm.priority} onChange={(e) => setTreatmentForm((p) => ({ ...p, priority: e.target.value as TreatmentFormState["priority"] }))} className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm">
                <option value="routine">Routine</option>
                <option value="urgent">Urgent</option>
                <option value="emergency">Emergency</option>
              </select>
            </label>
            <label className="text-sm text-slate-600">
              Cost
              <Input className="mt-1" type="number" min={0} value={treatmentForm.cost} onChange={(e) => setTreatmentForm((p) => ({ ...p, cost: e.target.value }))} placeholder="0" />
            </label>
            <label className="text-sm text-slate-600 md:col-span-2">
              Follow-up at
              <input type="datetime-local" value={treatmentForm.follow_up_at} onChange={(e) => setTreatmentForm((p) => ({ ...p, follow_up_at: e.target.value }))} className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm" />
            </label>
          </div>

          <label className="block text-sm text-slate-600">
            Clinical notes
            <textarea value={treatmentForm.notes} onChange={(e) => setTreatmentForm((p) => ({ ...p, notes: e.target.value }))} rows={4} className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm" placeholder="Ինչ արվեց այցի ընթացքում..." />
          </label>
          <label className="block text-sm text-slate-600">
            Recommendation
            <textarea value={treatmentForm.recommendation} onChange={(e) => setTreatmentForm((p) => ({ ...p, recommendation: e.target.value }))} rows={3} className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm" placeholder="Տնային խնամք, հաջորդ քայլեր, follow-up" />
          </label>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <div className="flex items-center gap-2 font-semibold"><AlertTriangle className="h-4 w-4" /> Treatment record-ը հիմա կապվում է նաև tooth chart-ի հետ</div>
            <div className="mt-1 leading-6">Եթե treated teeth դաշտում նշես օրինակ 36, ապա այդ ատամի history section-ում այդ entry-ն անմիջապես կհայտնվի։ Սա արդեն usable bridge է timeline-ի ու odontogram-ի միջև։</div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setTreatmentModalOpen(false)}>Փակել</Button>
            <Button loading={createTreatmentMut.isPending || updateTreatmentMut.isPending} onClick={submitTreatment}>{editingTreatment ? "Պահպանել" : "Ստեղծել գրառում"}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
