// Geolocation + currency detection via free IP API

export type Region = "US" | "UK" | "AU" | "NZ" | "EU" | "ZA" | "OTHER";

export interface UserLocation {
  country: string;
  countryCode: string;
  city: string;
  currency: string;
  currencySymbol: string;
  exchangeRate: number; // relative to USD
  region: Region;
}

const countryToRegion: Record<string, Region> = {
  US: "US",
  GB: "UK",
  AU: "AU",
  NZ: "NZ",
  ZA: "ZA",
  DE: "EU", FR: "EU", IT: "EU", ES: "EU", NL: "EU", BE: "EU", AT: "EU",
  PT: "EU", IE: "EU", FI: "EU", SE: "EU", DK: "EU", NO: "EU", PL: "EU",
  CZ: "EU", GR: "EU", RO: "EU", HU: "EU", CH: "EU", LU: "EU",
};

function getRegion(countryCode: string): Region {
  return countryToRegion[countryCode] ?? "OTHER";
}

// Approximate exchange rates from USD, adjusted for typical local beauty-retail
// markup so displayed prices match what shoppers actually pay in-store
// (rather than a pure FX conversion of the US RRP).
const currencyData: Record<string, { symbol: string; rate: number }> = {
  USD: { symbol: "$", rate: 1 },
  GBP: { symbol: "£", rate: 0.87 },     // 0.79 FX × ~1.1 markup
  EUR: { symbol: "€", rate: 1.01 },     // 0.92 FX × ~1.1 markup
  AUD: { symbol: "A$", rate: 2.14 },    // 1.53 FX × ~1.4 markup
  CAD: { symbol: "C$", rate: 1.51 },    // 1.37 FX × ~1.1 markup
  ZAR: { symbol: "R", rate: 21.8 },     // 18.2 FX × ~1.2 markup
  NGN: { symbol: "₦", rate: 1700 },
  INR: { symbol: "₹", rate: 92 },
  JPY: { symbol: "¥", rate: 170 },
  BRL: { symbol: "R$", rate: 5.5 },
  AED: { symbol: "AED", rate: 4.0 },
  SEK: { symbol: "kr", rate: 11.9 },
  NZD: { symbol: "NZ$", rate: 2.10 },   // 1.68 FX × ~1.25 markup
  KES: { symbol: "KSh", rate: 170 },
  GHS: { symbol: "GH₵", rate: 17 },
};

const fallback: UserLocation = {
  country: "United States",
  countryCode: "US",
  city: "",
  currency: "USD",
  currencySymbol: "$",
  exchangeRate: 1,
  region: "US",
};

export async function detectUserLocation(): Promise<UserLocation> {
  try {
    const res = await fetch("https://ipapi.co/json/", { signal: AbortSignal.timeout(4000) });
    if (!res.ok) return fallback;
    const data = await res.json();
    const currency = data.currency ?? "USD";
    const info = currencyData[currency] ?? { symbol: currency, rate: 1 };
    const cc = data.country_code ?? "US";
    return {
      country: data.country_name ?? "Unknown",
      countryCode: cc,
      city: data.city ?? "",
      currency,
      currencySymbol: info.symbol,
      exchangeRate: info.rate,
      region: getRegion(cc),
    };
  } catch {
    return fallback;
  }
}

export function convertPrice(usdPrice: number, exchangeRate: number): string {
  const converted = usdPrice * exchangeRate;
  // Round to nearest whole number for most currencies, 2 decimals for small rates
  if (exchangeRate > 10) return Math.round(converted).toString();
  return converted.toFixed(2);
}

// ── Manual region override (persisted) ────────────────────────────
const REGION_KEY = "tbm.userRegion";

export const regionOptions: { value: Region; label: string; currency: string }[] = [
  { value: "NZ", label: "New Zealand", currency: "NZD" },
  { value: "AU", label: "Australia", currency: "AUD" },
  { value: "US", label: "United States", currency: "USD" },
  { value: "UK", label: "United Kingdom", currency: "GBP" },
  { value: "EU", label: "Europe", currency: "EUR" },
  { value: "ZA", label: "South Africa", currency: "ZAR" },
  { value: "OTHER", label: "Other / Worldwide", currency: "USD" },
];

const regionToCurrency: Record<Region, string> = {
  NZ: "NZD", AU: "AUD", US: "USD", UK: "GBP", EU: "EUR", ZA: "ZAR", OTHER: "USD",
};
const regionToCountry: Record<Region, string> = {
  NZ: "New Zealand", AU: "Australia", US: "United States", UK: "United Kingdom",
  EU: "Europe", ZA: "South Africa", OTHER: "Worldwide",
};

export function loadStoredRegion(): Region | null {
  if (typeof localStorage === "undefined") return null;
  const v = localStorage.getItem(REGION_KEY);
  return v && ["US","UK","AU","NZ","EU","ZA","OTHER"].includes(v) ? (v as Region) : null;
}

export function saveStoredRegion(region: Region) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(REGION_KEY, region);
}

export function locationForRegion(region: Region): UserLocation {
  const currency = regionToCurrency[region];
  const info = currencyData[currency] ?? { symbol: currency, rate: 1 };
  return {
    country: regionToCountry[region],
    countryCode: region === "UK" ? "GB" : region,
    city: "",
    currency,
    currencySymbol: info.symbol,
    exchangeRate: info.rate,
    region,
  };
}
