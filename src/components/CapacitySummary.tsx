import type { LucideIcon } from "lucide-react";

type SummaryTone = "neutral" | "positive" | "negative" | "accent";

export type SummaryItem = {
  icon: LucideIcon;
  label: string;
  value: string | number;
  unit?: string;
  tone: SummaryTone;
  progress?: number;
};

type Props = {
  title: string;
  eyebrow?: string | null;
  meta?: string;
  items: SummaryItem[];
};

const toneClasses: Record<
  SummaryTone,
  { label: string; value: string; progress: string }
> = {
  neutral: {
    label: "text-slate-400",
    value: "text-white",
    progress: "bg-slate-300",
  },
  positive: {
    label: "text-emerald-300",
    value: "text-emerald-300",
    progress: "bg-emerald-300",
  },
  negative: {
    label: "text-red-300",
    value: "text-red-300",
    progress: "bg-red-300",
  },
  accent: {
    label: "text-blue-300",
    value: "text-blue-300",
    progress: "bg-blue-400",
  },
};

export function CapacitySummary({ title, eyebrow = "Synthèse", meta, items }: Props) {
  return (
    <section
      className="overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-5 text-white shadow-[0_20px_50px_rgba(15,23,42,0.24)] sm:p-6"
      aria-label={title}
    >
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          {eyebrow ? (
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-300">
              {eyebrow}
            </p>
          ) : null}
          <h2 className={eyebrow ? "text-lg font-black" : "text-xl font-black"}>
            {title}
          </h2>
        </div>
        {meta ? (
          <p className="max-w-44 text-right text-[11px] font-medium leading-snug text-slate-400 sm:max-w-none sm:text-xs">
            {meta}
          </p>
        ) : null}
      </div>

      <div className="grid grid-cols-3 divide-x divide-white/15">
        {items.map((item) => {
          const Icon = item.icon;
          const tone = toneClasses[item.tone];
          const progress =
            item.progress === undefined
              ? undefined
              : Math.min(100, Math.max(0, item.progress));

          return (
            <article
              className="min-w-0 px-2 text-center sm:px-5"
              aria-label={`${item.label} : ${item.value}${item.unit ?? ""}`}
              key={item.label}
            >
              <span
                className={`flex items-center justify-center gap-1.5 whitespace-nowrap text-[9px] font-black uppercase tracking-[0.08em] sm:text-xs ${tone.label}`}
              >
                <Icon className="size-3.5 shrink-0" aria-hidden="true" />
                {item.label}
              </span>
              <strong
                className={`mt-2 block whitespace-nowrap text-3xl font-black tracking-tight sm:text-4xl ${tone.value}`}
              >
                {item.value}
                {item.unit ? (
                  <small className="ml-1 text-sm font-bold text-current opacity-70 sm:text-base">
                    {item.unit}
                  </small>
                ) : null}
              </strong>
              {progress !== undefined ? (
                <span
                  className="mx-auto mt-2 block h-1.5 max-w-24 overflow-hidden rounded-full bg-white/10"
                  role="progressbar"
                  aria-label={`Taux de ${item.label.toLowerCase()}`}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={progress}
                >
                  <span
                    className={`block h-full rounded-full ${tone.progress}`}
                    style={{ width: `${progress}%` }}
                  />
                </span>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}
