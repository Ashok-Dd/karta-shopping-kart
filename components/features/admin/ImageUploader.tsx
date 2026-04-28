"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Upload, X, ImagePlus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/Toaster";

interface ImageUploaderProps {
  value: string[];                          // current image URLs
  onChange: (urls: string[]) => void;       // called with updated URLs
  maxImages?: number;
}

export function ImageUploader({ value, onChange, maxImages = 5 }: ImageUploaderProps) {
  const inputRef  = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  async function uploadFile(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
    const data = await res.json();

    if (!res.ok) throw new Error(data.error || "Upload failed");
    return data.url as string;
  }

  async function handleFiles(files: FileList | File[]) {
    const arr = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (arr.length === 0) return;

    const remaining = maxImages - value.length;
    if (remaining <= 0) {
      toast.warning(`Max ${maxImages} images allowed`);
      return;
    }

    const toUpload = arr.slice(0, remaining);
    setLoading(true);

    try {
      const urls = await Promise.all(toUpload.map(uploadFile));
      onChange([...value, ...urls]);
      toast.success(`${urls.length} image${urls.length > 1 ? "s" : ""} uploaded`);
    } catch (err) {
      toast.error("Upload failed", err instanceof Error ? err.message : "Please try again.");
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function removeImage(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Existing images */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((url, i) => (
            <div
              key={url}
              className="relative w-20 h-20 rounded-xl overflow-hidden group"
              style={{ border: "1px solid var(--color-border)" }}
            >
              <Image
                src={url}
                alt={`Product image ${i + 1}`}
                fill
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                aria-label="Remove image"
              >
                <X size={16} className="text-white" />
              </button>
              {i === 0 && (
                <span className="absolute bottom-1 left-1 text-[9px] font-semibold px-1.5 py-0.5 rounded"
                  style={{ background: "var(--color-accent-2)", color: "#fff" }}>
                  Main
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Drop zone */}
      {value.length < maxImages && (
        <div
          onClick={() => !loading && inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className={cn(
            "flex flex-col items-center justify-center gap-2 rounded-xl cursor-pointer transition-all",
            "border-2 border-dashed py-7 px-4 text-center",
            dragOver
              ? "border-(--color-accent-2) bg-(--color-accent-dim)"
              : "border-(--color-border) hover:border-(--color-accent-2) hover:bg-(--color-accent-dim)"
          )}
        >
          {loading ? (
            <>
              <Loader2 size={22} className="animate-spin" style={{ color: "var(--color-accent-2)" }} />
              <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>Uploading…</p>
            </>
          ) : (
            <>
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: "var(--color-surface-2)" }}
              >
                {value.length === 0 ? (
                  <ImagePlus size={18} style={{ color: "var(--color-accent-2)" }} />
                ) : (
                  <Upload size={18} style={{ color: "var(--color-accent-2)" }} />
                )}
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--color-text)" }}>
                  {value.length === 0 ? "Upload product images" : "Add more images"}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "var(--color-text-subtle)" }}>
                  Drag & drop or click · JPG, PNG, WebP · Max 5MB each
                </p>
                <p className="text-xs mt-0.5" style={{ color: "var(--color-text-subtle)" }}>
                  {value.length}/{maxImages} images
                </p>
              </div>
            </>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
      />
    </div>
  );
}