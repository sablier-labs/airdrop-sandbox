import type { BrandingConfig } from "../../config/types";

/**
 * Applies theme mode to document
 */
export function applyThemeMode(isDark: boolean): void {
  const root = document.documentElement;
  root.classList.toggle("dark", isDark);
}

/**
 * Applies branding configuration to the DOM
 * Colors are now handled by CSS variables in app/styles/variables.css
 */
export function applyBrandingConfig(
  branding: BrandingConfig,
  theme: "light" | "dark" = "light",
): void {
  const root = document.documentElement;

  // Apply theme mode class for CSS variables
  applyThemeMode(theme === "dark");

  // Apply typography variables
  if (branding.typography) {
    const { fontFamily, headingFont, bodyFont, fontSize } = branding.typography;

    if (fontFamily) {
      root.style.setProperty("--font-family", fontFamily);
    }

    if (headingFont) {
      root.style.setProperty("--font-heading", headingFont);
    }

    if (bodyFont) {
      root.style.setProperty("--font-body", bodyFont);
    }

    if (fontSize) {
      Object.entries(fontSize).forEach(([size, value]) => {
        if (value) {
          root.style.setProperty(`--font-size-${size}`, value);
        }
      });
    }
  }
}

/**
 * Gets the current theme based on system preference and explicit setting
 */
export function getCurrentTheme(explicitTheme?: "light" | "dark" | "system"): "light" | "dark" {
  if (explicitTheme === "light" || explicitTheme === "dark") {
    return explicitTheme;
  }

  // Check system preference
  if (typeof window !== "undefined") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  return "light";
}
