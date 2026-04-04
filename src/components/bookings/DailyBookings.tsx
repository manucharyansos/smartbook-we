// src/components/bookings/DailyBookings.tsx
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    fetchBookingsDay,
    confirmBooking,
    cancelBooking,
    doneBooking,
    type Booking,
    type Role,
} from "@/lib/bookingsApi";
import { BookingCard } from "./BookingCard";
import { EditBookingModal } from "./EditBookingModal";

interface DailyBookingsProps {
    date: string;
    role: Role;
    businessId?: number; // ավելացնել businessId
}

export function DailyBookings({ date, role, businessId }: DailyBookingsProps) {
    const qc = useQueryClient();
    const [edit, setEdit] = useState<Booking | null>(null);

    const q = useQuery<Booking[]>({
        queryKey: ["bookings", "day", date, businessId],
        queryFn: () => fetchBookingsDay(date),
        enabled: !!date,
    });

    const confirmMut = useMutation({
        mutationFn: (id: number) => confirmBooking(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["bookings", "day", date] });
        },
    });

    const cancelMut = useMutation({
        mutationFn: (id: number) => cancelBooking(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["bookings", "day", date] });
        },
    });

    const doneMut = useMutation({
        mutationFn: (id: number) => doneBooking(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["bookings", "day", date] });
        },
    });

    const bookings = useMemo(() => q.data ?? [], [q.data]);

    if (q.isLoading) return <div>Բեռնում է...</div>;
    if (q.isError) return <div className="text-red-600">{(q.error as Error).message}</div>;

    if (bookings.length === 0) {
        return <div className="text-gray-500">Այս օրը ամրագրումներ չկան</div>;
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
                    qc.invalidateQueries({ queryKey: ["bookings", "day", date] });
                }}
            />
        </div>
    );
}