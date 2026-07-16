// src/components/reviews/ReviewsSection.jsx — Style Eternal
// Approved customer reviews for a product + submission form.
// Renders nothing until the reviews table exists (RUNBOOK migrations) —
// a Supabase error simply hides the section, matching the codebase's
// graceful-degradation convention.

import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { BadgeCheck, ImagePlus, X } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { useUser } from "../../context/UserContext";
import RatingStars from "./RatingStars";

const PAGE_SIZE = 10;
const MEDIA_BUCKET = "review-media";
const MAX_IMAGES = 3;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO_BYTES = 25 * 1024 * 1024; // 25MB (bucket-enforced too)
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const VIDEO_TYPES = ["video/mp4", "video/webm"];

function mediaPublicUrl(path) {
  if (!supabase || !path) return null;
  return supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path)?.data?.publicUrl || null;
}

function ReviewMedia({ media = [] }) {
  const entries = (Array.isArray(media) ? media : [])
    .map((m) => ({ ...m, url: mediaPublicUrl(m.path) }))
    .filter((m) => m.url);
  if (!entries.length) return null;

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {entries.map((m, i) =>
        m.type === "video" ? (
          <video
            key={i}
            src={m.url}
            controls
            preload="metadata"
            className="h-28 max-w-[220px] bg-se-black border border-white/10"
          />
        ) : (
          <a key={i} href={m.url} target="_blank" rel="noreferrer" className="block">
            <img
              src={m.url}
              alt="Customer photo"
              loading="lazy"
              className="h-20 w-20 object-cover border border-white/10 hover:border-se-gold/50 transition"
            />
          </a>
        )
      )}
    </div>
  );
}

function niceDate(iso) {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

export default function ReviewsSection({ productSlug, onAggregate }) {
  const { user } = useUser();
  const [reviews, setReviews] = useState(null); // null = loading/unavailable
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [available, setAvailable] = useState(true);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [files, setFiles] = useState([]); // File[] (images + at most one video)
  const [formStatus, setFormStatus] = useState("idle"); // idle | saving | done | already
  const [formError, setFormError] = useState("");

  const addFiles = (list) => {
    setFormError("");
    const incoming = Array.from(list || []);
    setFiles((prev) => {
      let next = [...prev];
      for (const f of incoming) {
        const isImage = IMAGE_TYPES.includes(f.type);
        const isVideo = VIDEO_TYPES.includes(f.type);
        if (!isImage && !isVideo) {
          setFormError("Photos (JPG/PNG/WebP) or video (MP4/WebM) only.");
          continue;
        }
        if (isImage && f.size > MAX_IMAGE_BYTES) {
          setFormError("Photos must be under 5MB.");
          continue;
        }
        if (isVideo && f.size > MAX_VIDEO_BYTES) {
          setFormError("Videos must be under 25MB.");
          continue;
        }
        if (isVideo && next.some((x) => VIDEO_TYPES.includes(x.type))) {
          setFormError("One video per review.");
          continue;
        }
        if (isImage && next.filter((x) => IMAGE_TYPES.includes(x.type)).length >= MAX_IMAGES) {
          setFormError(`Up to ${MAX_IMAGES} photos per review.`);
          continue;
        }
        next.push(f);
      }
      return next;
    });
  };

  const uploadMedia = async () => {
    const media = [];
    for (const [i, f] of files.entries()) {
      const ext = (f.name.split(".").pop() || "bin").toLowerCase().replace(/[^a-z0-9]/g, "");
      const path = `${user.id}/${Date.now()}-${i}.${ext}`;
      const { error } = await supabase.storage
        .from(MEDIA_BUCKET)
        .upload(path, f, { contentType: f.type, upsert: false });
      if (error) throw new Error(`Upload failed: ${error.message}`);
      media.push({ type: VIDEO_TYPES.includes(f.type) ? "video" : "image", path });
    }
    return media;
  };

  useEffect(() => {
    if (!supabase || !productSlug) {
      setAvailable(false);
      return;
    }
    let active = true;
    (async () => {
      let { data, error } = await supabase
        .from("reviews")
        .select("id, rating, title, body, author_name, verified_purchase, media, created_at")
        .eq("product_slug", productSlug)
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .limit(100);
      // Pre-RUNBOOK DBs may lack the media column — retry without it.
      if (error && /media/i.test(error.message || "")) {
        ({ data, error } = await supabase
          .from("reviews")
          .select("id, rating, title, body, author_name, verified_purchase, created_at")
          .eq("product_slug", productSlug)
          .eq("status", "approved")
          .order("created_at", { ascending: false })
          .limit(100));
      }
      if (!active) return;
      if (error) {
        setAvailable(false); // table missing / RLS — hide the section
        return;
      }
      setReviews(data || []);
    })();
    return () => {
      active = false;
    };
  }, [productSlug]);

  const summary = useMemo(() => {
    if (!reviews?.length) return null;
    const avg = reviews.reduce((s, r) => s + Number(r.rating || 0), 0) / reviews.length;
    return { avg: Math.round(avg * 10) / 10, count: reviews.length };
  }, [reviews]);

  // Surface the aggregate to the parent (PDP injects Review JSON-LD).
  useEffect(() => {
    if (summary) onAggregate?.(summary);
  }, [summary, onAggregate]);

  if (!available) return null;

  const submit = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!rating) {
      setFormError("Select a star rating.");
      return;
    }
    if (!body.trim()) {
      setFormError("Write a few words about the piece.");
      return;
    }
    setFormStatus("saving");
    try {
      const media = files.length ? await uploadMedia() : [];

      const { error } = await supabase.from("reviews").insert({
        product_slug: productSlug,
        user_id: user.id,
        author_name: authorName.trim().slice(0, 60) || null,
        rating,
        title: title.trim().slice(0, 120) || null,
        body: body.trim().slice(0, 2000),
        media,
      });
      if (error) {
        if (/duplicate|unique/i.test(error.message)) {
          setFormStatus("already");
          return;
        }
        // Pre-RUNBOOK DBs may not have the media column — retry without it.
        if (/media.*column|column.*media/i.test(error.message)) {
          const retry = await supabase.from("reviews").insert({
            product_slug: productSlug,
            user_id: user.id,
            author_name: authorName.trim().slice(0, 60) || null,
            rating,
            title: title.trim().slice(0, 120) || null,
            body: body.trim().slice(0, 2000),
          });
          if (retry.error) throw retry.error;
          setFormStatus("done");
          return;
        }
        throw error;
      }
      setFormStatus("done");
    } catch (err) {
      setFormStatus("idle");
      setFormError(err?.message || "Could not submit your review. Please try again.");
    }
  };

  return (
    <section className="mt-16 border-t border-white/[0.06] pt-12" aria-labelledby="reviews-heading">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <p className="text-overline mb-2">Reviews</p>
          <h2 id="reviews-heading" className="font-display text-[20px] tracking-[0.1em]">
            WHAT THEY'RE SAYING
          </h2>
        </div>

        {summary && (
          <div className="flex items-center gap-3">
            <RatingStars value={summary.avg} size={16} />
            <span className="text-[13px] font-accent text-se-bone/70">
              {summary.avg} · {summary.count} review{summary.count === 1 ? "" : "s"}
            </span>
          </div>
        )}
      </div>

      {/* List */}
      {reviews === null ? (
        <div className="space-y-4" aria-hidden="true">
          <div className="h-20 bg-se-charcoal se-skeleton" />
          <div className="h-20 bg-se-charcoal se-skeleton" />
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-[13px] text-se-steel font-accent mb-8">
          No reviews yet. Own this piece? Be the first.
        </p>
      ) : (
        <div className="space-y-6 mb-10">
          {reviews.slice(0, visible).map((r) => (
            <article key={r.id} className="border border-white/5 bg-se-charcoal p-6">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <RatingStars value={r.rating} />
                {r.verified_purchase && (
                  <span className="inline-flex items-center gap-1 text-[9px] uppercase tracking-[0.18em] text-se-gold font-accent">
                    <BadgeCheck className="w-3 h-3" aria-hidden="true" /> Verified Purchase
                  </span>
                )}
              </div>
              {r.title && (
                <h3 className="text-[14px] font-accent font-medium text-se-bone mb-1">{r.title}</h3>
              )}
              {r.body && (
                <p className="text-[13px] text-se-bone/60 leading-relaxed whitespace-pre-line">{r.body}</p>
              )}
              <ReviewMedia media={r.media} />
              <p className="mt-3 text-[11px] text-se-steel font-accent">
                {r.author_name || "Style Eternal customer"} · {niceDate(r.created_at)}
              </p>
            </article>
          ))}

          {reviews.length > visible && (
            <button
              type="button"
              onClick={() => setVisible((v) => v + PAGE_SIZE)}
              className="btn-outline text-[10px]"
            >
              Show more reviews
            </button>
          )}
        </div>
      )}

      {/* Submit */}
      {formStatus === "done" ? (
        <div className="border border-se-gold/30 bg-se-charcoal p-6">
          <p className="text-[13px] text-se-bone">Thank you — your review is in.</p>
          <p className="text-[11px] text-se-steel font-accent mt-1">
            Reviews are checked by our team before going live.
          </p>
        </div>
      ) : formStatus === "already" ? (
        <p className="text-[12px] text-se-steel font-accent">
          You've already reviewed this piece — thank you.
        </p>
      ) : !user ? (
        <p className="text-[12px] text-se-steel font-accent">
          <Link to="/account" className="text-se-gold underline underline-offset-2">
            Sign in
          </Link>{" "}
          to write a review.
        </p>
      ) : !showForm ? (
        <button type="button" onClick={() => setShowForm(true)} className="btn-outline text-[10px]">
          Write a review
        </button>
      ) : (
        <form onSubmit={submit} className="border border-white/5 bg-se-charcoal p-6 space-y-5 max-w-xl">
          <div>
            <span className="block text-[11px] font-accent tracking-[0.15em] uppercase text-se-bone/60 mb-2">
              Your rating
            </span>
            <RatingStars value={rating} interactive onChange={setRating} />
          </div>

          <label className="block">
            <span className="text-[11px] font-accent tracking-[0.15em] uppercase text-se-bone/60">
              Title <span className="normal-case text-se-steel">(optional)</span>
            </span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
              className="mt-2 w-full bg-se-black border border-white/10 px-4 py-3 text-[14px] text-se-bone focus:outline-none focus:border-se-gold/60"
            />
          </label>

          <label className="block">
            <span className="text-[11px] font-accent tracking-[0.15em] uppercase text-se-bone/60">
              Review
            </span>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              maxLength={2000}
              required
              className="mt-2 w-full bg-se-black border border-white/10 px-4 py-3 text-[14px] text-se-bone focus:outline-none focus:border-se-gold/60 resize-y"
            />
          </label>

          <label className="block">
            <span className="text-[11px] font-accent tracking-[0.15em] uppercase text-se-bone/60">
              Display name <span className="normal-case text-se-steel">(optional)</span>
            </span>
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              maxLength={60}
              placeholder="How your name appears"
              className="mt-2 w-full bg-se-black border border-white/10 px-4 py-3 text-[14px] text-se-bone focus:outline-none focus:border-se-gold/60"
            />
          </label>

          {/* Photos / video */}
          <div>
            <span className="block text-[11px] font-accent tracking-[0.15em] uppercase text-se-bone/60 mb-2">
              Photos or video <span className="normal-case text-se-steel">(optional — up to {MAX_IMAGES} photos, 1 video)</span>
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {files.map((f, i) => (
                <div key={i} className="relative">
                  {IMAGE_TYPES.includes(f.type) ? (
                    <img
                      src={URL.createObjectURL(f)}
                      alt=""
                      className="h-16 w-16 object-cover border border-white/10"
                    />
                  ) : (
                    <div className="h-16 w-24 flex items-center justify-center border border-white/10 bg-se-black text-[9px] uppercase tracking-[0.15em] text-se-steel font-accent">
                      Video
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setFiles((prev) => prev.filter((_, x) => x !== i))}
                    aria-label="Remove file"
                    className="absolute -top-1.5 -right-1.5 w-4 h-4 flex items-center justify-center rounded-full bg-se-black border border-white/20 text-se-bone/70 hover:text-se-bone"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </div>
              ))}
              <label className="h-16 w-16 flex flex-col items-center justify-center gap-1 border border-dashed border-white/20 text-se-steel hover:text-se-bone hover:border-se-gold/40 transition cursor-pointer">
                <ImagePlus className="w-4 h-4" aria-hidden="true" />
                <span className="text-[8px] uppercase tracking-[0.12em] font-accent">Add</span>
                <input
                  type="file"
                  accept={[...IMAGE_TYPES, ...VIDEO_TYPES].join(",")}
                  multiple
                  className="sr-only"
                  onChange={(e) => {
                    addFiles(e.target.files);
                    e.target.value = "";
                  }}
                />
              </label>
            </div>
          </div>

          {formError && (
            <p className="text-[12px] text-se-red-bright font-accent" role="alert">
              {formError}
            </p>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={formStatus === "saving"}
              className={`btn-primary ${formStatus === "saving" ? "opacity-70 cursor-wait" : ""}`}
            >
              {formStatus === "saving" ? "Submitting…" : "Submit Review"}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-outline">
              Cancel
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
