import Link from "next/link";

const cards = [
  { title: "Lịch giảng dạy", desc: "Xem lịch tiết dạy của các lớp", href: "/dashboard/schedule" },
  { title: "Điểm danh", desc: "Điểm danh học viên theo buổi học", href: "/dashboard/attendance" },
  { title: "Chấm đồ án", desc: "Xem và chấm bài nộp của học viên", href: "/dashboard/projects" },
];

export default function DashboardHome() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
          Bảng điều khiển
        </h1>
        <p className="mt-1 text-sm text-slate-500">Chào mừng trở lại — chọn một mục để bắt đầu.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-300 hover:shadow"
          >
            <h3 className="font-semibold text-slate-900 group-hover:text-indigo-700">{c.title}</h3>
            <p className="mt-1 text-sm text-slate-500">{c.desc}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-indigo-600">
              Mở
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4 transition group-hover:translate-x-0.5">
                <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}