import { AlertTriangle, X, type LucideIcon } from 'lucide-react';
import { useEffect, useId, useRef } from 'react';
import { t } from '../i18n/fr';

type Props = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  icon?: LucideIcon;
  tone?: 'danger' | 'primary';
  onCancel: () => void;
  onConfirm: () => void;
};

/** Render a native modal so the browser owns focus containment and Escape handling. */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  icon: Icon = AlertTriangle,
  tone = 'danger',
  onCancel,
  onConfirm,
}: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const isDanger = tone === 'danger';

  return (
    <dialog
      ref={dialogRef}
      className="capacity-dialog fixed inset-0 z-[110] m-auto w-[calc(100%-2rem)] max-w-md rounded-[1.75rem] border border-slate-200 bg-white p-5 text-slate-950 shadow-[0_24px_80px_rgba(15,23,42,0.28)] sm:p-6"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onCancel={onCancel}
    >
      <form method="dialog">
        <div className="flex items-start justify-between gap-4">
          <span
            className={`grid size-11 shrink-0 place-items-center rounded-2xl ${
              isDanger ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
            }`}
          >
            <Icon className="size-5" aria-hidden="true" />
          </span>
          <button
            className="grid size-9 place-items-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-100"
            value="cancel"
            onClick={onCancel}
            aria-label={t.dialogs.close}
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>

        <h2 id={titleId} className="mt-4 text-lg font-black tracking-tight">
          {title}
        </h2>
        <p id={descriptionId} className="mt-2 text-sm font-medium leading-relaxed text-slate-600">
          {description}
        </p>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            className="h-11 rounded-xl px-4 text-sm font-extrabold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 focus:outline-none focus:ring-4 focus:ring-blue-100"
            value="cancel"
            onClick={onCancel}
          >
            {t.dialogs.cancel}
          </button>
          <button
            className={`h-11 rounded-xl px-4 text-sm font-extrabold text-white shadow-sm transition focus:outline-none ${
              isDanger
                ? 'bg-red-600 hover:bg-red-700 focus:ring-4 focus:ring-red-100'
                : 'bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-100'
            }`}
            value="confirm"
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </form>
    </dialog>
  );
}
