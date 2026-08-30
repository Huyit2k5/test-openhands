import { Suspense } from "react";
import { AttendanceRoster } from "@/components/attendance/AttendanceRoster";
import { ClassSwitcher } from "@/components/attendance/ClassSwitcher";
import { getClasses, getRoster } from "@/lib/roster";

/**
 * ĐIỂM DANH — Server Component.
 *
 * Loads the class list server-side (for the switcher) and renders the roster
 * for the selected class inside a <Suspense> boundary (the App Router
 * convention for pages that read `searchParams`). The interactive controls
 * (class switcher + per-row toggle) are client components.
 */
export default async function AttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ classId?: string; sessionId?: string }>;
}) {
  const [params, classes] = await Promise.all([searchParams, getClasses()]);
  const selected = params.classId ?? classes[0]?.id ?? "";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
            Điểm danh
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Theo dõi và cập nhật tình trạng có mặt của học viên từng buổi học.
          </p>
        </div>
        <Suspense>
          <ClassSwitcher classes={classes} current={selected} />
        </Suspense>
      </div>

      <Suspense fallback={<RosterSkeleton />}>
        <AttendanceContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function AttendanceContent({
  searchParams,
}: {
  searchParams: Promise<{ classId?: string; sessionId?: string }>;
}) {
  const params = await searchParams;
  const roster = await getRoster(params.classId, params.sessionId);

  const present = roster.students.filter(
    (s) => s.attendance === "PRESENT" || s.attendance === "LATE",
  ).length;
  const absent = roster.students.filter((s) => s.attendance === "ABSENT").length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-3">
        <Field label="Khóa học" value={roster.courseName} />
        <Field label="Lớp học" value={`${roster.className} · ${roster.classCode}`} />
        <Field label="Giảng viên" value={roster.instructorName} />
      </div>

      {roster.session ? (
        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
          <span className="rounded-lg bg-indigo-50 px-3 py-1.5 font-medium text-indigo-700">
            {roster.session.title}
          </span>
          <span>{new Date(roster.session.startsAt).toLocaleString("vi-VN")}</span>
          <span className="ml-auto flex gap-2 text-xs">
            <Stat tone="emerald" label="Có mặt" value={present} />
            <Stat tone="rose" label="Vắng" value={absent} />
            <Stat tone="slate" label="Chưa điểm" value={roster.students.length - present - absent} />
          </span>
        </div>
      ) : (
        <p className="text-sm text-slate-400">Chưa có buổi học nào cho lớp này.</p>
      )}

      <AttendanceRoster data={roster} />
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-0.5 font-medium text-slate-800">{value}</dd>
    </div>
  );
}

function Stat({
  tone,
  label,
  value,
}: {
  tone: "emerald" | "rose" | "slate";
  label: string;
  value: number;
}) {
  const tones = {
    emerald: "bg-emerald-50 text-emerald-700",
    rose: "bg-rose-50 text-rose-700",
    slate: "bg-slate-100 text-slate-600",
  } as const;
  return (
    <span className={"rounded-full px-2.5 py-1 " + tones[tone]}>
      {label}: <span className="font-semibold">{value}</span>
    </span>
  );
}

function RosterSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-7 w-40 animate-pulse rounded bg-slate-200" />
      <div className="h-24 animate-pulse rounded-2xl bg-slate-100" />
      <div className="h-72 animate-pulse rounded-2xl bg-slate-100" />
    </div>
  );
}