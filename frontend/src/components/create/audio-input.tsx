"use client";

import { Copy, FileAudio, Upload, X } from "lucide-react";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import type { TranscriptItem } from "~/actions/speech-to-text";

interface AudioInputProps {
  selectedFile: File | null;
  onFileSelect: (file: File | null) => void;
  latestTranscript: TranscriptItem | null;
}

export default function AudioInput({
  selectedFile,
  onFileSelect,
  latestTranscript,
}: AudioInputProps) {
  return (
    <Card className="shadow-lg">
      <CardContent className="p-2 sm:p-3">
        <div className="mb-2">
          <h3 className="mb-0.5 text-sm font-bold">Audio Input</h3>
          <p className="text-muted-foreground text-xs">
            Upload an audio file to transcribe
          </p>
        </div>

        <div className="space-y-3">
          <label className="border-input bg-background hover:bg-muted/50 flex w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed px-3 py-4 text-sm transition-colors">
            <Upload className="h-4 w-4" />
            <span>
              {selectedFile ? "Change audio file" : "Upload audio file"}
            </span>
            <input
              type="file"
              accept=".mp3,.wav,.ogg,.flac,.mpeg,.mpga,audio/*"
              className="hidden"
              onChange={(e) => onFileSelect(e.target.files?.[0] ?? null)}
            />
          </label>

          {selectedFile && (
            <div className="bg-muted/40 flex items-center justify-between rounded-md border px-3 py-2 text-xs">
              <div className="flex min-w-0 items-center gap-2">
                <FileAudio className="h-4 w-4 shrink-0" />
                <div className="min-w-0">
                  <p className="truncate font-medium">{selectedFile.name}</p>
                  <p className="text-muted-foreground">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2"
                onClick={() => onFileSelect(null)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}

          {latestTranscript && (
            <div className="rounded-lg border border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50 p-3">
              <div className="mb-2 flex items-center justify-between">
                <h4 className="text-xs font-bold text-blue-900">
                  Latest Transcript
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 gap-1 px-2 text-blue-700 hover:bg-blue-100"
                  onClick={() =>
                    navigator.clipboard.writeText(latestTranscript.text)
                  }
                >
                  <Copy className="h-3 w-3" />
                  <span className="text-xs">Copy</span>
                </Button>
              </div>
              <p className="text-xs font-semibold text-blue-800">
                {latestTranscript.filename}
              </p>
              <p className="mt-2 max-h-48 overflow-auto rounded bg-white/60 p-2 text-xs text-blue-900">
                {latestTranscript.text}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}