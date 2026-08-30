"use client";

import { useState } from "react";
import type { RosterData } from "@/lib/types";

type Mark = "PRESENT" | "ABSENT";

/**
 * Client Component: the student roster for one class, with a per-row
 * "Có mặt / Vắng mặt" toggle. It posts each change to the (simulated) API
 * endpoint `POST /api/attendance` and updates the row optimistically,
 * reverting if the request fails.
 *
 * It receives the roster as a plain serializable prop from the Server
 * Component — so all data fetching happens server-side, and this component is
 * only responsible for interactivity.
 */
export function AttendanceRoster({ data }: { data: RosterData }) {
  // Current mark per student. Initialized from server data.
  const [marks, setMarks] = useState<Record<string, Mark | null>>(() =>
    Object.fromEntries(
      data.students.map((s) => [
        s.enrollmentId,
        s.attendance === "PRESENT" || s.attendance === "LATE"
          ? ("PRESENT" as Mark)
          : s.attendance === "ABSENT"
            ? ("ABSENT" as Mark)
            : null,
      ]),
    ),
  );
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function toggle(enrollmentId: string, next: Mark) {
    // Ignore rapid re-clicks on the same row.
    if (pending) return;

    const prev = marks[enrollmentId];
    setMarks((m) => ({ ...m, [enrollmentId]: next })); // optimistic
    setPending(enrollmentId);
    setError(null);

    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enrollmentId,
          sessionId: data.session?.id ?? "",
          present: next === "PRESENT",
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) throw new Error(json?.message ?? `HTTP ${res.status}`);
    } catch (e) {
      setMarks((m) => ({ ...m, [enrollmentId]: prev })); // revert
      setError(`Không thể lưu: ${(e as Error).message}`);
    } finally {
      setPending(null);
    }
  }

  const presentCount = Object.values(marks).filter((m) => m === "PRESENT").length;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Table header / summary */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Danh sách học viên</h2>
          <p className="text-xs text-slate-400">
            {data.students.length} học viên · {presentCount} có mặt
          </p>
        </div>
        {error && (
          <span className="rounded-md bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-600">
            {error}
          </span>
        )}
      </div>

      {/* Table (horizontal scroll on small screens) */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
              <th className="px-5 py-3 font-medium">Học viên</th>
              <th className="hidden px-5 py-3 font-medium sm:table-cell">Email</th>
              <th className="px-5 py-3 text-right font-medium">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.students.map((s) => {
              const value = marks[s.enrollmentId];
              const isPending = pending === s.enrollmentId;
              return (
                <tr key={s.enrollmentId} className="transition-colors hover:bg-slate-50/60">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-indigo-50 text-sm font-semibold text-indigo-600">
                        {initials(s.name)}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-slate-800">{s.name}</p>
                        <p className="truncate text-xs text-slate-400 sm:hidden">{s.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-5 py-3 text-slate-500 sm:table-cell">{s.email}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end">
                      <Segmented
                        present={value === "PRESENT"}
                        absent={value === "ABSENT"}
                        disabled={isPending}
                        onPresent={() => toggle(s.enrollmentId, "PRESENT")}
                        onAbsent={() => toggle(s.enrollmentId, "ABSENT")}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/** Two-state "Có mặt / Vắng mặt" segmented toggle. */
function Segmented({
  present,
  absent,
  disabled,
  onPresent,
  onAbsent,
}: {
  present: boolean;
  absent: boolean;
  disabled: boolean;
  onPresent: () => void;
  onAbsent: () => void;
}) {
  const base =
    "rounded-md px-3 py-1.5 text-xs font-semibold transition-colors " +
    (disabled ? "opacity-60" : "cursor-pointer");
  return (
    <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
      <button
        type="button"
        onClick={onPresent}
        disabled={disabled}
        className={
          base +
          (present
            ? " bg-emerald-600 text-white shadow-sm"
            : " text-slate-500 hover:text-emerald-700")
        }
      >
        {present ? "✓ Có mặt" : "Có mặt"}
      </button>
      <button
        type="button"
        onClick={onAbsent}
        disabled={disabled}
        className={
          base + (absent ? " bg-rose-600 text-white shadow-sm" : " text-slate-500 hover:text-rose-700")
        }
      >
        {absent ? "✓ Vắng mặt" : "Vắng mặt"}
      </button>
    </div>
  );
}

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(-2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
}