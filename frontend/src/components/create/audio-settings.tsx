"use client";

import { FileAudio, Loader2, Settings2 } from "lucide-react";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";

interface AudioSettingsProps {
  language: string;
  setLanguage: (v: string) => void;
  hasFile: boolean;
  isTranscribing: boolean;
  onTranscribe: () => void;
}

const LANGUAGES = [
  { label: "English", value: "en" },
  { label: "French", value: "fr" },
  { label: "German", value: "de" },
  { label: "Italian", value: "it" },
  { label: "Spanish", value: "es" },
  { label: "Portuguese", value: "pt" },
  { label: "Greek", value: "el" },
  { label: "Dutch", value: "nl" },
  { label: "Polish", value: "pl" },
  { label: "Mandarin Chinese", value: "zh" },
  { label: "Japanese", value: "ja" },
  { label: "Korean", value: "ko" },
  { label: "Vietnamese", value: "vi" },
  { label: "Arabic", value: "ar" },
];

export default function AudioSettings({
  language,
  setLanguage,
  hasFile,
  isTranscribing,
  onTranscribe,
}: AudioSettingsProps) {
  return (
    <Card className="shadow-lg">
      <CardContent className="p-2 sm:p-3">
        <div className="mb-3">
          <h3 className="mb-0.5 text-sm font-bold">Settings</h3>
          <p className="text-muted-foreground text-xs">
            Configure transcription options
          </p>
        </div>

        <div className="space-y-3">
          <div>
            <label className="mb-1 flex items-center gap-1 text-xs font-semibold">
              <Settings2 className="h-3 w-3" /> Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="border-input bg-background w-full rounded-md border px-2 py-1.5 text-xs"
            >
              {LANGUAGES.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>

          <Button
            onClick={onTranscribe}
            disabled={isTranscribing || !hasFile}
            className="h-9 w-full gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {isTranscribing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Transcribing...
              </>
            ) : (
              <>
                <FileAudio className="h-4 w-4" />
                Transcribe Audio
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}