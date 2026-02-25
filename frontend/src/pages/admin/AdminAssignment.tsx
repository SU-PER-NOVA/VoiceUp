import { useEffect, useState } from "react";
import { adminAPI } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Users, Building2 } from "lucide-react";

export default function AdminAssignment() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [cats, staffList] = await Promise.all([
          adminAPI.getAssignmentCategories(),
          adminAPI.getStaff(),
        ]);
        setCategories(Array.isArray(cats) ? cats : []);
        setStaff(staffList ?? []);
      } catch {
        setCategories([]);
        setStaff([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleInitiatorChange = async (catId: number, initiatorId: number | null) => {
    setSaving(catId);
    try {
      await adminAPI.updateAssignmentCategory(catId, { initiator_admin: initiatorId ?? undefined });
      setCategories((prev) =>
        prev.map((c) =>
          c.id === catId ? { ...c, initiator_admin: initiatorId, initiator_admin_name: staff.find((s) => s.id === initiatorId)?.name } : c
        )
      );
      toast({ title: "Initiator updated" });
    } catch (e: any) {
      toast({ title: "Update failed", description: e.message, variant: "destructive" });
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <Card>
          <CardContent className="pt-6">
            <div className="h-48 animate-pulse rounded bg-muted" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Assignment Config</h1>
        <p className="text-muted-foreground">
          Configure which admin receives new issues by category. When a grievance is posted, it is
          auto-assigned to the initiator of its assignment category.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Assignment Categories
          </CardTitle>
          <CardDescription>
            5 buckets map issue categories to initiator admins. New issues are assigned to the
            initiator of their bucket.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {categories.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center">
              No assignment categories. Run: <code className="bg-muted px-1 rounded">python manage.py populate_assignment_categories</code>
            </p>
          ) : (
            categories.map((cat) => (
              <div
                key={cat.id}
                className="flex flex-col gap-3 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <h3 className="font-medium text-foreground">{cat.name}</h3>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {(cat.issue_categories ?? []).map((ic: any) => (
                      <Badge key={ic.id} variant="secondary" className="text-xs">
                        {ic.name}
                      </Badge>
                    ))}
                    {(!cat.issue_categories || cat.issue_categories.length === 0) && (
                      <span className="text-xs text-muted-foreground">No issue categories linked</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:w-64">
                  <Label className="text-sm shrink-0">Initiator:</Label>
                  <Select
                    value={cat.initiator_admin?.toString() ?? "none"}
                    onValueChange={(v) => handleInitiatorChange(cat.id, v === "none" ? null : parseInt(v))}
                    disabled={saving === cat.id || staff.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select admin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">— None —</SelectItem>
                      {staff.map((s) => (
                        <SelectItem key={s.id} value={s.id.toString()}>
                          {s.name} (@{s.username})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {saving === cat.id && (
                    <span className="text-xs text-muted-foreground">Saving...</span>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
