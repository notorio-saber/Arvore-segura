export default function StatCard({ label, value, hint, tone = "default" }) {
  const toneClasses = {
    default: "bg-white text-gray-900",
    success: "bg-emerald-50 text-emerald-900",
    warning: "bg-amber-50 text-amber-900",
    danger: "bg-rose-50 text-rose-900",
  };

  return (
    <div className={`rounded-2xl border border-gray-200 p-4 shadow-sm ${toneClasses[tone] || toneClasses.default}`}>
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
      {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
    </div>
  );
}
