"use server";

import { headers } from "next/headers";
import { env } from "~/env";
import { auth } from "~/lib/auth";
import { db } from "~/server/db";

export interface TranscriptItem {
  id: string;
  filename: string;
  language: string;
  text: string;
  modelId: string;
  timestamp: Date | string;
}

interface TranscribeAudioData {
  audio_base64: string;
  filename: string;
  language: string;
}

interface TranscribeAudioResult {
  success: boolean;
  text?: string;
  modelId?: string;
  language?: string;
  transcript?: TranscriptItem;
  error?: string;
}

interface GetUserTranscriptsResult {
  success: boolean;
  transcripts?: TranscriptItem[];
  error?: string;
}

export async function transcribeAudio(
  data: TranscribeAudioData,
): Promise<TranscribeAudioResult> {
  let sessionUserId: string | undefined;
  try {
    if (!env.MODAL_STT_URL) {
      return {
        success: false,
        error: "MODAL_STT_URL is not set",
      };
    }

    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };
    sessionUserId = session.user.id;

    const creditsNeeded = 1;
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { credits: true },
    });
    if (!user) return { success: false, error: "User not found" };
    if (user.credits < creditsNeeded) {
      return {
        success: false,
        error: `Insufficient credits. Need ${creditsNeeded}, have ${user.credits}`,
      };
    }

    if (!data.audio_base64 || !data.filename || !data.language) {
      return { success: false, error: "Missing required fields" };
    }

    const response = await fetch(env.MODAL_STT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        audio_base64: data.audio_base64,
        filename: data.filename,
        language: data.language,
      }),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      return {
        success: false,
        error: text ? `Transcription failed: ${text}` : "Failed to transcribe",
      };
    }

    const result = (await response.json()) as {
      text?: string | string[];
      model_id?: string;
      language?: string;
      error?: string;
    };

    if (result.error) {
      return { success: false, error: result.error };
    }

    const normalizedText = Array.isArray(result.text)
      ? result.text.filter(Boolean).join("\n\n")
      : result.text;

    if (!normalizedText) {
      return { success: false, error: "No transcription returned" };
    }

    let transcript: TranscriptItem | undefined;
    try {
      const [, created] = await db.$transaction([
        db.user.update({
          where: { id: session.user.id },
          data: { credits: { decrement: creditsNeeded } },
        }),
        db.transcript.create({
          data: {
            filename: data.filename,
            language: result.language ?? data.language,
            text: normalizedText,
            modelId: result.model_id ?? "CohereLabs/cohere-transcribe-03-2026",
            userId: session.user.id,
          },
        }),
      ]);

      transcript = {
        id: created.id,
        filename: created.filename,
        language: created.language,
        text: created.text,
        modelId: created.modelId,
        timestamp: created.createdAt,
      };
    } catch (persistError) {
      console.error("Transcript persistence error:", persistError);
    }

    return {
      success: true,
      text: normalizedText,
      modelId: result.model_id ?? "CohereLabs/cohere-transcribe-03-2026",
      language: result.language ?? data.language,
      transcript,
      error: transcript
        ? undefined
        : "Transcribed successfully, but failed to save history.",
    };
  } catch (error) {
    console.error("Transcription error:", error);
    return {
      success: false,
      error: `Internal server error${sessionUserId ? ` (user: ${sessionUserId})` : ""}`,
    };
  }
}

export async function getUserTranscripts(): Promise<GetUserTranscriptsResult> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    const transcripts = await db.transcript.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return {
      success: true,
      transcripts: transcripts.map((t) => ({
        id: t.id,
        filename: t.filename,
        language: t.language,
        text: t.text,
        modelId: t.modelId,
        timestamp: t.createdAt,
      })),
    };
  } catch (error) {
    console.error("Error fetching transcripts:", error);
    return { success: false, error: "Failed to fetch transcripts" };
  }
}

export async function deleteTranscript(id: string) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    const transcript = await db.transcript.findUnique({ where: { id } });
    if (!transcript || transcript.userId !== session.user.id) {
      return { success: false, error: "Not found or unauthorized" };
    }

    await db.transcript.delete({ where: { id } });
    return { success: true };
  } catch (error) {
    console.error("Error deleting transcript:", error);
    return { success: false, error: "Failed to delete transcript" };
  }
}