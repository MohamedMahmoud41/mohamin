import { createClient } from "@/lib/supabase/client";

const BUCKET = "case-attachments";

/**
 * Extracts the Supabase storage path from either a full public URL or a plain path.
 *
 * Full URL example:
 *   https://xxx.supabase.co/storage/v1/object/public/case-attachments/caseId/file.pdf
 *   → "caseId/file.pdf"
 *
 * Plain path is returned as-is (leading slash stripped).
 */
export function extractStoragePath(fileUrl: string): string {
  if (fileUrl.startsWith("http")) {
    const match = fileUrl.match(/\/case-attachments\/(.+)$/);
    return match ? match[1] : fileUrl;
  }
  return fileUrl.replace(/^\//, "");
}

/**
 * Generates a short-lived signed URL (10 minutes) for a file in the
 * private "case-attachments" bucket. Returns null on error.
 *
 * @param path - Storage path relative to the bucket root (no leading slash).
 *               e.g. "caseId/1234567890-document.pdf"
 */
export async function getSignedFileUrl(path: string): Promise<string | null> {
  if (!path) return null;

  // Ensure no leading slash (Supabase rejects them)
  const cleanPath = path.replace(/^\//, "");

  const supabase = createClient();
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(cleanPath, 60 * 10); // 10 minutes

  if (error) {
    console.error("[storage] Failed to generate signed URL:", error.message);
    return null;
  }

  return data?.signedUrl ?? null;
}
