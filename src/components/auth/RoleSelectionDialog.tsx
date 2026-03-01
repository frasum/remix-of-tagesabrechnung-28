import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Utensils, ClipboardList } from 'lucide-react';

export type ActiveRole = 'waiter' | 'kitchen' | 'gl';

interface RoleOption {
  value: ActiveRole;
  label: string;
  icon: React.ReactNode;
}

/**
 * Returns the role options a staff member can pick from based on their DB role.
 * Returns null if no selection is needed (single-role staff).
 */
export function getRoleOptions(staffRole: string): RoleOption[] | null {
  switch (staffRole) {
    case 'waiter_gl':
      return [
        { value: 'waiter', label: 'Service', icon: <Utensils className="w-5 h-5" /> },
        { value: 'gl', label: 'GL', icon: <ClipboardList className="w-5 h-5" /> },
      ];
    case 'kitchen_gl':
      return [
        { value: 'kitchen', label: 'Küche', icon: <Utensils className="w-5 h-5" /> },
        { value: 'gl', label: 'GL', icon: <ClipboardList className="w-5 h-5" /> },
      ];
    case 'both':
      return [
        { value: 'waiter', label: 'Service', icon: <Utensils className="w-5 h-5" /> },
        { value: 'kitchen', label: 'Küche', icon: <Utensils className="w-5 h-5" /> },
      ];
    case 'all':
      return [
        { value: 'waiter', label: 'Service', icon: <Utensils className="w-5 h-5" /> },
        { value: 'kitchen', label: 'Küche', icon: <Utensils className="w-5 h-5" /> },
        { value: 'gl', label: 'GL', icon: <ClipboardList className="w-5 h-5" /> },
      ];
    default:
      return null;
  }
}

interface RoleSelectionDialogProps {
  open: boolean;
  staffName: string;
  options: RoleOption[];
  onSelect: (role: ActiveRole) => void;
}

export function RoleSelectionDialog({ open, staffName, options, onSelect }: RoleSelectionDialogProps) {
  const [selected, setSelected] = useState<ActiveRole>(options[0]?.value ?? 'waiter');

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-sm" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Bereich wählen</DialogTitle>
          <DialogDescription>
            {staffName}, in welchem Bereich arbeitest du heute?
          </DialogDescription>
        </DialogHeader>

        <RadioGroup
          value={selected}
          onValueChange={(v) => setSelected(v as ActiveRole)}
          className="gap-3 my-4"
        >
          {options.map((opt) => (
            <Label
              key={opt.value}
              htmlFor={`role-${opt.value}`}
              className={`flex items-center gap-3 rounded-lg border p-4 cursor-pointer transition-colors
                ${selected === opt.value ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'}`}
            >
              <RadioGroupItem value={opt.value} id={`role-${opt.value}`} />
              {opt.icon}
              <span className="text-base font-medium">{opt.label}</span>
            </Label>
          ))}
        </RadioGroup>

        <Button className="w-full" onClick={() => onSelect(selected)}>
          Weiter
        </Button>
      </DialogContent>
    </Dialog>
  );
}
