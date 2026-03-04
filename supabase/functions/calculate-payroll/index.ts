const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/** SFN rates mirrored from src/lib/sfnRates.ts */
const SFN_RATES = { night: 0.25, sunday: 0.50, holiday: 1.25 };
const SFN_TAX_FREE_HOURLY_LIMIT = 50;

const CHURCH_TAX_9_STATES = ["Bayern", "Baden-Württemberg"];

/**
 * Simplified 2026 German income tax (Lohnsteuer) monthly estimate.
 * Uses progressive tax brackets applied to annual taxable income.
 */
function calcIncomeTax(annualGross: number, taxClass: string, childAllowances: number): number {
  // Basic allowances (2026 estimates)
  let grundfreibetrag = 12_096; // 2026 projected
  let sonderausgaben = 36; // Sonderausgabenpauschale
  let werbungskosten = 1_230;
  let childFreibetrag = childAllowances * 4_800; // Kinderfreibetrag per half-child

  // Adjust by tax class
  switch (taxClass) {
    case "II":
      grundfreibetrag += 4_260; // Entlastungsbetrag Alleinerziehende
      break;
    case "III":
      grundfreibetrag *= 2;
      break;
    case "V":
      grundfreibetrag = 0;
      childFreibetrag = 0;
      break;
    case "VI":
      grundfreibetrag = 0;
      sonderausgaben = 0;
      werbungskosten = 0;
      childFreibetrag = 0;
      break;
  }

  const taxableIncome = Math.max(0, annualGross - grundfreibetrag - sonderausgaben - werbungskosten - childFreibetrag);

  // 2026 progressive brackets (simplified)
  let tax = 0;
  if (taxableIncome <= 0) {
    tax = 0;
  } else if (taxableIncome <= 17_442) {
    // Zone 2: ~14% entry, linearly rising
    const y = (taxableIncome - 1) / 10_000;
    tax = (932.30 * y + 1_400) * y;
  } else if (taxableIncome <= 68_480) {
    // Zone 3
    const z = (taxableIncome - 17_442) / 10_000;
    tax = (176.46 * z + 2_397) * z + 3_014;
  } else if (taxableIncome <= 277_826) {
    tax = 0.42 * taxableIncome - 10_636;
  } else {
    tax = 0.45 * taxableIncome - 18_971;
  }

  // For class III, divide annual tax differently (simplified: already handled via doubled Grundfreibetrag)
  let annualTax = Math.max(0, Math.round(tax));

  return Math.round((annualTax / 12) * 100) / 100;
}

function calcSoli(incomeTax: number): number {
  const monthlyFreigrenze = 1_340 / 12; // ~111.67 monthly
  if (incomeTax <= monthlyFreigrenze) return 0;
  // Milderungszone up to ~1,780/12/month
  const milderung = 1_780 / 12;
  if (incomeTax <= milderung) {
    return Math.round((incomeTax - monthlyFreigrenze) * 0.119 * 100) / 100;
  }
  return Math.round(incomeTax * 0.055 * 100) / 100;
}

function calcChurchTax(incomeTax: number, state: string): number {
  const rate = CHURCH_TAX_9_STATES.includes(state) ? 0.08 : 0.09;
  return Math.round(incomeTax * rate * 100) / 100;
}

interface SocialContributions {
  kv: number;
  rv: number;
  av: number;
  pv: number;
}

function calcEmployeeContributions(gross: number, insuranceType: string, childAllowances: number): SocialContributions {
  // 2026 rates (approximate)
  const kvRate = insuranceType === "gesetzlich" ? 0.073 + 0.009 : 0; // 7.3% + ~0.9% Zusatzbeitrag
  const rvRate = 0.093;
  const avRate = 0.013;
  let pvRate = 0.017;
  // Zuschlag für Kinderlose ab 23 Jahre (vereinfacht: wenn 0 Kinder)
  if (childAllowances === 0) pvRate += 0.006;
  // Abschlag für Kinder: -0.25% pro Kind ab dem 2. bis zum 5.
  if (childAllowances >= 2) pvRate -= Math.min(childAllowances - 1, 4) * 0.0025;
  pvRate = Math.max(pvRate, 0);

  // Beitragsbemessungsgrenzen (2026, monatlich, West)
  const bbgKvMonthly = 5_512.50;
  const bbgRvMonthly = 8_050;

  const kvBasis = Math.min(gross, bbgKvMonthly);
  const rvBasis = Math.min(gross, bbgRvMonthly);

  return {
    kv: Math.round(kvBasis * kvRate * 100) / 100,
    rv: Math.round(rvBasis * rvRate * 100) / 100,
    av: Math.round(rvBasis * avRate * 100) / 100,
    pv: Math.round(kvBasis * pvRate * 100) / 100,
  };
}

function calcEmployerContributions(gross: number, insuranceType: string): SocialContributions {
  const kvRate = insuranceType === "gesetzlich" ? 0.073 + 0.0045 : 0; // 7.3% + half Zusatzbeitrag
  const rvRate = 0.093;
  const avRate = 0.013;
  const pvRate = 0.017;

  const bbgKvMonthly = 5_512.50;
  const bbgRvMonthly = 8_050;

  const kvBasis = Math.min(gross, bbgKvMonthly);
  const rvBasis = Math.min(gross, bbgRvMonthly);

  return {
    kv: Math.round(kvBasis * kvRate * 100) / 100,
    rv: Math.round(rvBasis * rvRate * 100) / 100,
    av: Math.round(rvBasis * avRate * 100) / 100,
    pv: Math.round(kvBasis * pvRate * 100) / 100,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const {
      grossMonthly,
      hourlyRate,
      monthlyHours,
      taxClass = "I",
      state = "Bayern",
      churchTax = false,
      insuranceType = "gesetzlich",
      childAllowances = 0,
      sfnHours = { night: 0, sunday: 0, holiday: 0 },
      sfnHourlyRate = 0,
    } = body;

    // Determine gross
    let gross: number;
    if (grossMonthly && grossMonthly > 0) {
      gross = grossMonthly;
    } else if (hourlyRate && monthlyHours) {
      gross = hourlyRate * monthlyHours;
    } else {
      return new Response(
        JSON.stringify({ error: "Bruttogehalt oder Stundenlohn + Monatsstunden erforderlich." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    gross = Math.round(gross * 100) / 100;

    // Tax calculations
    const annualGross = gross * 12;
    const incomeTax = calcIncomeTax(annualGross, taxClass, childAllowances);
    const soli = calcSoli(incomeTax);
    const churchTaxAmount = churchTax ? calcChurchTax(incomeTax, state) : 0;

    // Social contributions
    const employee = calcEmployeeContributions(gross, insuranceType, childAllowances);
    const employer = calcEmployerContributions(gross, insuranceType);

    const totalEmployeeDeductions = incomeTax + soli + churchTaxAmount + employee.kv + employee.rv + employee.av + employee.pv;
    const netMonthly = Math.round((gross - totalEmployeeDeductions) * 100) / 100;

    const employerTotal = Math.round((gross + employer.kv + employer.rv + employer.av + employer.pv) * 100) / 100;

    // SFN bonuses (tax-free up to limit)
    const effectiveSfnRate = Math.min(sfnHourlyRate, SFN_TAX_FREE_HOURLY_LIMIT);
    const nightBonus = Math.round(sfnHours.night * effectiveSfnRate * SFN_RATES.night * 100) / 100;
    const sundayBonus = Math.round(sfnHours.sunday * effectiveSfnRate * SFN_RATES.sunday * 100) / 100;
    const holidayBonus = Math.round(sfnHours.holiday * effectiveSfnRate * SFN_RATES.holiday * 100) / 100;
    const totalBonus = Math.round((nightBonus + sundayBonus + holidayBonus) * 100) / 100;

    // Effective net hourly rate
    const totalHours = monthlyHours || (hourlyRate ? gross / hourlyRate : 0);
    const effectiveNetHourlyRate = totalHours > 0
      ? Math.round(((netMonthly + totalBonus) / totalHours) * 100) / 100
      : 0;

    const result = {
      grossMonthly: gross,
      netMonthly,
      incomeTax,
      soli,
      churchTax: churchTaxAmount,
      employee,
      employer,
      employerTotal,
      sfn: { nightBonus, sundayBonus, holidayBonus, totalBonus },
      effectiveNetHourlyRate,
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e.message || "Interner Fehler" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
