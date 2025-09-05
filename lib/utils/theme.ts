import type { BrandingConfig, ColorScheme } from "../../config/types";

/**
 * Converts HSL color values to CSS custom properties
 */
export function createCSSVariables(colors: ColorScheme, prefix = ""): Record<string, string> {
  const variables: Record<string, string> = {};

  Object.entries(colors).forEach(([key, value]) => {
    if (value) {
      const variableName = prefix ? `--${prefix}-${kebabCase(key)}` : `--${kebabCase(key)}`;
      variables[variableName] = value;
    }
  });

  return variables;
}

/**
 * Applies theme colors to CSS custom properties
 */
export function applyThemeColors(colors: ColorScheme, isDark = false): void {
  const root = document.documentElement;
  const variables = createCSSVariables(colors);

  Object.entries(variables).forEach(([property, value]) => {
    root.style.setProperty(property, value);
  });

  // Set theme mode class
  root.classList.toggle("dark", isDark);
}

/**
 * Applies branding configuration to the DOM
 */
export function applyBrandingConfig(
  branding: BrandingConfig,
  theme: "light" | "dark" = "light",
): void {
  const root = document.documentElement;
  const colors =
    theme === "dark" && branding.colors.dark ? branding.colors.dark : branding.colors.light;

  // Apply color scheme
  applyThemeColors(colors, theme === "dark");

  // Apply typography
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
 * Generates theme-aware CSS variables for a configuration
 */
export function generateThemeCSS(branding: BrandingConfig): string {
  const lightVariables = createCSSVariables(branding.colors.light);
  const darkVariables = branding.colors.dark ? createCSSVariables(branding.colors.dark) : {};

  let css = ":root {\n";

  // Light theme variables
  Object.entries(lightVariables).forEach(([property, value]) => {
    css += `  ${property}: ${value};\n`;
  });

  // Typography variables
  if (branding.typography) {
    const { fontFamily, headingFont, bodyFont, fontSize } = branding.typography;

    if (fontFamily) css += `  --font-family: ${fontFamily};\n`;
    if (headingFont) css += `  --font-heading: ${headingFont};\n`;
    if (bodyFont) css += `  --font-body: ${bodyFont};\n`;

    if (fontSize) {
      Object.entries(fontSize).forEach(([size, value]) => {
        if (value) css += `  --font-size-${size}: ${value};\n`;
      });
    }
  }

  css += "}\n\n";

  // Dark theme variables
  if (Object.keys(darkVariables).length > 0) {
    css += "@media (prefers-color-scheme: dark) {\n";
    css += "  :root {\n";
    Object.entries(darkVariables).forEach(([property, value]) => {
      css += `    ${property}: ${value};\n`;
    });
    css += "  }\n";
    css += "}\n\n";

    css += ".dark {\n";
    Object.entries(darkVariables).forEach(([property, value]) => {
      css += `  ${property}: ${value};\n`;
    });
    css += "}\n";
  }

  return css;
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

/**
 * Converts camelCase to kebab-case
 */
function kebabCase(str: string): string {
  return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, "$1-$2").toLowerCase();
}
