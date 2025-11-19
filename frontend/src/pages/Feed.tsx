import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { IssueCard } from "@/components/IssueCard";
import { FilterSidebar } from "@/components/FilterSidebar";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { issueAPI } from "@/lib/api";

const Feed = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: null as number | null,
    state: null as number | null,
    district: null as number | null,
    city: null as number | null,
    scope: null as string | null,
    sort_by: 'trending' as 'trending' | 'recent' | 'votes' | 'comments',
  });
  const { toast } = useToast();

  useEffect(() => {
    loadIssues();
  }, [filters]);

  const loadIssues = async () => {
    try {
      setLoading(true);
      const response = await issueAPI.getAll({
        ...filters,
        category: filters.category || undefined,
        state: filters.state || undefined,
        district: filters.district || undefined,
        city: filters.city || undefined,
        scope: filters.scope || undefined,
        sort_by: filters.sort_by,
      });
      setIssues(response.results || []);
    } catch (error: any) {
      console.error('Error loading issues:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to load issues. Please try again.",
        variant: "destructive",
      });
      // Set empty array on error to prevent blank screen
      setIssues([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container px-4 py-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Community Issues</h1>
            <p className="text-muted-foreground">Latest concerns from across India</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="lg:hidden"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
          <aside className={`lg:block ${showFilters ? "block" : "hidden"}`}>
            <FilterSidebar 
              filters={filters}
              onFiltersChange={setFilters}
            />
          </aside>

          <main className="space-y-6">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading issues...</p>
              </div>
            ) : issues.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No issues found. Be the first to post one!</p>
              </div>
            ) : (
              issues.map((issue) => (
                <IssueCard key={issue.id} issue={issue} />
              ))
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Feed;
