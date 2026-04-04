import type { Booking, Role } from "@/lib/bookingsApi.ts";
import { canCancel, canConfirm, canDone, canEditTime, hhmm, ymd } from "@/lib/bookingUi.ts";

type Props = {
    booking: Booking;
    role: Role;
    onConfirm: (id: number) => void;
    onCancel: (id: number) => void;
    onDone: (id: number) => void;
    onEdit: (b: Booking) => void;
};

export function BookingCard({ booking: b, role, onConfirm, onCancel, onDone, onEdit }: Props) {
    return (
        <div className="rounded-2xl border p-4 bg-white shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="font-semibold">{b.client_name}</div>
                    <div className="text-sm text-gray-500">{b.service_name}</div>

                    <div className="text-sm text-gray-700 mt-1">
                        {ymd(b.starts_at)} · {hhmm(b.starts_at)} – {hhmm(b.ends_at)}
                    </div>

                    <div className="mt-1 text-xs uppercase text-gray-400">{b.status}</div>
                </div>

                <div className="flex flex-wrap gap-2 justify-end">
                    {canConfirm(role, b) && (
                        <button
                            onClick={() => onConfirm(b.id)}
                            className="px-3 py-1 rounded-xl bg-green-600 text-white text-sm"
                        >
                            Հաստատել
                        </button>
                    )}

                    {canDone(role, b) && (
                        <button
                            onClick={() => onDone(b.id)}
                            className="px-3 py-1 rounded-xl bg-gray-900 text-white text-sm"
                        >
                            Ավարտված
                        </button>
                    )}

                    {canCancel(role, b) && (
                        <button
                            onClick={() => onCancel(b.id)}
                            className="px-3 py-1 rounded-xl bg-red-600 text-white text-sm"
                        >
                            Չեղարկել
                        </button>
                    )}

                    {canEditTime(role, b) && (
                        <button
                            onClick={() => onEdit(b)}
                            className="px-3 py-1 rounded-xl bg-blue-600 text-white text-sm"
                        >
                            Թարմացնել
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
