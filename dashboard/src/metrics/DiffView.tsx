import type { MetricsLang } from "./metricsCopy";
import { t } from "./metricsCopy";

function lineClass(line: string): string {
  if (line.startsWith("+++ ") || line.startsWith("--- ") || line.startsWith("diff ")) {
    return "diff-line diff-line--meta";
  }
  if (line.startsWith("@@")) return "diff-line diff-line--hunk";
  if (line.startsWith("+")) return "diff-line diff-line--add";
  if (line.startsWith("-")) return "diff-line diff-line--del";
  return "diff-line";
}

export function DiffView({ text, lang }: { text: string; lang: MetricsLang }) {
  const lines = text.length ? text.split("\n") : [];
  return (
    <pre className="diff-view" tabIndex={0} aria-label={t(lang, "diffOutputLabel")}>
      {lines.map((line, i) => (
        <div key={i} className={lineClass(line)}>
          {line || " "}
        </div>
      ))}
    </pre>
  );
}
