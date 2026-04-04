// src/components/bookings/WeeklyBookings.tsx
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    fetchBookingsWeek,
    confirmBooking,
    cancelBooking,
    doneBooking,
    type Booking,
    type Role,
} from "@/lib/bookingsApi";
import { BookingCard } from "./BookingCard";
import { EditBookingModal } from "./EditBookingModal";

interface WeeklyBookingsProps {
    weekStart: string;
    role: Role;
    businessId?: number; // ավելացնել businessId
}

export function WeeklyBookings({ weekStart, role, businessId }: WeeklyBookingsProps) {
    const qc = useQueryClient();
    const [edit, setEdit] = useState<Booking | null>(null);

    /**
     * Compute the end date for the week. The API expects an inclusive
     * range where `from` is the first day of the week and `to` is the last.
     * We convert the incoming weekStart string into a Date, add six days,
     * and then format it back to "YYYY-MM-DD". This logic is kept local
     * to this component to avoid importing any third‑party date libraries.
     */
    const endDate = useMemo(() => {
        const start = new Date(weekStart);
        // If weekStart is invalid, return the same date string to avoid
        // crashing; the API will handle invalid ranges.
        if (isNaN(start.getTime())) {
            return weekStart;
        }
        const end = new Date(start);
        end.setDate(end.getDate() + 6);
        // Format back to YYYY-MM-DD
        const iso = end.toISOString();
        return iso.slice(0, 10);
    }, [weekStart]);

    const q = useQuery<Booking[]>({
        queryKey: ["bookings", "week", weekStart, businessId],
        queryFn: () => fetchBookingsWeek(weekStart, endDate),
        enabled: !!weekStart,
    });

    const confirmMut = useMutation({
        mutationFn: (id: number) => confirmBooking(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["bookings", "week", weekStart] });
        },
    });

    const cancelMut = useMutation({
        mutationFn: (id: number) => cancelBooking(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["bookings", "week", weekStart] });
        },
    });

    const doneMut = useMutation({
        mutationFn: (id: number) => doneBooking(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["bookings", "week", weekStart] });
        },
    });

    const bookings = useMemo(() => q.data ?? [], [q.data]);

    if (q.isLoading) return <div>Բեռնում է...</div>;
    if (q.isError) return <div className="text-red-600">{(q.error as Error).message}</div>;

    if (bookings.length === 0) {
        return <div className="text-gray-500">Այս շաբաթ ամրագրումներ չկան</div>;
    }

    return (
        <div className="space-y-3">
            {bookings.map((b: Booking) => (
                <BookingCard
                    key={b.id}
                    booking={b}
                    role={role}
                    onConfirm={(id) => confirmMut.mutate(id)}
                    onCancel={(id) => cancelMut.mutate(id)}
                    onDone={(id) => doneMut.mutate(id)}
                    onEdit={(bk) => setEdit(bk)}
                />
            ))}

            <EditBookingModal
                open={!!edit}
                booking={edit}
                onClose={() => setEdit(null)}
                onSaved={() => {
                    qc.invalidateQueries({ queryKey: ["bookings", "week", weekStart] });
                }}
            />
        </div>
    );
}