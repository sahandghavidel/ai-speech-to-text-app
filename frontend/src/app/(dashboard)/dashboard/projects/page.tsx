"use client";

import { RedirectToSignIn, SignedIn } from "@daveyplate/better-auth-ui";
import {
  Loader2,
  Search,
  Calendar,
  Trash2,
  Copy,
  Plus,
  FileText,
  Languages,
} from "lucide-react";
import { authClient } from "~/lib/auth-client";
import { useEffect, useState } from "react";
import { deleteTranscript, getUserTranscripts } from "~/actions/speech-to-text";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { useRouter } from "next/navigation";
import type { TranscriptItem } from "~/actions/speech-to-text";

type SortBy = "newest" | "oldest" | "filename";

export default function ProjectsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [transcripts, setTranscripts] = useState<TranscriptItem[]>([]);
  const [filteredTranscripts, setFilteredTranscripts] = useState<
    TranscriptItem[]
  >([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("newest");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const initializeProjects = async () => {
      try {
        const [, transcriptsResult] = await Promise.all([
          authClient.getSession(),
          getUserTranscripts(),
        ]);

        if (transcriptsResult.success && transcriptsResult.transcripts) {
          setTranscripts(transcriptsResult.transcripts);
          setFilteredTranscripts(transcriptsResult.transcripts);
        }
      } catch (error) {
        console.error("Transcript history initialization failed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    void initializeProjects();
  }, []);

  useEffect(() => {
    let filtered = transcripts.filter(
      (item) =>
        item.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.language.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    switch (sortBy) {
      case "newest":
        filtered = filtered.sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
        );
        break;
      case "oldest":
        filtered = filtered.sort(
          (a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
        );
        break;
      case "filename":
        filtered = filtered.sort((a, b) =>
          a.filename.localeCompare(b.filename),
        );
        break;
    }

    setFilteredTranscripts(filtered);
  }, [transcripts, searchQuery, sortBy]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this transcript?")) return;

    setDeletingId(id);
    const result = await deleteTranscript(id);
    if (result.success) {
      setTranscripts((prev) => prev.filter((t) => t.id !== id));
    }
    setDeletingId(null);
  };

  const handleCopy = (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="text-primary h-8 w-8 animate-spin" />
          <p className="text-muted-foreground text-sm">
            Loading your projects...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <RedirectToSignIn />
      <SignedIn>
        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <h1 className="from-primary to-primary/70 bg-gradient-to-r bg-clip-text text-2xl font-bold tracking-tight text-transparent sm:text-3xl">
                Transcript History
              </h1>
              <p className="text-muted-foreground text-base">
                Manage and organize your saved transcriptions (
                {filteredTranscripts.length}{" "}
                {filteredTranscripts.length === 1 ? "item" : "items"})
              </p>
            </div>
            <Button
              onClick={() => router.push("/dashboard/create")}
              className="gap-2 self-start sm:self-auto"
            >
              <Plus className="h-4 w-4" />
              New Transcription
            </Button>
          </div>

          {/* Controls Bar */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                {/* Search */}
                <div className="relative max-w-md flex-1">
                  <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                  <Input
                    placeholder="Search transcripts by filename, text, or language..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>

                {/* Sort Dropdown */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortBy)}
                  className="border-input bg-background rounded-md border px-3 py-2 text-sm"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="filename">Filename A-Z</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Projects Content */}
          {filteredTranscripts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="relative mb-6">
                  <div className="border-muted bg-muted/20 flex h-24 w-24 items-center justify-center rounded-full border-2 border-dashed">
                    <FileText className="text-muted-foreground h-10 w-10" />
                  </div>
                </div>
                <h3 className="mb-2 text-xl font-semibold">
                  {searchQuery
                    ? "No transcripts found"
                    : "No transcript history yet"}
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md text-sm">
                  {searchQuery
                    ? `No transcripts match "${searchQuery}". Try adjusting your search terms.`
                    : "Start transcribing audio to see your history here."}
                </p>
                {!searchQuery && (
                  <Button
                    onClick={() => router.push("/dashboard/create")}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Create Your First Transcript
                  </Button>
                )}
                {searchQuery && (
                  <Button
                    variant="outline"
                    onClick={() => setSearchQuery("")}
                    className="gap-2"
                  >
                    Clear Search
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredTranscripts.map((item) => (
                <Card
                  key={item.id}
                  className="group transition-all hover:shadow-md"
                >
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="bg-muted flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border">
                      <FileText className="h-7 w-7 text-purple-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-muted-foreground mb-2 line-clamp-2 text-sm">
                        {item.text}
                      </p>
                      <div className="text-muted-foreground flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(item.timestamp).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Languages className="h-3 w-3" />
                          {item.language.toUpperCase()}
                        </div>
                        <div className="max-w-[220px] truncate">
                          {item.filename}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-shrink-0 items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={(e) => handleCopy(item.text, e)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive h-8 w-8 p-0"
                        onClick={(e) => handleDelete(item.id, e)}
                        disabled={deletingId === item.id}
                      >
                        {deletingId === item.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Load More Button - if you want to implement pagination */}
          {filteredTranscripts.length >= 20 && (
            <div className="text-center">
              <Button variant="outline" className="gap-2">
                Load More
                <Loader2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </SignedIn>
    </>
  );
}