"use client";

import { RedirectToSignIn, SignedIn } from "@daveyplate/better-auth-ui";
import {
  Loader2,
  Sparkles,
  Calendar,
  TrendingUp,
  Star,
  ArrowRight,
  FileText,
  Settings,
  AudioLines,
  Copy,
} from "lucide-react";
import { authClient } from "~/lib/auth-client";
import { useEffect, useState } from "react";
import { getUserTranscripts } from "~/actions/speech-to-text";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { useRouter } from "next/navigation";
import type { TranscriptItem } from "~/actions/speech-to-text";

interface UserStats {
  totalTranscripts: number;
  thisMonth: number;
  thisWeek: number;
  uniqueLanguages: number;
}

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [transcripts, setTranscripts] = useState<TranscriptItem[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({
    totalTranscripts: 0,
    thisMonth: 0,
    thisWeek: 0,
    uniqueLanguages: 0,
  });
  const [user, setUser] = useState<{
    name?: string;
    createdAt?: string | Date;
  } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        const [sessionResult, transcriptResult] = await Promise.all([
          authClient.getSession(),
          getUserTranscripts(),
        ]);

        if (sessionResult?.data?.user) {
          setUser(sessionResult.data.user);
        }

        if (transcriptResult.success && transcriptResult.transcripts) {
          setTranscripts(transcriptResult.transcripts);
        }

        const items = transcriptResult.transcripts ?? [];

        const now = new Date();
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        const uniqueLanguages = new Set(items.map((t) => t.language)).size;

        setUserStats({
          totalTranscripts: items.length,
          thisMonth: items.filter((p) => new Date(p.timestamp) >= thisMonth)
            .length,
          thisWeek: items.filter((p) => new Date(p.timestamp) >= thisWeek)
            .length,
          uniqueLanguages,
        });
      } catch (error) {
        console.error("Dashboard initialization failed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    void initializeDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="text-primary h-8 w-8 animate-spin" />
          <p className="text-muted-foreground text-sm">
            Loading your dashboard...
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
          <div className="space-y-2">
            <h1 className="from-primary to-primary/70 bg-gradient-to-r bg-clip-text text-2xl font-bold tracking-tight text-transparent sm:text-3xl">
              Welcome back{user?.name ? `, ${user.name}` : ""}!
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg">
              Here&apos;s an overview of your Speech-to-Text workspace
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Transcripts
                </CardTitle>
                <FileText className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {userStats.totalTranscripts}
                </div>
                <p className="text-muted-foreground text-xs">
                  Saved transcriptions
                </p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  This Month
                </CardTitle>
                <Calendar className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {userStats.thisMonth}
                </div>
                <p className="text-muted-foreground text-xs">
                  Projects created
                </p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Languages</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {userStats.uniqueLanguages}
                </div>
                <p className="text-muted-foreground text-xs">Used in history</p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Member Since
                </CardTitle>
                <Star className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {user?.createdAt
                    ? new Date(
                        user.createdAt as string | number | Date,
                      ).toLocaleDateString("en-US", {
                        month: "short",
                        year: "numeric",
                      })
                    : "N/A"}
                </div>
                <p className="text-muted-foreground text-xs">Account created</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="text-primary h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <Button
                  onClick={() => router.push("/dashboard/create")}
                  className="group h-auto flex-col gap-2 bg-purple-600 p-6 hover:bg-purple-700"
                >
                  <AudioLines className="h-8 w-8 transition-transform group-hover:scale-110" />
                  <div className="text-center">
                    <div className="font-semibold">New Transcription</div>
                    <div className="text-xs opacity-80">
                      Upload audio and generate text
                    </div>
                  </div>
                </Button>

                <Button
                  onClick={() => router.push("/dashboard/projects")}
                  variant="outline"
                  className="group hover:bg-muted h-auto flex-col gap-2 p-6"
                >
                  <FileText className="h-8 w-8 transition-transform group-hover:scale-110" />
                  <div className="text-center">
                    <div className="font-semibold">View History</div>
                    <div className="text-xs opacity-70">
                      Browse saved transcripts
                    </div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Transcripts */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-purple-600" />
                Recent Transcripts
              </CardTitle>
              {transcripts.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/dashboard/projects")}
                  className="text-purple-600 hover:text-purple-700"
                >
                  View All <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {transcripts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="relative mb-4">
                    <div className="border-muted bg-muted/20 flex h-20 w-20 items-center justify-center rounded-full border-2 border-dashed">
                      <FileText className="text-muted-foreground h-8 w-8" />
                    </div>
                  </div>
                  <h3 className="mb-2 text-lg font-semibold">
                    No transcripts yet
                  </h3>
                  <p className="text-muted-foreground mb-4 text-sm">
                    Upload audio and save your first transcription
                  </p>
                  <Button
                    onClick={() => router.push("/dashboard/create")}
                    className="gap-2 bg-purple-600 hover:bg-purple-700"
                  >
                    <AudioLines className="h-4 w-4" />
                    Create Your First Transcript
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {transcripts.slice(0, 5).map((item) => (
                    <div
                      key={item.id}
                      className="group hover:bg-muted/50 flex items-center gap-4 rounded-lg border p-4 transition-all hover:shadow-sm"
                    >
                      <div className="bg-muted flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border">
                        <FileText className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="truncate text-sm font-medium">
                          {item.filename}
                        </h4>
                        <div className="mt-1 flex items-center gap-2">
                          <p className="text-muted-foreground text-xs">
                            {item.language.toUpperCase()}
                          </p>
                          <span className="text-muted-foreground text-xs">
                            •
                          </span>
                          <p className="text-muted-foreground text-xs">
                            {new Date(item.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                        <p className="text-muted-foreground mt-1 line-clamp-2 text-xs">
                          {item.text}
                        </p>
                      </div>
                      <div className="shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            navigator.clipboard.writeText(item.text)
                          }
                        >
                          <Copy className="mr-1 h-3 w-3" />
                          Copy
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </SignedIn>
    </>
  );
}