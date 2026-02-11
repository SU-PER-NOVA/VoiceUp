import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { adminAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, MapPin, User, MessageSquare, Eye, Star, ShieldCheck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "under_review", label: "Under Review" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
  { value: "rejected", label: "Rejected" },
];

export default function AdminGrievanceDetail() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [issue, setIssue] = useState<any>(null);
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [noteType, setNoteType] = useState<"internal" | "public_response">("internal");
  const [submittingNote, setSubmittingNote] = useState(false);

  const load = async () => {
    if (!id) return;
    try {
      const [detail, notesList] = await Promise.all([
        adminAPI.getGrievance(Number(id)),
        adminAPI.getNotes(Number(id)),
      ]);
      setIssue(detail);
      setNotes(notesList);
    } catch {
      setIssue(null);
      setNotes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const handleStatusChange = async (status: string) => {
    if (!issue) return;
    setUpdating(true);
    try {
      const updated = await adminAPI.updateGrievance(issue.id, { status });
      setIssue(updated);
      toast({ title: "Status updated" });
    } catch (e: any) {
      toast({ title: "Update failed", description: e.message, variant: "destructive" });
    } finally {
      setUpdating(false);
    }
  };

  const handleFeaturedChange = async (checked: boolean) => {
    if (!issue) return;
    setUpdating(true);
    try {
      const updated = await adminAPI.updateGrievance(issue.id, { is_featured: checked });
      setIssue(updated);
      toast({ title: checked ? "Featured" : "Unfeatured" });
    } catch (e: any) {
      toast({ title: "Update failed", description: e.message, variant: "destructive" });
    } finally {
      setUpdating(false);
    }
  };

  const handleVerifiedChange = async (checked: boolean) => {
    if (!issue) return;
    setUpdating(true);
    try {
      const updated = await adminAPI.updateGrievance(issue.id, { is_verified: checked });
      setIssue(updated);
      toast({ title: checked ? "Marked verified" : "Unverified" });
    } catch (e: any) {
      toast({ title: "Update failed", description: e.message, variant: "destructive" });
    } finally {
      setUpdating(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim() || !id) return;
    setSubmittingNote(true);
    try {
      await adminAPI.addNote(Number(id), { content: newNote.trim(), note_type: noteType });
      setNewNote("");
      const notesList = await adminAPI.getNotes(Number(id));
      setNotes(notesList);
      toast({ title: "Note added" });
    } catch (e: any) {
      toast({ title: "Failed to add note", description: e.message, variant: "destructive" });
    } finally {
      setSubmittingNote(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <Card>
          <CardContent className="pt-6">
            <div className="h-32 animate-pulse rounded bg-muted" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground">Grievance not found.</p>
        <Link to="/admin/grievances">
          <Button variant="outline">Back to list</Button>
        </Link>
      </div>
    );
  }

  const loc = issue.location;
  const locationStr = [
    typeof loc?.city === "object" ? loc?.city?.name : loc?.city,
    typeof loc?.district === "object" ? loc?.district?.name : loc?.district,
    typeof loc?.state === "object" ? loc?.state?.name : loc?.state,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/admin/grievances">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{issue.title}</h1>
          <p className="text-sm text-muted-foreground">
            ID {issue.id} · {issue.created_at ? formatDistanceToNow(new Date(issue.created_at), { addSuffix: true }) : ""}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{issue.category?.name ?? "Uncategorized"}</Badge>
                {issue.is_featured && (
                  <Badge variant="outline" className="gap-1">
                    <Star className="h-3 w-3" /> Featured
                  </Badge>
                )}
                {issue.is_verified && (
                  <Badge variant="outline" className="gap-1 text-green-600">
                    <ShieldCheck className="h-3 w-3" /> Verified
                  </Badge>
                )}
              </div>
              <CardTitle className="text-lg">{issue.title}</CardTitle>
              <CardDescription className="flex flex-wrap items-center gap-4 text-xs">
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {issue.is_anonymous ? "Anonymous" : issue.author_name}
                </span>
                {locationStr && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {locationStr}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  {issue.comments_count} comments
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {issue.views_count} views
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-foreground whitespace-pre-wrap">{issue.description}</p>
              {issue.media_files?.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {issue.media_files.map((m: any) => (
                    <div key={m.id} className="rounded-lg overflow-hidden border border-border">
                      {m.media_type === "image" && (
                        <img
                          src={m.file_url}
                          alt={m.caption || ""}
                          className="h-40 w-full object-cover"
                        />
                      )}
                      {m.media_type === "video" && (
                        <video src={m.file_url} controls className="h-40 w-full object-cover" />
                      )}
                      {m.media_type === "audio" && (
                        <div className="p-2">
                          <audio src={m.file_url} controls className="w-full" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {issue.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {issue.tags.map((t: any) => (
                    <Badge key={t.id ?? t} variant="outline" className="text-xs">
                      #{typeof t === "string" ? t : t.name}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Actions</CardTitle>
              <CardDescription>Update status and visibility</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={issue.status}
                  onValueChange={handleStatusChange}
                  disabled={updating}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <Label htmlFor="featured" className="cursor-pointer">Featured</Label>
                <Switch
                  id="featured"
                  checked={!!issue.is_featured}
                  onCheckedChange={handleFeaturedChange}
                  disabled={updating}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="verified" className="cursor-pointer">Verified</Label>
                <Switch
                  id="verified"
                  checked={!!issue.is_verified}
                  onCheckedChange={handleVerifiedChange}
                  disabled={updating}
                />
              </div>
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link to={`/issue/${issue.id}`} target="_blank" rel="noopener noreferrer">
                  View on public site
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Admin notes</CardTitle>
              <CardDescription>Internal or public response</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Select value={noteType} onValueChange={(v: "internal" | "public_response") => setNoteType(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="internal">Internal note</SelectItem>
                    <SelectItem value="public_response">Public response</SelectItem>
                  </SelectContent>
                </Select>
                <Textarea
                  placeholder="Add a note..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
                <Button
                  size="sm"
                  onClick={handleAddNote}
                  disabled={!newNote.trim() || submittingNote}
                >
                  {submittingNote ? "Adding..." : "Add note"}
                </Button>
              </div>
              <Separator />
              <div className="space-y-3 max-h-[280px] overflow-y-auto">
                {notes.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No notes yet.</p>
                ) : (
                  notes.map((n) => (
                    <div
                      key={n.id}
                      className="rounded-lg border border-border bg-muted/30 p-3 text-sm"
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-medium text-foreground">{n.author_name}</span>
                        <Badge variant={n.note_type === "public_response" ? "default" : "secondary"} className="text-xs">
                          {n.note_type === "public_response" ? "Public" : "Internal"}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground whitespace-pre-wrap">{n.content}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {n.created_at ? formatDistanceToNow(new Date(n.created_at), { addSuffix: true }) : ""}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
