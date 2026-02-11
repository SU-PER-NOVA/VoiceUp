import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { adminAPI } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const statusOptions = [
  { value: "all", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "under_review", label: "Under Review" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
  { value: "rejected", label: "Rejected" },
];

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "secondary",
  under_review: "default",
  in_progress: "default",
  resolved: "outline",
  rejected: "destructive",
};

export default function AdminGrievances() {
  const [searchParams, setSearchParams] = useSearchParams();
  const statusFilter = searchParams.get("status") ?? "all";
  const searchQuery = searchParams.get("search") ?? "";

  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    adminAPI
      .getGrievances({
        status: statusFilter && statusFilter !== "all" ? statusFilter : undefined,
        search: searchQuery || undefined,
        ordering: "-created_at",
      })
      .then((r) => setList(r.results))
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  }, [statusFilter, searchQuery]);

  const setSearch = (v: string) => {
    const next = new URLSearchParams(searchParams);
    if (v) next.set("search", v);
    else next.delete("search");
    setSearchParams(next);
  };

  const setStatus = (v: string) => {
    const next = new URLSearchParams(searchParams);
    if (v && v !== "all") next.set("status", v);
    else next.delete("status");
    setSearchParams(next);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Grievances</h1>
        <p className="text-muted-foreground">Review and manage all submitted issues</p>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by title or description..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatus}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-12 text-center text-muted-foreground">Loading...</div>
          ) : list.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">No grievances found.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((g) => (
                  <TableRow key={g.id}>
                    <TableCell className="font-medium max-w-[200px] truncate" title={g.title}>
                      {g.title}
                    </TableCell>
                    <TableCell>{g.category_name ?? g.category?.name ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {[g.location?.city, g.location?.state].filter(Boolean).join(", ") || "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[g.status] ?? "secondary"}>{g.status}</Badge>
                    </TableCell>
                    <TableCell>{g.score ?? g.upvotes_count - g.downvotes_count}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {g.created_at
                        ? formatDistanceToNow(new Date(g.created_at), { addSuffix: true })
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <Link to={`/admin/grievances/${g.id}`}>
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
