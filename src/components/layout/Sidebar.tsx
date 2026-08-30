"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menu = [
  {
    label: "Lịch giảng dạy",
    href: "/dashboard/schedule",
    icon: (
      <path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
    ),
  },
  {
    label: "Điểm danh",
    href: "/dashboard/attendance",
    icon: (
      <path d="M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    ),
  },
  {
    label: "Chấm đồ án",
    href: "/dashboard/projects",
    icon: (
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M9 13h6M9 17h6" />
    ),
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-16 flex-col border-r border-slate-200 bg-white md:w-64">
      {/* Brand */}
      <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-4">
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-indigo-600 font-semibold text-white">
          T
        </div>
        <span className="hidden text-sm font-semibold tracking-tight text-slate-900 md:block">
          Tech Training
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 p-2 md:p-3">
        {menu.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors " +
                (active
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900")
              }
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
                className={
                  "h-5 w-5 shrink-0 " +
                  (active ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600")
                }
              >
                {item.icon}
              </svg>
              <span className="hidden md:block">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="hidden border-t border-slate-200 p-3 md:block">
        <div className="flex items-center gap-3 rounded-lg px-2 py-1.5">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-slate-200 text-sm font-semibold text-slate-600">
            A
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-slate-800">Admin</p>
            <p className="truncate text-xs text-slate-400">admin@tts.edu</p>
          </div>
        </div>
      </div>
    </aside>
  );
}