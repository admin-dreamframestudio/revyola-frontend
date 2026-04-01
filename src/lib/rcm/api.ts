import { ParseResponse } from "./types";

const RCM_API_BASE =
 // "https://automatic-fiesta-r4w9g6w4j9qq35w6x-8000.app.github.dev";
    "https://revyola-engine.onrender.com";

export async function fetchRcmParse(uploadId: string): Promise<ParseResponse> {
  const res = await fetch(
    `${RCM_API_BASE}/api/v1/rcm/ingestion/${encodeURIComponent(uploadId)}/parse`,
    {
      method: "POST",
    }
  );

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.detail || "Failed to load RCM data");
  }

  return json as ParseResponse;
}

export async function uploadRcm835(file: File): Promise<{ upload_id: string }> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${RCM_API_BASE}/api/v1/rcm/ingestion/upload`, {
    method: "POST",
    body: formData,
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.detail || "Failed to upload 835 file");
  }

  return json as { upload_id: string };
}