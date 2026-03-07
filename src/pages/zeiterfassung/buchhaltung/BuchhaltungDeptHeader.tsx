import { getDeptBorderClass } from "./utils";
import { getDepartmentBgClass } from "@/lib/shiftCalculations";
import type { SfnMode } from "@/hooks/useSfnMode";

interface BuchhaltungDeptHeaderProps {
  department: string;
  sfnMode?: SfnMode;
  showSfn?: boolean;
  showCommission?: boolean;
}

export default function BuchhaltungDeptHeader({ department, sfnMode = "simple", showSfn = true, showCommission = false }: BuchhaltungDeptHeaderProps) {
  const sfnCols = showSfn ? (sfnMode === "extended" ? 4 : 3) : 0;
  const colCount = 7 + sfnCols + (showCommission ? 1 : 0);
  return (
    <tr>
      <td
        colSpan={colCount}
        className={`px-3 py-2.5 font-bold text-sm uppercase tracking-wide border-l-4 ${getDeptBorderClass(department)} ${getDepartmentBgClass(department)}`}
      >
        {department}
      </td>
    </tr>
  );
}
