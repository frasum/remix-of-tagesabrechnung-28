import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import type { ReactNode } from "react";
import type { SfnMode } from "@/hooks/useSfnMode";

type SfnColumn = "soFei" | "sonntag" | "feiertag" | "evening" | "night";

const SIMPLE_TEXT: Record<SfnColumn, string> = {
  soFei: "50 % Sonn- und Feiertagszuschlag",
  sonntag: "50 % Sonntagszuschlag",
  feiertag: "125 % / 150 % Feiertagszuschlag (§3b EStG)",
  evening: "25 % Nachtzuschlag",
  night: "40 % Nachtzuschlag",
};

const EXTENDED_CONTENT: Record<SfnColumn, ReactNode> = {
  soFei: "50 % Sonn- und Feiertagszuschlag",
  sonntag: (
    <div className="space-y-1.5">
      <p className="font-semibold">50 % Sonntagszuschlag (§3b EStG)</p>
      <p className="text-muted-foreground">Wird mit Nachtzuschlägen gestapelt. Nachtstunden an Sonntagen erhalten beide Zuschläge.</p>
    </div>
  ),
  feiertag: (
    <div className="space-y-1.5">
      <p className="font-semibold">125 % Feiertagszuschlag</p>
      <p className="text-muted-foreground"><span className="font-medium text-foreground">150 %</span> für besondere Feiertage (1. Mai, 25./26.12.)</p>
      <p className="text-muted-foreground">Wird mit Nachtzuschlägen gestapelt.</p>
    </div>
  ),
  evening: (
    <div className="space-y-1.5">
      <p className="font-semibold">25 % Nachtzuschlag (20:00–00:00)</p>
      <p className="text-muted-foreground">Gilt additiv zu Sonntags- und Feiertagszuschlägen.</p>
      <p className="text-muted-foreground italic">Beispiel Sonntagsnachtschicht: 50 % (So) + 25 % (Nacht) = 75 % Zuschlag</p>
    </div>
  ),
  night: (
    <div className="space-y-1.5">
      <p className="font-semibold">40 % Nachtzuschlag (00:00–04:00)</p>
      <p className="text-muted-foreground">Gilt additiv zu Sonntags- und Feiertagszuschlägen.</p>
      <p className="text-muted-foreground italic">Beispiel Sonntagsnachtschicht: 50 % (So) + 40 % (Nacht) = 90 % Zuschlag</p>
    </div>
  ),
};

interface Props {
  column: SfnColumn;
  label: string;
  className?: string;
  sfnMode?: SfnMode;
}

export default function SfnTooltipHeader({ column, label, className, sfnMode = "simple" }: Props) {
  const isExtended = sfnMode === "extended";
  const content = isExtended ? EXTENDED_CONTENT[column] : <p>{SIMPLE_TEXT[column]}</p>;

  return (
    <HoverCard openDelay={200}>
      <HoverCardTrigger asChild>
        <span className={`cursor-help underline decoration-dotted underline-offset-4 ${className ?? ""}`}>{label}</span>
      </HoverCardTrigger>
      <HoverCardContent side="bottom" className={`w-auto p-3 text-xs ${isExtended ? "min-w-[280px]" : "min-w-[120px]"}`}>
        {content}
      </HoverCardContent>
    </HoverCard>
  );
}
