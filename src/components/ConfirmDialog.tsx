import { AlertTriangle, X, type LucideIcon } from "lucide-react";
import { useEffect, useRef } from "react";

type Props = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  icon?: LucideIcon;
  tone?: "danger" | "primary";
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  icon: Icon = AlertTriangle,
  tone = "danger",
  onCancel,
  onConfirm,
}: Props) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    confirmRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  const isDanger = tone === "danger";

  return (
    <div
      className="fixed inset-0 z-[110] grid place-items-center bg-slate-950/45 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={onCancel}
    >
      <section
        className="w-full max-w-md rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_24px_80px_rgba(15,23,42,0.28)] sm:p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <span
            className={`grid size-11 shrink-0 place-items-center rounded-2xl ${
              isDanger ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"
            }`}
          >
            <Icon className="size-5" aria-hidden="true" />
          </span>
          <button
            className="grid size-9 place-items-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-100"
            type="button"
            onClick={onCancel}
            aria-label="Fermer la fenêtre"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>

        <h2
          id="confirm-dialog-title"
          className="mt-4 text-lg font-black tracking-tight text-slate-950"
        >
          {title}
        </h2>
        <p
          id="confirm-dialog-description"
          className="mt-2 text-sm font-medium leading-relaxed text-slate-600"
        >
          {description}
        </p>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            className="h-11 rounded-xl px-4 text-sm font-extrabold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 focus:outline-none focus:ring-4 focus:ring-blue-100"
            type="button"
            onClick={onCancel}
          >
            Annuler
          </button>
          <button
            className={`h-11 rounded-xl px-4 text-sm font-extrabold text-white shadow-sm transition focus:outline-none ${
              isDanger
                ? "bg-red-600 hover:bg-red-700 focus:ring-4 focus:ring-red-100"
                : "bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-100"
            }`}
            type="button"
            onClick={onConfirm}
            ref={confirmRef}
          >
            {confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}
