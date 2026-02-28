import XLSX from "xlsx-js-style";
import { formatHours, DEPARTMENT_ORDER, countVacationDays, countSickDays } from "./shiftCalculations";
import { format, parseISO, eachDayOfInterval, startOfWeek, endOfWeek } from "date-fns";
import { de } from "date-fns/locale";

interface Employee {
  id: string;
  perso_nr: number;
  first_name: string;
  last_name: string;
  nickname: string | null;
  department: string;
}

interface Shift {
  employee_id: string;
  shift_date: string;
  start_time: string | null;
  end_time: string | null;
  total_hours: number;
  sunday_holiday_hours: number;
  evening_hours: number;
  night_hours: number;
  absence_type?: string | null;
}

export function exportWochenplanExcel(
  periodLabel: string,
  weekNumber: number,
  employees: Employee[],
  shifts: Shift[],
  weekDays: Date[],
  activeDates: Set<string>
) {
  const wb = XLSX.utils.book_new();
  const ws = buildWeekSheet(employees, shifts, weekDays, activeDates);
  XLSX.utils.book_append_sheet(wb, ws, `Woche ${weekNumber}`);
  XLSX.writeFile(wb, `Wochenplan_${periodLabel.replace(/\s+/g, "_")}_W${weekNumber}.xlsx`);
}

interface Week {
  id: string;
  week_number: number;
  start_date: string;
  end_date: string;
}

export function exportPeriodeExcel(
  periodLabel: string,
  employees: Employee[],
  allShifts: Shift[],
  weeks: Week[],
  holidays: Set<string>
) {
  const wb = XLSX.utils.book_new();
  const sortedWeeks = [...weeks].sort((a, b) => a.week_number - b.week_number);

  for (const week of sortedWeeks) {
    const weekStart = startOfWeek(parseISO(week.start_date), { weekStartsOn: 1 });
    const weekEnd = endOfWeek(parseISO(week.start_date), { weekStartsOn: 1 });
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
    const activeDates = new Set(
      eachDayOfInterval({ start: parseISO(week.start_date), end: parseISO(week.end_date) })
        .map((d) => format(d, "yyyy-MM-dd"))
    );
    const weekShifts = allShifts.filter((s) => activeDates.has(s.shift_date));
    const ws = buildWeekSheet(employees, weekShifts, weekDays, activeDates);
    XLSX.utils.book_append_sheet(wb, ws, `Woche ${week.week_number}`);
  }

  XLSX.writeFile(wb, `Wochenplan_${periodLabel.replace(/\s+/g, "_")}.xlsx`);
}

function buildWeekSheet(
  employees: Employee[],
  shifts: Shift[],
  weekDays: Date[],
  activeDates: Set<string>
): XLSX.WorkSheet {
  const sorted = [...employees].sort((a, b) => {
    const aIdx = DEPARTMENT_ORDER.indexOf(a.department as any);
    const bIdx = DEPARTMENT_ORDER.indexOf(b.department as any);
    if (aIdx !== bIdx) return aIdx - bIdx;
    const nameA = (a.nickname || a.first_name).toLowerCase();
    const nameB = (b.nickname || b.first_name).toLowerCase();
    return nameA.localeCompare(nameB, "de");
  });

  // Only include employees that have at least one meaningful shift in this week
  const activeEmpIds = new Set(shifts.filter((s) => Number(s.total_hours) > 0 || !!s.absence_type).map((s) => s.employee_id));
  const filteredSorted = sorted.filter((emp) => activeEmpIds.has(emp.id));

  const getShift = (empId: string, date: string) =>
    shifts.find((s) => s.employee_id === empId && s.shift_date === date);

  // Header row 1: day labels merged over 2 columns
  const headerRow1: string[] = ["Mitarbeiter"];
  const headerRow2: string[] = [""];
  const merges: XLSX.Range[] = [];

  weekDays.forEach((d, i) => {
    const label = format(d, "EEE dd.MM", { locale: de });
    const colStart = 1 + i * 2;
    headerRow1.push(label, "");
    headerRow2.push("Von", "Bis");
    merges.push({ s: { r: 0, c: colStart }, e: { r: 0, c: colStart + 1 } });
  });

  headerRow1.push("Gesamt", "So/Fei", "20-24", "24-x", "U", "K");
  headerRow2.push("", "", "", "", "", "");

  const rows: (string | number)[][] = [headerRow1, headerRow2];

  let lastDept = "";
  for (const emp of filteredSorted) {
    if (emp.department !== lastDept) {
      const deptRow = new Array(headerRow1.length).fill("");
      deptRow[0] = emp.department;
      rows.push(deptRow);
      lastDept = emp.department;
    }

    const row: (string | number)[] = [
      `${emp.perso_nr} ${emp.nickname ? `${emp.nickname} - ` : ""}${emp.first_name} ${emp.last_name}`,
    ];

    let gesamt = 0, soFei = 0, evening = 0, night = 0;
    const empWeekShifts: Shift[] = [];

    for (const day of weekDays) {
      const dateStr = format(day, "yyyy-MM-dd");
      if (!activeDates.has(dateStr)) {
        row.push("", "");
        continue;
      }
      const shift = getShift(emp.id, dateStr);
      if (shift?.absence_type) {
        row.push(shift.absence_type === 'urlaub' ? 'U' : 'K', '');
        empWeekShifts.push(shift);
      } else {
        row.push(shift?.start_time?.slice(0, 5) ?? "");
        row.push(shift?.end_time?.slice(0, 5) ?? "");
      }
      if (shift) {
        gesamt += Number(shift.total_hours);
        soFei += Number(shift.sunday_holiday_hours);
        evening += Number(shift.evening_hours);
        night += Number(shift.night_hours);
        empWeekShifts.push(shift);
      }
    }

    row.push(formatHours(gesamt));
    row.push(soFei > 0 ? formatHours(soFei) : "");
    row.push(evening > 0 ? formatHours(evening) : "");
    row.push(night > 0 ? formatHours(night) : "");
    const u = countVacationDays(empWeekShifts);
    const k = countSickDays(empWeekShifts);
    row.push(u > 0 ? u.toFixed(2).replace('.', ',') : "");
    row.push(k > 0 ? String(k) : "");
    rows.push(row);
  }

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws["!merges"] = merges;
  ws["!cols"] = headerRow1.map((_, i) => ({ wch: i === 0 ? 30 : 12 }));

  // Center-align merged day headers (row 1)
  const centerStyle = { alignment: { horizontal: "center" as const } };
  for (let i = 0; i < weekDays.length; i++) {
    const col = 1 + i * 2;
    const cellRef = XLSX.utils.encode_cell({ r: 0, c: col });
    if (ws[cellRef]) ws[cellRef].s = centerStyle;
  }

  return ws;
}
