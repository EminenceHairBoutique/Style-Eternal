import { supabase } from "../../lib/supabaseClient";

const BUCKET = "product-images";

/**
 * Upload a single image File to Storage and record it in media_library.
 * Returns the inserted media_library row ({ id, url, filename, ... }).
 * Throws on failure.
 */
export async function uploadMediaFile(file) {
  if (!supabase) throw new Error("Supabase not configured");

  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `media/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error: upErr } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { cacheControl: "3600", upsert: false });
  if (upErr) throw upErr;

  const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
  const url = pub?.publicUrl;
  if (!url) throw new Error("Could not resolve public URL");

  const { data, error: insErr } = await supabase
    .from("media_library")
    .insert({ url, filename: file.name, size_bytes: file.size })
    .select()
    .single();
  if (insErr) throw insErr;

  return data;
}
