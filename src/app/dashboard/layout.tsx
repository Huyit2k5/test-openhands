import { Sidebar } from "@/components/layout/Sidebar";

/**
 * Dashboard shell: a fixed left Sidebar plus a scrollable main content area
 * offset to the right of it. This layout wraps every page under /dashboard.
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <div className="md:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-400">Trang chính</span>
            <span className="text-slate-300">/</span>
            <span className="font-medium text-slate-700">Quản lý lớp học</span>
          </div>
          <div className="hidden items-center gap-2 sm:flex">
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
              ● Hệ thống hoạt động
            </span>
          </div>
        </header>
        <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}