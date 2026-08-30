/**
 * Simple placeholder for dashboard pages that are not yet implemented.
 * (Server component — safe to render anywhere in a Server Component page.)
 */
export function ComingSoon({ title, description }: { title: string; description: string }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">{title}</h1>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>

      <div className="grid place-items-center rounded-2xl border border-dashed border-slate-300 bg-white py-20 text-center">
        <div className="grid h-14 w-14 place-items-center rounded-full bg-slate-100 text-slate-400">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-7 w-7">
            <path
              d="M12 8v4l3 3M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h2 className="mt-4 text-base font-semibold text-slate-800">Chưa triển khai</h2>
        <p className="mt-1 max-w-sm text-sm text-slate-400">
          Tính năng này sẽ được phát triển trong giai đoạn tiếp theo.
        </p>
      </div>
    </div>
  );
}