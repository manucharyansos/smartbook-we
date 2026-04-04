import type { LucideIcon } from 'lucide-react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/cn';

interface AdminStatCardProps {
  title: string;
  value: string | number;
  hint?: string;
  trend?: number | null;
  icon: LucideIcon;
  tone?: 'violet' | 'sky' | 'emerald' | 'amber' | 'rose' | 'slate';
}

const toneMap = {
  violet: 'bg-violet-50 text-violet-700 border-violet-100',
  sky: 'bg-sky-50 text-sky-700 border-sky-100',
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  amber: 'bg-amber-50 text-amber-700 border-amber-100',
  rose: 'bg-rose-50 text-rose-700 border-rose-100',
  slate: 'bg-slate-100 text-slate-700 border-slate-200',
} as const;

export function AdminStatCard({ title, value, hint, trend, icon: Icon, tone = 'violet' }: AdminStatCardProps) {
  return (
    <Card className="rounded-[30px] p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium text-slate-500">{title}</div>
          <div className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{value}</div>
          {hint ? <div className="mt-2 text-sm leading-6 text-slate-500">{hint}</div> : null}
          {typeof trend === 'number' ? (
            <div className={cn('mt-4 inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium', trend >= 0 ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-rose-200 bg-rose-50 text-rose-700')}>
              {trend >= 0 ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
              {Math.abs(trend)}%
              <span className="font-normal text-slate-500">vs prev</span>
            </div>
          ) : null}
        </div>
        <div className={cn('grid h-12 w-12 shrink-0 place-items-center rounded-2xl border', toneMap[tone])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );
}
