import type { Booking, BookingStatus } from "../../lib/calendarApi";
import type { Block } from "../../lib/calendarBlocksApi";

export type DraftBooking = {
  startsAt: Date;
  endsAt: Date;
};

export type LineDraft = {
  key: string;
  service_id: number;
  staff_id: number | "";
  starts_at: string;
};

export type DraftBlock = {
  scope: "business" | "staff";
  staffId: number | "";
  date: string;
  mode: "allday" | "duration";
  startTime: string;
  durationMin: number;
  reason: string;
};

export type ActionBooking = Booking | null;

export type ConfirmState =
  | { type: "block"; block: Block }
  | { type: "booking-cancel"; booking: Booking }
  | null;

export type BookingMode = "single" | "multi" | "lines";
export type ViewMode = "day" | "week";

export type BookingEditorPayload = {
  id: number;
  client_name: string;
  client_phone: string;
  notes: string | null;
  status: BookingStatus;
  staff_id: number | null;
  starts_at: string;
};
