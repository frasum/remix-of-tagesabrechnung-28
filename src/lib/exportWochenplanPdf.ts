import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
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

interface Week {
  id: string;
  week_number: number;
  start_date: string;
  end_date: string;
}

export function exportWochenplanPdf(
  periodLabel: string,
  employees: Employee[],
  allShifts: Shift[],
  weeks: Week[],
  holidays: Set<string>
) {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

  const sorted = [...employees].sort((a, b) => {
    const aIdx = DEPARTMENT_ORDER.indexOf(a.department as any);
    const bIdx = DEPARTMENT_ORDER.indexOf(b.department as any);
    if (aIdx !== bIdx) return aIdx - bIdx;
    const nameA = (a.nickname || a.first_name).toLowerCase();
    const nameB = (b.nickname || b.first_name).toLowerCase();
    return nameA.localeCompare(nameB, "de");
  });

  const sortedWeeks = [...weeks].sort((a, b) => a.week_number - b.week_number);

  sortedWeeks.forEach((week, pageIdx) => {
    if (pageIdx > 0) doc.addPage();

    const weekDays = eachDayOfInterval({
      start: startOfWeek(parseISO(week.start_date), { weekStartsOn: 1 }),
      end: endOfWeek(parseISO(week.start_date), { weekStartsOn: 1 }),
    });
    const activeDates = new Set(
      eachDayOfInterval({ start: parseISO(week.start_date), end: parseISO(week.end_date) })
        .map((d) => format(d, "yyyy-MM-dd"))
    );

    const weekShifts = allShifts.filter((s) => activeDates.has(s.shift_date));

    // Only include employees that have at least one meaningful shift in this week
    const activeEmpIds = new Set(weekShifts.filter((s) => Number(s.total_hours) > 0 || !!s.absence_type).map((s) => s.employee_id));
    const weekEmployees = sorted.filter((emp) => activeEmpIds.has(emp.id));

    doc.setFontSize(12);
    doc.text(
      `${periodLabel} – Woche ${week.week_number} (${format(parseISO(week.start_date), "dd.MM.yyyy", { locale: de })} – ${format(parseISO(week.end_date), "dd.MM.yyyy", { locale: de })})`,
      14, 12
    );

    // Build day headers
    const dayHeaders = weekDays.map((d) => {
      const dateStr = format(d, "yyyy-MM-dd");
      const isHoliday = holidays.has(dateStr) || d.getDay() === 0;
      const label = format(d, "EEE dd.MM", { locale: de });
      return isHoliday ? label + " (F)" : label;
    });

    const head = [
      [
        { content: "Mitarbeiter", rowSpan: 2 },
        ...dayHeaders.map((h) => ({ content: h, colSpan: 2 })),
        { content: "Ges.", rowSpan: 2 },
        { content: "So/F", rowSpan: 2 },
        { content: "20-24", rowSpan: 2 },
        { content: "24-x", rowSpan: 2 },
        { content: "U", rowSpan: 2 },
        { content: "K", rowSpan: 2 },
      ],
      [
        ...weekDays.flatMap(() => ["Von", "Bis"]),
      ],
    ];

    const rows: any[][] = [];
    let lastDept = "";

    for (const emp of weekEmployees) {
      if (emp.department !== lastDept) {
      const colCount = 1 + weekDays.length * 2 + 6;
      rows.push([{ content: emp.department, colSpan: colCount, styles: { fontStyle: "bold", fillColor: [230, 230, 230] } }]);
        lastDept = emp.department;
      }

      const row: any[] = [
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
        const shift = weekShifts.find((s) => s.employee_id === emp.id && s.shift_date === dateStr);
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

    autoTable(doc, {
      startY: 16,
      head: head as any,
      body: rows,
      styles: { fontSize: 6, cellPadding: 1 },
      headStyles: { fillColor: [60, 60, 60], fontSize: 6 },
      columnStyles: {
        0: { cellWidth: 28 },
      },
      theme: "grid",
    });
  });

  doc.save(`Wochenplan_${periodLabel.replace(/\s+/g, "_")}.pdf`);
}
