/** Rohwert auf der Skala 0–100. 28 bleibt 28. Keine Umrechnung auf −1…+1. */
export function parseSentimentPoints(raw: unknown): number | null {
  if (raw === null || raw === undefined || raw === "") return null;
  const n = typeof raw === "number" ? raw : typeof raw === "string" ? Number(raw) : Number.NaN;
  if (!Number.isFinite(n)) return null;
  const points = Math.round(n);
  if (points < 0 || points > 100) return null;
  return points;
}

/** Anzeige ist der ganzzahlige Rohwert. */
export function shownSentiment(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return "—";
  return String(Math.round(value));
}
