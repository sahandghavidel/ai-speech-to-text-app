import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Sparkles, FileAudio, FileText } from "lucide-react";
import Link from "next/link";

export default function DemoSection() {
  const examples = [
    {
      title: "Team Meeting",
      source: "meeting-q1.mp3",
      excerpt:
        "Let's finalize the launch scope this week and move billing updates to the next sprint...",
      tag: "business",
    },
    {
      title: "Podcast Episode",
      source: "episode-12.wav",
      excerpt:
        "Today we're breaking down practical growth loops that actually work for small teams...",
      tag: "podcast",
    },
    {
      title: "Interview Call",
      source: "candidate-interview.m4a",
      excerpt:
        "Thanks for sharing your experience with distributed systems and reliability engineering...",
      tag: "interview",
    },
  ];

  return (
    <section className="bg-gradient-to-br from-indigo-50/50 to-cyan-50/30 py-20 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-800 sm:text-4xl">
            See what you can{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">
              transcribe
            </span>
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            A few real-world examples to get you started.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {examples.map((ex) => (
            <Card
              key={ex.tag}
              className="relative overflow-hidden border-slate-200 bg-white/70 backdrop-blur-sm"
            >
              <div className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-r from-indigo-500 to-cyan-600 text-white">
                      <FileAudio className="h-5 w-5" />
                    </div>
                    <div className="font-semibold text-slate-800">
                      {ex.title}
                    </div>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                    {ex.tag}
                  </span>
                </div>

                <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-500">
                    <FileText className="h-3.5 w-3.5" />
                    {ex.source}
                  </div>
                  <p className="line-clamp-4 text-sm text-slate-700">
                    {ex.excerpt}
                  </p>
                </div>

                <p className="text-sm text-slate-600">
                  Audio category: <span className="font-medium">{ex.tag}</span>
                </p>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link href="/dashboard/create">
            <Button size="lg" className="cursor-pointer gap-2 px-8 py-6">
              <Sparkles className="h-5 w-5" />
              Try It Free Now
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}