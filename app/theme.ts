export type ThemeMode = "light" | "dark" | "system";

export const themeStorageKey = "ocean-theme";

function resolveTheme(theme: ThemeMode): "light" | "dark" {
  if (theme !== "system") return theme;
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function applyTheme(theme: ThemeMode) {
  if (typeof document === "undefined") return;
  const resolvedTheme = resolveTheme(theme);
  document.documentElement.classList.toggle("dark", resolvedTheme === "dark");
  document.documentElement.style.colorScheme = resolvedTheme;
}

export function getPreferredTheme(): ThemeMode {
  if (typeof window === "undefined") return "light";

  const savedTheme = window.localStorage.getItem(themeStorageKey);
  if (savedTheme === "system") return "system";
  if (savedTheme === "dark" || savedTheme === "light") return savedTheme;

  return "system";
}

export function saveTheme(theme: ThemeMode) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(themeStorageKey, theme);
  }

  applyTheme(theme);

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("oos-theme-change", { detail: resolveTheme(theme) }));
  }
}
