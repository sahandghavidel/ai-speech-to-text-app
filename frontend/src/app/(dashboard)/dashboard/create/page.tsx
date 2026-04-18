"use client";

import { RedirectToSignIn, SignedIn } from "@daveyplate/better-auth-ui";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import {
  deleteTranscript,
  getUserTranscripts,
  transcribeAudio,
} from "~/actions/speech-to-text";
import { toast } from "sonner";
import type { TranscriptItem } from "~/actions/speech-to-text";
import AudioSettings from "~/components/create/audio-settings";
import AudioInput from "~/components/create/audio-input";
import TranscriptHistory from "~/components/create/transcript-history";

async function fileToBase64(file: File): Promise<string> {
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        reject(new Error("Failed to read file"));
        return;
      }
      const commaIndex = result.indexOf(",");
      resolve(commaIndex >= 0 ? result.slice(commaIndex + 1) : result);
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

export default function CreatePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [language, setLanguage] = useState("en");
  const [transcripts, setTranscripts] = useState<TranscriptItem[]>([]);
  const [deletingTranscriptId, setDeletingTranscriptId] = useState<
    string | null
  >(null);
  const [latestTranscript, setLatestTranscript] =
    useState<TranscriptItem | null>(null);

  useEffect(() => {
    const initializeData = async () => {
      try {
        const historyResult = await getUserTranscripts();
        if (historyResult.success && historyResult.transcripts) {
          setTranscripts(historyResult.transcripts);
          setLatestTranscript(historyResult.transcripts[0] ?? null);
        }
      } catch (error) {
        console.error("Error initializing data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    void initializeData();
  }, []);

  const handleTranscribe = async () => {
    if (!selectedFile) {
      toast.error("Please upload an audio file!");
      return;
    }

    setIsTranscribing(true);
    try {
      const audioBase64 = await fileToBase64(selectedFile);

      const result = await transcribeAudio({
        audio_base64: audioBase64,
        filename: selectedFile.name,
        language,
      });

      if (!result.success || !result.text) {
        throw new Error(result.error ?? "Transcription failed");
      }

      const newTranscript: TranscriptItem = result.transcript ?? {
        id: crypto.randomUUID(),
        filename: selectedFile.name,
        language: result.language ?? language,
        text: result.text,
        modelId: result.modelId ?? "CohereLabs/cohere-transcribe-03-2026",
        timestamp: new Date(),
      };

      setLatestTranscript(newTranscript);
      setTranscripts((prev) => [newTranscript, ...prev].slice(0, 20));

      window.dispatchEvent(new Event("credits:refresh"));

      if (result.error) {
        toast.warning(result.error);
      } else {
        toast.success("Audio transcribed successfully!");
      }
    } catch (error) {
      console.error("Transcription error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to transcribe audio";
      toast.error(errorMessage);
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleDeleteTranscript = async (id: string) => {
    setDeletingTranscriptId(id);
    try {
      const result = await deleteTranscript(id);
      if (!result.success) {
        throw new Error(result.error ?? "Failed to delete transcript");
      }

      setTranscripts((prev) => {
        const updated = prev.filter((t) => t.id !== id);
        setLatestTranscript((current) =>
          current?.id === id ? (updated[0] ?? null) : current,
        );
        return updated;
      });

      toast.success("Transcript deleted");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete transcript";
      toast.error(errorMessage);
    } finally {
      setDeletingTranscriptId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <RedirectToSignIn />
      <SignedIn>
        <div className="min-h-screen">
          {/* Top Navbar */}
          <div className="border-b border-gray-200 bg-white py-2">
            <div className="mx-auto max-w-7xl text-center">
              <h1 className="from-primary to-primary/70 mb-1 bg-gradient-to-r bg-clip-text text-lg font-bold text-transparent">
                Speech-to-Text Transcriber
              </h1>
              <p className="text-muted-foreground mx-auto max-w-xl text-xs">
                Upload audio and convert speech into text
              </p>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="mx-auto max-w-7xl px-2 py-4 sm:px-4 sm:py-6">
            <div className="grid grid-cols-1 gap-2 sm:gap-4 lg:grid-cols-3">
              {/* Left Side - Controls (1/3 width) */}
              <div className="order-2 space-y-2 sm:space-y-3 lg:order-1 lg:col-span-1">
                <AudioSettings
                  language={language}
                  setLanguage={setLanguage}
                  hasFile={!!selectedFile}
                  isTranscribing={isTranscribing}
                  onTranscribe={handleTranscribe}
                />
              </div>

              {/* Right Side - Text Input & Preview (2/3 width) */}
              <div className="order-1 space-y-2 sm:space-y-3 lg:order-2 lg:col-span-2">
                <AudioInput
                  selectedFile={selectedFile}
                  onFileSelect={setSelectedFile}
                  latestTranscript={latestTranscript}
                />
              </div>
            </div>
          </div>

          {/* History Section */}
          <TranscriptHistory
            transcripts={transcripts}
            onDelete={handleDeleteTranscript}
            deletingId={deletingTranscriptId}
          />
        </div>
      </SignedIn>
    </>
  );
}