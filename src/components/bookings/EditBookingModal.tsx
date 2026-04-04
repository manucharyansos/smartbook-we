// src/components/EditBookingModal.tsx
import { useEffect, useState } from "react";
import { Modal } from "./../ui/Modal.tsx";
import type { Booking } from "@/lib/bookingsApi";
import { updateBookingTime } from "@/lib/bookingsApi";
import { useMutation, useQueryClient } from "@tanstack/react-query";

function toDatetimeLocal(dt: string) {
    return dt.replace(" ", "T").slice(0, 16);
}

function fromDatetimeLocal(v: string) {
    return v.replace("T", " ") + ":00";
}

interface EditBookingModalProps {
    open: boolean;
    booking: Booking | null;
    onClose: () => void;
    onSaved?: () => void;
}

export function EditBookingModal({ open, booking, onClose, onSaved }: EditBookingModalProps) {
    const [start, setStart] = useState("");
    const [end, setEnd] = useState("");
    const [error, setError] = useState<string | null>(null);
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!open || !booking) return;
        setStart(toDatetimeLocal(booking.starts_at));
        setEnd(toDatetimeLocal(booking.ends_at));
        setError(null);
    }, [open, booking]);

    const updateMutation = useMutation({
        mutationFn: ({ id, starts_at, ends_at }: { id: number; starts_at: string; ends_at: string }) =>
            updateBookingTime(id, starts_at, ends_at),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["bookings"] });
            onClose();
            if (onSaved) onSaved();
        },
        onError: (err: any) => {
            setError(err.response?.data?.message || "Սխալ ժամանակի թարմացման ժամանակ");
        },
    });

    const handleSave = () => {
        if (!booking) return;
        updateMutation.mutate({
            id: booking.id,
            starts_at: fromDatetimeLocal(start),
            ends_at: fromDatetimeLocal(end),
        });
    };

    return (
        <Modal open={open} onClose={onClose} title="Թարմացնել ամրագրման ժամը">
            {!booking ? (
                <div className="text-gray-600">Booking չկա</div>
            ) : (
                <div className="space-y-3">
                    <div className="rounded-2xl border bg-gray-50 p-3">
                        <div className="font-semibold">{booking.client_name}</div>
                        <div className="text-sm text-gray-600">{booking.starts_at.slice(0, 10)}</div>
                        {booking.service_name && (
                            <div className="text-xs text-gray-500 mt-1">{booking.service_name}</div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <label className="text-sm">
                            Սկիզբ
                            <input
                                type="datetime-local"
                                className="mt-1 w-full rounded-xl border px-3 py-2"
                                value={start}
                                onChange={(e) => setStart(e.target.value)}
                            />
                        </label>

                        <label className="text-sm">
                            Վերջ
                            <input
                                type="datetime-local"
                                className="mt-1 w-full rounded-xl border px-3 py-2"
                                value={end}
                                onChange={(e) => setEnd(e.target.value)}
                            />
                        </label>
                    </div>

                    {error && <div className="text-sm text-red-600">{error}</div>}

                    <div className="flex justify-end gap-2 pt-1">
                        <button
                            type="button"
                            className="px-4 py-2 rounded-2xl border bg-white hover:bg-gray-50"
                            onClick={onClose}
                        >
                            Փակել
                        </button>
                        <button
                            type="button"
                            disabled={updateMutation.isPending}
                            className="px-4 py-2 rounded-2xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
                            onClick={handleSave}
                        >
                            {updateMutation.isPending ? "Պահպանում..." : "Պահպանել"}
                        </button>
                    </div>
                </div>
            )}
        </Modal>
    );
}