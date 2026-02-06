export const THEME_COLOR_TOKENS = [
  { key: "--color-bg-primary", label: "Background / Primary" },
  { key: "--color-bg-secondary", label: "Background / Secondary" },
  { key: "--color-bg-tertiary", label: "Background / Tertiary" },
  { key: "--color-surface-node", label: "Surface / Node" },
  { key: "--color-accent-primary", label: "Accent / Primary" },
  { key: "--color-accent-secondary", label: "Accent / Secondary" },
  { key: "--color-accent-peak", label: "Accent / Peak" },
  { key: "--color-accent-neutral", label: "Accent / Neutral" },
  { key: "--color-text-primary", label: "Text / Primary" },
  { key: "--color-text-secondary", label: "Text / Secondary" },
  { key: "--color-text-muted", label: "Text / Muted" },
];

export const THEME_DERIVED_TOKENS = [
  "--color-bg-primary-rgb",
  "--color-bg-secondary-rgb",
  "--color-bg-tertiary-rgb",
  "--color-accent-primary-rgb",
  "--color-accent-secondary-rgb",
  "--color-accent-peak-rgb",
  "--color-accent-neutral-rgb",
  "--gradient-hero",
  "--gradient-axis",
  "--gradient-accent",
  "--gradient-accent-active",
  "--gradient-node-core",
  "--shadow-glow",
];

export const THEME_TOKEN_KEYS = [
  ...THEME_COLOR_TOKENS.map((token) => token.key),
  ...THEME_DERIVED_TOKENS,
];

export const CUSTOM_THEME_STORAGE_KEY = "rr-custom-themes";

export const hexToRgb = (hex) => {
  if (!hex) return null;
  const normalized = hex.replace("#", "");
  if (normalized.length !== 6) return null;
  const value = parseInt(normalized, 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return { r, g, b, rgb: `${r}, ${g}, ${b}` };
};

export const rgbStringToHex = (rgbString) => {
  if (!rgbString) return "#000000";
  const match = rgbString.match(/\d+/g);
  if (!match || match.length < 3) return "#000000";
  const [r, g, b] = match.map((value) => Number(value));
  const toHex = (value) => value.toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

export const buildThemeTokens = (baseTokens) => {
  const bgPrimary = baseTokens["--color-bg-primary"];
  const bgSecondary = baseTokens["--color-bg-secondary"];
  const bgTertiary = baseTokens["--color-bg-tertiary"];
  const accentPrimary = baseTokens["--color-accent-primary"];
  const accentSecondary = baseTokens["--color-accent-secondary"];
  const accentPeak = baseTokens["--color-accent-peak"] ?? accentPrimary;
  const accentNeutral = baseTokens["--color-accent-neutral"];

  const bgPrimaryRgb = hexToRgb(bgPrimary);
  const bgSecondaryRgb = hexToRgb(bgSecondary);
  const bgTertiaryRgb = hexToRgb(bgTertiary);
  const accentPrimaryRgb = hexToRgb(accentPrimary);
  const accentSecondaryRgb = hexToRgb(accentSecondary);
  const accentPeakRgb = hexToRgb(accentPeak);
  const accentNeutralRgb = hexToRgb(accentNeutral);

  const gradientHero = `linear-gradient(90deg, ${bgPrimary} 0%, ${bgSecondary} 45%, ${bgTertiary} 70%, ${accentPrimary} 100%)`;
  const gradientAxis = `linear-gradient(135deg, ${accentSecondary} 0%, ${accentPrimary} 100%)`;
  const gradientAccent = gradientAxis;
  const gradientAccentActive = `linear-gradient(135deg, ${bgSecondary} 0%, ${accentSecondary} 100%)`;
  const gradientNodeCore = `radial-gradient(circle, ${accentPrimary} 0%, ${accentSecondary} 60%, rgba(${accentPrimaryRgb?.rgb ?? "0, 0, 0"}, 0) 100%)`;
  const shadowGlow = `0 0 0 1px rgba(${accentPrimaryRgb?.rgb ?? "0, 0, 0"}, 0.25)`;

  return {
    ...baseTokens,
    "--color-bg-primary-rgb": bgPrimaryRgb?.rgb ?? "0, 0, 0",
    "--color-bg-secondary-rgb": bgSecondaryRgb?.rgb ?? "0, 0, 0",
    "--color-bg-tertiary-rgb": bgTertiaryRgb?.rgb ?? "0, 0, 0",
    "--color-accent-primary-rgb": accentPrimaryRgb?.rgb ?? "0, 0, 0",
    "--color-accent-secondary-rgb": accentSecondaryRgb?.rgb ?? "0, 0, 0",
    "--color-accent-peak-rgb": accentPeakRgb?.rgb ?? "0, 0, 0",
    "--color-accent-neutral-rgb": accentNeutralRgb?.rgb ?? "0, 0, 0",
    "--gradient-hero": gradientHero,
    "--gradient-axis": gradientAxis,
    "--gradient-accent": gradientAccent,
    "--gradient-accent-active": gradientAccentActive,
    "--gradient-node-core": gradientNodeCore,
    "--shadow-glow": shadowGlow,
  };
};

export const normalizeThemeId = (name, existingIds = []) => {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "theme";
  if (!existingIds.includes(base)) return base;
  let counter = 2;
  while (existingIds.includes(`${base}-${counter}`)) {
    counter += 1;
  }
  return `${base}-${counter}`;
};

export const getComputedTokenDefaults = () => {
  const styles = getComputedStyle(document.documentElement);
  const defaults = {};
  THEME_COLOR_TOKENS.forEach((token) => {
    const value = styles.getPropertyValue(token.key).trim();
    defaults[token.key] = value.startsWith("#") ? value : rgbStringToHex(value);
  });
  return defaults;
};

export const buildThemeSwatch = (tokens) => {
  const accentPrimary = tokens["--color-accent-primary"];
  const accentSecondary = tokens["--color-accent-secondary"];
  if (!accentPrimary || !accentSecondary) return "";
  return `linear-gradient(135deg, ${accentSecondary} 0%, ${accentPrimary} 100%)`;
};
