export type ThemeMode = "light" | "dark";

export const themeStorageKey = "ocean-theme";

export function applyTheme(theme: ThemeMode) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme;
}

export function getPreferredTheme(): ThemeMode {
  if (typeof window === "undefined") return "light";

  const savedTheme = window.localStorage.getItem(themeStorageKey);
  if (savedTheme === "dark" || savedTheme === "light") return savedTheme;

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function saveTheme(theme: ThemeMode) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(themeStorageKey, theme);
  }

  applyTheme(theme);
}
