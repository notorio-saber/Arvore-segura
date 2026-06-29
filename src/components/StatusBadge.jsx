import { STATUS } from "../lib/reportes";

export default function StatusBadge({ status }) {
  const info = STATUS[status] || STATUS.pendente;
  return (
    <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${info.color}`}>
      {info.label}
    </span>
  );
}
