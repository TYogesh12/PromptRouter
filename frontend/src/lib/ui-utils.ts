export const MODEL_COLORS: Record<string, string> = {
  "gpt-4": "#10b981",
  "gpt-3.5": "#3b82f6",
  "claude-3-opus": "#8b5cf6",
  "claude-3-sonnet": "#a855f7",
  "llama-3-8b": "#4846e2",
  "llama-3-70b": "#f59e0b",
  "gemini-1.5-pro": "#9e3f4e",
  "gemini-1.5-flash": "#e11d48",
  "default": "#4846e2",
};

export function getModelColor(model: string = "") {
  const m = model.toLowerCase();
  for (const [key, color] of Object.entries(MODEL_COLORS)) {
    if (m.includes(key)) return color;
  }
  return MODEL_COLORS.default;
}

export const COMPLEXITY_COLORS = {
  simple: "#10b981",
  moderate: "#f59e0b",
  hard: "#9e3f4e",
  default: "#64748b",
};

export function getComplexityColor(complexity: string = "") {
  const c = complexity.toLowerCase();
  return COMPLEXITY_COLORS[c as keyof typeof COMPLEXITY_COLORS] || COMPLEXITY_COLORS.default;
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(amount);
}
