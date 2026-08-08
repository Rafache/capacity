import { AlertTriangle, CircleCheckBig, CopyPlus, X } from "lucide-react";
import { ConfirmDialog } from "./ConfirmDialog";
import { formatNumber } from "../i18n/formatters";
import { t } from "../i18n/fr";
import type { Entry, EntryNumericKey } from "../types";

export type Notice = {
  message: string;
  type: "success" | "error";
};

export type Confirmation = { type: "clear" } | { type: "apply"; field: EntryNumericKey };

type Props = {
  notice: Notice | null;
  confirmation: Confirmation | null;
  currentEntry: Entry;
  onDismissNotice: () => void;
  onCancel: () => void;
  onConfirm: () => void;
};

export function AppFeedback({
  notice,
  confirmation,
  currentEntry,
  onDismissNotice,
  onCancel,
  onConfirm,
}: Props) {
  const field = confirmation?.type === "apply" ? confirmation.field : null;
  const value = field
    ? `${formatNumber(currentEntry[field])} ${field === "workRate" ? t.units.percent : t.units.day}`
    : "";

  return (
    <>
      {notice ? (
        <div
          className={`toast-in fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] left-1/2 z-[100] grid w-[min(430px,calc(100vw-1.25rem))] -translate-x-1/2 grid-cols-[2.25rem_minmax(0,1fr)_2rem] items-center gap-2.5 overflow-hidden rounded-2xl border p-3 pr-2 shadow-2xl ${
            notice.type === "error"
              ? "border-red-200 bg-red-50 text-red-900 shadow-red-950/15"
              : "border-emerald-200 bg-emerald-50 text-emerald-900 shadow-emerald-950/15"
          }`}
          role={notice.type === "error" ? "alert" : "status"}
          aria-live={notice.type === "error" ? "assertive" : "polite"}
        >
          <span
            className={`grid size-9 place-items-center rounded-xl ${notice.type === "error" ? "bg-red-100" : "bg-emerald-100"}`}
            aria-hidden="true"
          >
            {notice.type === "error" ? (
              <AlertTriangle className="size-5" />
            ) : (
              <CircleCheckBig className="size-5" />
            )}
          </span>
          <span className="text-sm font-bold leading-snug">{notice.message}</span>
          <button
            className="grid size-8 place-items-center rounded-lg transition hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-current/20"
            type="button"
            onClick={onDismissNotice}
            aria-label={t.dialogs.close}
          >
            <X className="size-4" />
          </button>
          <span
            className={`toast-progress absolute inset-x-0 bottom-0 h-1 origin-left ${notice.type === "error" ? "bg-red-500" : "bg-emerald-500"}`}
            aria-hidden="true"
          />
        </div>
      ) : null}

      <ConfirmDialog
        open={confirmation !== null}
        title={field ? t.dialogs.applyTitle : t.dialogs.clearTitle}
        description={
          field
            ? t.dialogs.applyDescription
                .replace("{value}", value)
                .replace("{field}", t.fields[field].toLowerCase())
            : t.dialogs.clearDescription
        }
        confirmLabel={field ? t.dialogs.applyConfirm : t.dialogs.clearConfirm}
        icon={field ? CopyPlus : undefined}
        tone={field ? "primary" : "danger"}
        onCancel={onCancel}
        onConfirm={onConfirm}
      />
    </>
  );
}
