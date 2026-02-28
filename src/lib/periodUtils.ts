import { supabase } from "@/integrations/supabase/client";
import { addDays } from "date-fns";

const MONTH_NAMES = [
  "Januar", "Februar", "März", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember",
];

function formatLocalDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function getPeriodRange(month: number, year: number) {
  const start = new Date(year, month - 2, 26);
  const end = new Date(year, month - 1, 25);
  const label = `${MONTH_NAMES[month - 1]} ${year}`;
  return { start, end, label };
}

function generateWeeks(periodId: string, start: Date, end: Date) {
  const weeks: { period_id: string; week_number: number; start_date: string; end_date: string }[] = [];
  let weekStart = new Date(start);
  let weekNum = 1;
  while (weekStart <= end) {
    let weekEnd: Date;
    if (weekNum === 1 && weekStart.getDay() !== 1) {
      const dayOfWeek = weekStart.getDay();
      const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
      weekEnd = addDays(weekStart, daysUntilSunday);
    } else {
      weekEnd = addDays(weekStart, 6);
    }
    const clampedEnd = weekEnd > end ? end : weekEnd;
    weeks.push({
      period_id: periodId,
      week_number: weekNum,
      start_date: formatLocalDate(weekStart),
      end_date: formatLocalDate(clampedEnd),
    });
    weekStart = addDays(clampedEnd, 1);
    weekNum++;
  }
  return weeks;
}

export async function ensurePeriodsExist(restaurantId: string, pastMonths = 1, futureMonths = 3) {
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();

  const targets: { month: number; year: number }[] = [];
  for (let offset = -pastMonths; offset <= futureMonths; offset++) {
    let m = currentMonth + offset;
    let y = currentYear;
    while (m < 1) { m += 12; y--; }
    while (m > 12) { m -= 12; y++; }
    targets.push({ month: m, year: y });
  }

  const { data: existing, error } = await supabase
    .from("scheduling_periods")
    .select("start_date")
    .eq("restaurant_id", restaurantId);
  if (error) throw error;

  const existingStartDates = new Set(existing?.map((p) => p.start_date) ?? []);

  for (const { month, year } of targets) {
    const { start, end, label } = getPeriodRange(month, year);
    const startStr = formatLocalDate(start);

    if (existingStartDates.has(startStr)) continue;

    const { data: period, error: periodError } = await supabase
      .from("scheduling_periods")
      .insert({
        label,
        start_date: startStr,
        end_date: formatLocalDate(end),
        restaurant_id: restaurantId,
      })
      .select()
      .single();
    if (periodError) throw periodError;

    const weeks = generateWeeks(period.id, start, end);
    const { error: weekError } = await supabase.from("weeks").insert(weeks);
    if (weekError) throw weekError;
  }
}
