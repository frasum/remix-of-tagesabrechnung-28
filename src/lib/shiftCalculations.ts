/**
 * Core shift hour calculation logic.
 * Handles midnight crossover, evening/night splits, and Sunday/holiday detection.
 */

export interface ShiftHours {
  totalHours: number;
  sundayHolidayHours: number;
  eveningHours: number; // 20:00–24:00
  nightHours: number;   // 00:00–end (after midnight)
}

/**
 * Parse a time string "HH:MM" to minutes since midnight.
 */
function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

/**
 * Calculate hours in a range that overlap with a target range.
 * All values in minutes since midnight (0–1440 for a single day).
 */
function overlapMinutes(
  shiftStart: number,
  shiftEnd: number,
  rangeStart: number,
  rangeEnd: number
): number {
  const start = Math.max(shiftStart, rangeStart);
  const end = Math.min(shiftEnd, rangeEnd);
  return Math.max(0, end - start);
}

/**
 * Calculate all hour categories for a shift.
 * @param startTime - "HH:MM" format
 * @param endTime - "HH:MM" format (if before startTime, crosses midnight)
 * @param isSundayOrHoliday - whether the shift date is a Sunday or Feiertag
 */
export function calculateShiftHours(
  startTime: string | null,
  endTime: string | null,
  isSundayOrHoliday: boolean
): ShiftHours {
  if (!startTime || !endTime) {
    return { totalHours: 0, sundayHolidayHours: 0, eveningHours: 0, nightHours: 0 };
  }

  const startMin = timeToMinutes(startTime);
  const endMin = timeToMinutes(endTime);

  // Total hours
  let totalMinutes: number;
  if (endMin > startMin) {
    totalMinutes = endMin - startMin;
  } else {
    // Midnight crossover
    totalMinutes = (1440 - startMin) + endMin;
  }

  const totalHours = Math.round((totalMinutes / 60) * 100) / 100;

  // Evening hours: 20:00–24:00 (1200–1440 minutes)
  let eveningMinutes = 0;
  // Night hours: 00:00–end (0–endMin, only if crosses midnight)
  let nightMinutes = 0;

  if (endMin > startMin) {
    // No midnight crossover
    eveningMinutes = overlapMinutes(startMin, endMin, 1200, 1440);
  } else {
    // Midnight crossover: split into two parts
    // Part 1: startMin to midnight (1440)
    eveningMinutes = overlapMinutes(startMin, 1440, 1200, 1440);
    // Part 2: midnight (0) to endMin — all night hours
    nightMinutes = endMin; // 00:00 to endMin
  }

  const eveningHours = Math.round((eveningMinutes / 60) * 100) / 100;
  const nightHours = Math.round((nightMinutes / 60) * 100) / 100;

  // Sunday/Holiday hours = total hours if the date is a Sunday or holiday
  const sundayHolidayHours = isSundayOrHoliday ? totalHours : 0;

  return { totalHours, sundayHolidayHours, eveningHours, nightHours };
}

/**
 * Check if a date is a Sunday.
 */
export function isSunday(date: Date): boolean {
  return date.getDay() === 0;
}

/**
 * Format hours for display (e.g., 7.5 → "7,50")
 */
export function formatHours(hours: number): string {
  return hours.toFixed(2).replace(".", ",");
}

/**
 * Department display order
 */
export const DEPARTMENT_ORDER = ["Küche", "GL", "Service"] as const;

/**
 * Count vacation days (angerechnet) from shifts with absence_type === 'urlaub'.
 * Uses the 5/7 factor: 7 calendar days = 5 vacation days.
 */
export function countVacationDays(
  shifts: { absence_type?: string | null; week_id?: string; start_time?: string | null; end_time?: string | null }[]
): number {
  const byWeek: Record<string, typeof shifts> = {};
  for (const s of shifts) {
    const wk = s.week_id ?? "unknown";
    (byWeek[wk] ??= []).push(s);
  }

  let total = 0;
  for (const weekShifts of Object.values(byWeek)) {
    const vacDays = weekShifts.filter(s => s.absence_type === 'urlaub').length;
    const workDays = weekShifts.filter(s => s.start_time && s.end_time && !s.absence_type).length;
    const freeDays = 7 - workDays - vacDays;
    const overlap = Math.max(0, 2 - freeDays);
    total += Math.max(0, vacDays - overlap);
  }
  return Math.round(total * 100) / 100;
}

/**
 * Count sick days from shifts with absence_type === 'krank'.
 * All calendar days count 1:1.
 */
export function countSickDays(shifts: { absence_type?: string | null }[]): number {
  return shifts.filter(s => s.absence_type === 'krank').length;
}

/**
 * Get sick date ranges from shifts grouped into consecutive day ranges.
 * Returns array of { from: string (yyyy-MM-dd), to: string (yyyy-MM-dd) }.
 */
export function getSickDateRanges(
  shifts: { absence_type?: string | null; shift_date?: string }[]
): { from: string; to: string }[] {
  const sickDates = shifts
    .filter(s => s.absence_type === 'krank' && s.shift_date)
    .map(s => s.shift_date!)
    .sort();

  if (!sickDates.length) return [];

  const ranges: { from: string; to: string }[] = [];
  let from = sickDates[0];
  let prev = sickDates[0];

  for (let i = 1; i < sickDates.length; i++) {
    const curr = sickDates[i];
    const prevDate = new Date(prev);
    const currDate = new Date(curr);
    const diffDays = (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays <= 1) {
      prev = curr;
    } else {
      ranges.push({ from, to: prev });
      from = curr;
      prev = curr;
    }
  }
  ranges.push({ from, to: prev });
  return ranges;
}

/**
 * Format sick date ranges for display.
 * E.g. "25.02." or "25.02.–28.02. (4T)"
 */
export function formatSickRanges(ranges: { from: string; to: string }[]): string[] {
  return ranges.map(r => {
    const fromDate = new Date(r.from);
    const toDate = new Date(r.to);
    const fmtDay = (d: Date) =>
      `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.`;
    if (r.from === r.to) return fmtDay(fromDate);
    const days = Math.round((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return `${fmtDay(fromDate)}–${fmtDay(toDate)} (${days}T)`;
  });
}

/**
 * Department color class mapping
 */
export function getDepartmentColorClass(dept: string): string {
  switch (dept) {
    case "Küche": return "dept-kueche";
    case "GL": return "dept-gl";
    case "Service": return "dept-service";
    default: return "";
  }
}

export function getDepartmentBgClass(dept: string): string {
  switch (dept) {
    case "Küche": return "dept-kueche-light";
    case "GL": return "dept-gl-light";
    case "Service": return "dept-service-light";
    default: return "";
  }
}
