import { useCuadrillaStore } from "@/store/useCuadrillaStore";
import type { MetricsLang } from "@/metrics/metricsCopy";
import { t } from "@/metrics/metricsCopy";

export function OfficeEmptyState({ lang }: { lang: MetricsLang }) {
  const n = useCuadrillaStore((s) => s.cuadrillas.size);
  if (n > 0) return null;

  return (
    <div className="office-empty-state" role="status" aria-live="polite">
      <p className="office-empty-state__title">{t(lang, "officeEmptyTitle")}</p>
    </div>
  );
}
