export default function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-forest/10 bg-gradient-to-br from-forest-light via-white to-white p-6 shadow-sm lg:flex-row lg:items-end lg:justify-between">
      <div className="flex items-start gap-4">
        <img src="/logo.png" alt="Logo Árvore Segura" className="h-12 w-12 rounded-2xl object-cover" />
        <div>
          {eyebrow && <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-forest">{eyebrow}</p>}
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {description && <p className="mt-2 max-w-2xl text-sm text-gray-600">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
