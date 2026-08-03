import { AlertTriangle, CircleCheckBig, CopyPlus, X } from "lucide-react";
import { ConfirmDialog } from "./ConfirmDialog";
import { formatNumber } from "../i18n/formatters";
import { t } from "../i18n/translate";
import type { Entry, EntryNumericKey } from "../types";

export type Notice = {
  message: string;
  type: "success" | "error";
};

type Props = {
  notice: Notice | null;
  onDismissNotice: () => void;
  confirmClearOpen: boolean;
  onCancelClear: () => void;
  onConfirmClear: () => void;
  pendingApplyField: EntryNumericKey | null;
  currentEntry: Entry;
  onCancelApply: () => void;
  onConfirmApply: () => void;
};

const formatEntryValue = (field: EntryNumericKey, value: number) =>
  `${formatNumber(value)} ${field === "workRate" ? t.units.percent : t.units.day}`;

/** Group transient notices and confirmations into one feedback layer. */
export function AppFeedback({
  notice,
  onDismissNotice,
  confirmClearOpen,
  onCancelClear,
  onConfirmClear,
  pendingApplyField,
  currentEntry,
  onCancelApply,
  onConfirmApply,
}: Props) {
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
            className={`grid size-9 place-items-center rounded-xl ${
              notice.type === "error" ? "bg-red-100" : "bg-emerald-100"
            }`}
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
            className={`toast-progress absolute inset-x-0 bottom-0 h-1 origin-left ${
              notice.type === "error" ? "bg-red-500" : "bg-emerald-500"
            }`}
            aria-hidden="true"
          />
        </div>
      ) : null}

      <ConfirmDialog
        open={confirmClearOpen}
        title={t.dialogs.clearTitle}
        description={t.dialogs.clearDescription}
        confirmLabel={t.dialogs.clearConfirm}
        onCancel={onCancelClear}
        onConfirm={onConfirmClear}
      />

      <ConfirmDialog
        open={pendingApplyField !== null}
        title={t.dialogs.applyTitle}
        description={
          pendingApplyField
            ? t.dialogs.applyDescription
                .replace(
                  "{value}",
                  formatEntryValue(pendingApplyField, currentEntry[pendingApplyField]),
                )
                .replace("{field}", t.fields[pendingApplyField].toLowerCase())
            : ""
        }
        confirmLabel={t.dialogs.applyConfirm}
        icon={CopyPlus}
        tone="primary"
        onCancel={onCancelApply}
        onConfirm={onConfirmApply}
      />
    </>
  );
}
