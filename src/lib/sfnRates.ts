/**
 * SFN-Zuschlagsprozentsätze (Sonntag, Feiertag, Nacht).
 * Steuerfrei nach §3b EStG bis zur jeweiligen Grundlohngrenze.
 */
export const SFN_RATES = {
  /** Nachtzuschlag: 25% des Grundlohns */
  night: 0.25,
  /** Sonntagszuschlag: 50% des Grundlohns */
  sunday: 0.50,
  /** Feiertagszuschlag: 125% des Grundlohns */
  holiday: 1.25,
} as const;

/** Grundlohngrenze für steuerfreie SFN-Zuschläge (2026): 50 €/h */
export const SFN_TAX_FREE_HOURLY_LIMIT = 50;
