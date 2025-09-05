import { useCallback, useEffect, useState } from "react";
import { airdropConfig as defaultConfig } from "../config/airdrop.config";
import type { AirdropConfig, ConfigState } from "../config/types";
import { applyBrandingConfig, getCurrentTheme } from "../lib/utils/theme";

/**
 * Hook for accessing and managing airdrop configuration
 */
export function useAirdropConfig(customConfig?: Partial<AirdropConfig>) {
  const [configState, setConfigState] = useState<ConfigState>({
    config: defaultConfig,
    error: undefined,
    isLoaded: false,
  });

  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");
  const [currentTheme, setCurrentTheme] = useState<"light" | "dark">("light");

  // Load and merge configuration
  const loadConfig = useCallback(async () => {
    try {
      setConfigState((prev) => ({ ...prev, error: undefined, isLoaded: false }));

      // Merge custom config with default config
      const mergedConfig: AirdropConfig = customConfig
        ? mergeConfigs(defaultConfig, customConfig)
        : defaultConfig;

      // Validate configuration
      const validation = validateConfig(mergedConfig);
      if (!validation.isValid) {
        throw new Error(`Configuration validation failed: ${validation.errors.join(", ")}`);
      }

      setConfigState({
        config: mergedConfig,
        error: undefined,
        isLoaded: true,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to load configuration";
      setConfigState((prev) => ({
        ...prev,
        error: errorMessage,
        isLoaded: true,
      }));
    }
  }, [customConfig]);

  // Apply theming when config or theme changes
  const applyTheme = useCallback(
    (themeMode?: "light" | "dark" | "system") => {
      const effectiveTheme = themeMode || configState.config.ui?.theme || "system";
      const resolvedTheme = getCurrentTheme(effectiveTheme);

      setTheme(effectiveTheme);
      setCurrentTheme(resolvedTheme);

      if (configState.isLoaded && typeof window !== "undefined") {
        applyBrandingConfig(configState.config.branding, resolvedTheme);
      }
    },
    [configState],
  );

  // Initialize configuration
  useEffect(() => {
    void loadConfig();
  }, [loadConfig]);

  // Apply theme when configuration is loaded
  useEffect(() => {
    if (configState.isLoaded) {
      applyTheme();
    }
  }, [configState.isLoaded, applyTheme]);

  // Listen for system theme changes
  useEffect(() => {
    if (typeof window === "undefined" || theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleThemeChange = () => applyTheme();

    mediaQuery.addEventListener("change", handleThemeChange);
    return () => mediaQuery.removeEventListener("change", handleThemeChange);
  }, [theme, applyTheme]);

  return {
    // Configuration state
    config: configState.config,
    currentTheme,
    error: configState.error,

    // Helper functions
    getComponentVariant: (component: string) =>
      configState.config.ui?.components?.[
        component as keyof typeof configState.config.ui.components
      ],

    getLayoutSetting: (setting: string) =>
      configState.config.ui?.layout?.[setting as keyof typeof configState.config.ui.layout],
    hasCustomBranding: configState.config !== defaultConfig,

    // Computed values
    isDarkMode: currentTheme === "dark",
    isLoaded: configState.isLoaded,

    // Actions
    reload: loadConfig,
    setTheme: applyTheme,

    // Theme state
    theme,
  };
}

/**
 * Hook for accessing specific parts of configuration
 */
export function useConfigSection<T extends keyof AirdropConfig>(
  section: T,
  customConfig?: Partial<AirdropConfig>,
): AirdropConfig[T] {
  const { config } = useAirdropConfig(customConfig);
  return config[section];
}

/**
 * Hook for contract-specific configuration
 */
export function useContractConfig(customConfig?: Partial<AirdropConfig>) {
  const config = useConfigSection("contract", customConfig);
  return {
    address: config.address,
    chainId: config.chainId,
    isInstant: config.type === "instant",
    isLockupLinear: config.type === "lockup-linear",
    isLockupTranched: config.type === "lockup-tranched",
    type: config.type,
  };
}

/**
 * Hook for branding configuration with theme support
 */
export function useBrandingConfig(customConfig?: Partial<AirdropConfig>) {
  const { config, currentTheme } = useAirdropConfig(customConfig);
  const branding = config.branding;

  return {
    ...branding,
    currentColors:
      currentTheme === "dark" && branding.colors.dark
        ? branding.colors.dark
        : branding.colors.light,
    currentTheme,
    logo: branding.logo,
    typography: branding.typography,
  };
}

/**
 * Hook for campaign configuration
 */
export function useCampaignConfig(customConfig?: Partial<AirdropConfig>) {
  const config = useConfigSection("campaign", customConfig);

  const now = new Date();
  const startDate = config.startDate ? new Date(config.startDate) : null;
  const endDate = config.endDate ? new Date(config.endDate) : null;

  return {
    ...config,
    hasEnded: endDate ? now > endDate : false,
    hasStarted: !startDate || now >= startDate,
    isActive: (!startDate || now >= startDate) && (!endDate || now <= endDate),
    timeUntilEnd: endDate && now < endDate ? endDate.getTime() - now.getTime() : 0,
    timeUntilStart: startDate && now < startDate ? startDate.getTime() - now.getTime() : 0,
  };
}

/**
 * Deep merge two configuration objects (object sections are shallow-merged)
 */
function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function mergeConfigs(base: AirdropConfig, override: Partial<AirdropConfig>): AirdropConfig {
  const result: AirdropConfig = { ...base };

  const keys = Object.keys(override) as Array<keyof AirdropConfig>;

  const assign = <K extends keyof AirdropConfig>(key: K) => {
    const overrideValue = override[key];
    if (overrideValue === undefined) return;
    const baseValue = base[key];

    if (isPlainObject(overrideValue) && isPlainObject(baseValue)) {
      result[key] = { ...(baseValue as object), ...(overrideValue as object) } as AirdropConfig[K];
    } else {
      result[key] = overrideValue as AirdropConfig[K];
    }
  };

  for (const key of keys) assign(key);

  return result;
}

/**
 * Validate configuration object
 */
function validateConfig(config: AirdropConfig): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate required fields
  if (!config.contract.address) {
    errors.push("Contract address is required");
  }

  if (!config.content.title) {
    errors.push("Content title is required");
  }

  if (!config.content.description) {
    errors.push("Content description is required");
  }

  if (!config.campaign.name) {
    errors.push("Campaign name is required");
  }

  if (!config.branding.logo.light) {
    errors.push("Light theme logo is required");
  }

  // Validate contract address format
  if (config.contract.address && !/^0x[a-fA-F0-9]{40}$/.test(config.contract.address)) {
    errors.push("Invalid contract address format");
  }

  // Validate chain ID
  if (config.contract.chainId <= 0) {
    errors.push("Invalid chain ID");
  }

  // Validate date formats
  if (config.campaign.startDate && Number.isNaN(Date.parse(config.campaign.startDate))) {
    errors.push("Invalid start date format");
  }

  if (config.campaign.endDate && Number.isNaN(Date.parse(config.campaign.endDate))) {
    errors.push("Invalid end date format");
  }

  // Validate date logic
  if (config.campaign.startDate && config.campaign.endDate) {
    const start = new Date(config.campaign.startDate);
    const end = new Date(config.campaign.endDate);
    if (start >= end) {
      errors.push("End date must be after start date");
    }
  }

  return {
    errors,
    isValid: errors.length === 0,
  };
}
