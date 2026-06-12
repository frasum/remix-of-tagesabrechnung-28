import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { GlobalLayout } from "@/components/layout/GlobalLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  ordersmart_in_takeaway: boolean;
  initial_cash_deficit: number | null;
  created_at: string;
}

const restaurantSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name ist erforderlich")
    .max(100, "Max. 100 Zeichen"),
  slug: z
    .string()
    .trim()
    .min(1, "Slug ist erforderlich")
    .max(60, "Max. 60 Zeichen")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Nur Kleinbuchstaben, Ziffern und Bindestriche"
    ),
  ordersmart_in_takeaway: z.boolean(),
  initial_cash_deficit: z.number().finite(),
});

type FormState = z.infer<typeof restaurantSchema>;

const emptyForm: FormState = {
  name: "",
  slug: "",
  ordersmart_in_takeaway: true,
  initial_cash_deficit: 0,
};

function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export default function RestaurantManagement() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Restaurant | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [slugTouched, setSlugTouched] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<Restaurant | null>(null);

  const { data: restaurants, isLoading } = useQuery({
    queryKey: ["admin", "restaurants"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("restaurants")
        .select("*")
        .order("name");
      if (error) throw error;
      return (data ?? []) as Restaurant[];
    },
  });

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setSlugTouched(false);
    setErrors({});
    setDialogOpen(true);
  };

  const openEdit = (r: Restaurant) => {
    setEditing(r);
    setForm({
      name: r.name,
      slug: r.slug,
      ordersmart_in_takeaway: r.ordersmart_in_takeaway,
      initial_cash_deficit: Number(r.initial_cash_deficit ?? 0),
    });
    setSlugTouched(true);
    setErrors({});
    setDialogOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: async (values: FormState) => {
      if (editing) {
        const { error } = await supabase
          .from("restaurants")
          .update(values)
          .eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("restaurants").insert([values]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "restaurants"] });
      queryClient.invalidateQueries({ queryKey: ["restaurants"] });
      queryClient.invalidateQueries({ queryKey: ["restaurant"] });
      toast({
        title: editing ? "Restaurant aktualisiert" : "Restaurant angelegt",
      });
      setDialogOpen(false);
    },
    onError: (err: any) => {
      const msg = err?.message ?? "Unbekannter Fehler";
      toast({
        variant: "destructive",
        title: "Speichern fehlgeschlagen",
        description: msg.includes("duplicate") || msg.includes("unique")
          ? "Der Slug ist bereits vergeben."
          : msg,
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("restaurants").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "restaurants"] });
      queryClient.invalidateQueries({ queryKey: ["restaurants"] });
      toast({ title: "Restaurant gelöscht" });
      setDeleteTarget(null);
    },
    onError: (err: any) => {
      toast({
        variant: "destructive",
        title: "Löschen fehlgeschlagen",
        description:
          err?.message?.includes("violates foreign key")
            ? "Restaurant hat noch verknüpfte Daten (Sessions, Mitarbeiter…)."
            : err?.message ?? "Unbekannter Fehler",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = restaurantSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((i) => {
        fieldErrors[i.path[0] as string] = i.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    saveMutation.mutate(parsed.data);
  };

  return (
    <GlobalLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Restaurants</h1>
            <p className="text-sm text-muted-foreground">
              Standorte anlegen, bearbeiten und entfernen.
            </p>
          </div>
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Neues Restaurant
          </Button>
        </div>

        <Card className="overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : !restaurants || restaurants.length === 0 ? (
            <div className="py-16 text-center text-sm text-muted-foreground">
              Noch keine Restaurants angelegt.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>OrderSmart in Takeaway</TableHead>
                  <TableHead className="text-right">Initial-Defizit</TableHead>
                  <TableHead className="w-[120px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {restaurants.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.name}</TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                        {r.slug}
                      </code>
                    </TableCell>
                    <TableCell>
                      <Badge variant={r.ordersmart_in_takeaway ? "default" : "outline"}>
                        {r.ordersmart_in_takeaway ? "Ja" : "Nein"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {Number(r.initial_cash_deficit ?? 0).toLocaleString("de-DE", {
                        style: "currency",
                        currency: "EUR",
                      })}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(r)}
                          aria-label="Bearbeiten"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteTarget(r)}
                          aria-label="Löschen"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Restaurant bearbeiten" : "Neues Restaurant"}
            </DialogTitle>
            <DialogDescription>
              Der Slug wird in der URL verwendet (z. B. <code>/spicery</code>).
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => {
                  const name = e.target.value;
                  setForm((f) => ({
                    ...f,
                    name,
                    slug: slugTouched ? f.slug : slugify(name),
                  }));
                }}
                maxLength={100}
                autoFocus
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={form.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setForm((f) => ({ ...f, slug: e.target.value.toLowerCase() }));
                }}
                maxLength={60}
                placeholder="spicery-schwabing"
              />
              {errors.slug && (
                <p className="text-xs text-destructive">{errors.slug}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="deficit">Initial Kassendefizit (€)</Label>
              <Input
                id="deficit"
                type="number"
                step="0.01"
                value={form.initial_cash_deficit}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    initial_cash_deficit: parseFloat(e.target.value) || 0,
                  }))
                }
              />
            </div>

            <div className="flex items-center justify-between rounded-md border p-3">
              <div className="space-y-0.5">
                <Label htmlFor="osta">OrderSmart in Takeaway</Label>
                <p className="text-xs text-muted-foreground">
                  OrderSmart-Umsatz im Takeaway-Total enthalten.
                </p>
              </div>
              <Switch
                id="osta"
                checked={form.ordersmart_in_takeaway}
                onCheckedChange={(checked) =>
                  setForm((f) => ({ ...f, ordersmart_in_takeaway: checked }))
                }
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={saveMutation.isPending}
              >
                Abbrechen
              </Button>
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                {editing ? "Speichern" : "Anlegen"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restaurant löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              „{deleteTarget?.name}" wird unwiderruflich entfernt. Falls bereits
              Sessions oder Mitarbeiter verknüpft sind, schlägt das Löschen fehl.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Abbrechen
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                if (deleteTarget) deleteMutation.mutate(deleteTarget.id);
              }}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </GlobalLayout>
  );
}
