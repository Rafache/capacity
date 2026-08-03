import { MONTHS_LONG } from "../data/months";
import type { MonthStats } from "../types";

type Props = {
  stats: MonthStats[];
};

const formatNumber = (value: number) =>
  Number.isInteger(value) ? String(value) : value.toFixed(1).replace(".", ",");

export function CapacityEvolutionChart({ stats }: Props) {
  const maxAvailable = Math.max(...stats.map((item) => item.available), 1);

  return (
    <section
      className="mt-4 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm sm:mt-5 sm:rounded-3xl sm:p-5"
      aria-label="Évolution de la capacité disponible"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-black tracking-tight text-slate-950 sm:text-base">
            Évolution de la capacité
          </h3>
          <p className="mt-0.5 text-[10px] font-medium text-slate-500 sm:text-xs">
            Jours disponibles par mois
          </p>
        </div>
        <span className="whitespace-nowrap rounded-full bg-emerald-50 px-2 py-1 text-[9px] font-extrabold text-emerald-700 sm:px-2.5 sm:text-[10px]">
          Max. {formatNumber(maxAvailable)} j
        </span>
      </div>

      <div
        className="mt-5 grid h-56 grid-cols-12 gap-1 sm:h-64 sm:gap-2.5"
        role="list"
        aria-label="Capacité disponible par mois"
      >
        {stats.map((item, index) => {
          const height =
            item.available > 0 ? Math.max((item.available / maxAvailable) * 100, 6) : 0;

          return (
            <div
              className="flex min-w-0 flex-col items-center"
              key={MONTHS_LONG[index]}
              role="listitem"
              aria-label={`${MONTHS_LONG[index]} : ${formatNumber(item.available)} jours disponibles`}
            >
              <span className="min-h-4 whitespace-nowrap text-[9px] font-black text-emerald-700 sm:text-[10px]">
                {formatNumber(item.available)}
              </span>
              <div className="relative mt-1 min-h-0 w-full flex-1 overflow-hidden rounded-t-lg bg-emerald-50 sm:rounded-t-xl">
                <span
                  className="absolute inset-x-0 bottom-0 rounded-t-lg bg-capacity-available transition-[height] sm:rounded-t-xl"
                  style={{ height: `${height}%` }}
                />
              </div>
              <span className="mt-2 w-full break-words text-center text-[8px] font-bold leading-tight text-slate-500 sm:text-[10px]">
                {MONTHS_LONG[index]}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
