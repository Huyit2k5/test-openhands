"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

/**
 * Client Component: a dropdown to switch which class is being shown.
 * Changing the selection rewrites the `classId` query parameter (via
 * `router.replace`) so the Server Component re-runs and loads the new class's
 * roster — a standard App Router pattern of a client control driving
 * server-side data via the URL.
 */
export function ClassSwitcher({
  classes,
  current,
}: {
  classes: { id: string; label: string }[];
  current: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function onChange(id: string) {
    const next = new URLSearchParams(searchParams.toString());
    next.set("classId", id);
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  }

  return (
    <label className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm">
      <span className="text-slate-400">Lớp:</span>
      <select
        value={current}
        onChange={(e) => onChange(e.target.value)}
        className="cursor-pointer border-0 bg-transparent font-medium text-slate-800 focus:outline-none"
      >
        {classes.map((c) => (
          <option key={c.id} value={c.id}>
            {c.label}
          </option>
        ))}
      </select>
    </label>
  );
}