"use client";

import { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { Photo } from "@/lib/photos";

type UploadStatus = "idle" | "uploading" | "success" | "error";

export default function AdminUpload() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [takenAt, setTakenAt] = useState("");
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/admin");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/photos")
        .then((r) => r.json())
        .then(setPhotos);
    }
  }, [status]);

  const handleFile = (f: File) => {
    setFile(f);
    setTitle(f.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "));
    const url = URL.createObjectURL(f);
    setPreview(url);
    setUploadStatus("idle");
    setErrorMsg("");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith("image/")) handleFile(f);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setUploadStatus("uploading");
    setErrorMsg("");

    const fd = new FormData();
    fd.append("file", file);
    fd.append("title", title);
    fd.append("description", description);
    fd.append("location", location);
    fd.append("takenAt", takenAt);

    const res = await fetch("/api/upload", { method: "POST", body: fd });
    if (res.ok) {
      const newPhoto = await res.json();
      setPhotos((prev) => [newPhoto, ...prev]);
      setFile(null);
      setPreview(null);
      setTitle("");
      setDescription("");
      setLocation("");
      setTakenAt("");
      setUploadStatus("success");
      if (fileRef.current) fileRef.current.value = "";
    } else {
      const data = await res.json().catch(() => ({}));
      setErrorMsg(data.error || "Upload failed.");
      setUploadStatus("error");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this photo?")) return;
    const res = await fetch(`/api/photos/${id}`, { method: "DELETE" });
    if (res.ok) setPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#f9f8f6" }}>
        <div className="w-5 h-5 rounded-full border border-gray-300 border-t-gray-700 animate-spin" />
      </div>
    );
  }

  const inputStyle = {
    background: "#fff",
    border: "1px solid #e0e0e0",
    fontFamily: "system-ui, sans-serif",
    color: "#1a1a1a",
    width: "100%",
  };

  const labelStyle = {
    color: "#888",
    fontFamily: "system-ui, sans-serif",
    fontSize: "0.72rem",
    letterSpacing: "0.1em",
    textTransform: "uppercase" as const,
    display: "block",
    marginBottom: "6px",
  };

  return (
    <div className="min-h-screen" style={{ background: "#f9f8f6" }}>
      {/* Top bar */}
      <header
        className="flex items-center justify-between px-8 py-5"
        style={{ borderBottom: "1px solid #e8e8e8", background: "rgba(249,248,246,0.95)" }}
      >
        <div className="flex items-center gap-6">
          <span
            className="text-base tracking-[0.2em] uppercase font-light"
            style={{ fontFamily: "Georgia, serif" }}
          >
            photog
          </span>
          <span style={{ color: "#ccc" }}>|</span>
          <span
            className="text-sm"
            style={{ color: "#888", fontFamily: "system-ui, sans-serif" }}
          >
            Admin
          </span>
        </div>
        <div className="flex items-center gap-5">
          <a
            href="/"
            target="_blank"
            className="text-sm transition-colors"
            style={{ color: "#888", fontFamily: "system-ui, sans-serif" }}
            onMouseOver={(e) => (e.currentTarget.style.color = "#1a1a1a")}
            onMouseOut={(e) => (e.currentTarget.style.color = "#888")}
          >
            View site →
          </a>
          <button
            onClick={() => signOut({ callbackUrl: "/admin" })}
            className="text-sm transition-colors"
            style={{ color: "#888", fontFamily: "system-ui, sans-serif", background: "none", border: "none", cursor: "pointer" }}
            onMouseOver={(e) => (e.currentTarget.style.color = "#1a1a1a")}
            onMouseOut={(e) => (e.currentTarget.style.color = "#888")}
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Upload form */}
          <section>
            <h2
              className="text-xs tracking-[0.2em] uppercase mb-8"
              style={{ color: "#888", fontFamily: "system-ui, sans-serif" }}
            >
              Upload Photo
            </h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* Drop zone */}
              <div
                className="relative flex flex-col items-center justify-center cursor-pointer transition-colors"
                style={{
                  border: "1.5px dashed #d0d0d0",
                  background: preview ? "#000" : "#faf9f7",
                  minHeight: "220px",
                  overflow: "hidden",
                }}
                onClick={() => fileRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
              >
                {preview ? (
                  <Image
                    src={preview}
                    alt="Preview"
                    fill
                    className="object-contain"
                  />
                ) : (
                  <div className="text-center py-10 px-6">
                    <p className="text-2xl mb-3" style={{ color: "#ccc" }}>+</p>
                    <p
                      className="text-sm"
                      style={{ color: "#bbb", fontFamily: "system-ui, sans-serif" }}
                    >
                      Click or drag an image here
                    </p>
                    <p
                      className="text-xs mt-1"
                      style={{ color: "#ccc", fontFamily: "system-ui, sans-serif" }}
                    >
                      JPEG, PNG, WebP, AVIF
                    </p>
                  </div>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFile(f);
                  }}
                />
              </div>

              {/* Fields */}
              <div>
                <label style={labelStyle} htmlFor="title">Title</label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="px-4 py-3 text-sm outline-none"
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "#1a1a1a")}
                  onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label style={labelStyle} htmlFor="location">Location</label>
                  <input
                    id="location"
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Tokyo, Japan"
                    className="px-4 py-3 text-sm outline-none"
                    style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = "#1a1a1a")}
                    onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
                  />
                </div>
                <div>
                  <label style={labelStyle} htmlFor="takenAt">Date taken</label>
                  <input
                    id="takenAt"
                    type="date"
                    value={takenAt}
                    onChange={(e) => setTakenAt(e.target.value)}
                    className="px-4 py-3 text-sm outline-none"
                    style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = "#1a1a1a")}
                    onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle} htmlFor="description">Description</label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Optional caption or note"
                  className="px-4 py-3 text-sm outline-none resize-none"
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "#1a1a1a")}
                  onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
                />
              </div>

              {uploadStatus === "error" && (
                <p
                  className="text-xs"
                  style={{ color: "#c0392b", fontFamily: "system-ui, sans-serif" }}
                >
                  {errorMsg}
                </p>
              )}
              {uploadStatus === "success" && (
                <p
                  className="text-xs"
                  style={{ color: "#27ae60", fontFamily: "system-ui, sans-serif" }}
                >
                  Photo uploaded successfully.
                </p>
              )}

              <button
                type="submit"
                disabled={!file || uploadStatus === "uploading"}
                className="py-3 text-sm tracking-[0.1em] uppercase transition-colors"
                style={{
                  background: !file || uploadStatus === "uploading" ? "#e0e0e0" : "#1a1a1a",
                  color: !file || uploadStatus === "uploading" ? "#aaa" : "#fff",
                  fontFamily: "system-ui, sans-serif",
                  border: "none",
                  cursor: !file || uploadStatus === "uploading" ? "not-allowed" : "pointer",
                }}
              >
                {uploadStatus === "uploading" ? "Uploading…" : "Upload"}
              </button>
            </form>
          </section>

          {/* Manage existing */}
          <section>
            <h2
              className="text-xs tracking-[0.2em] uppercase mb-8"
              style={{ color: "#888", fontFamily: "system-ui, sans-serif" }}
            >
              Manage Photos ({photos.length})
            </h2>

            {photos.length === 0 ? (
              <p
                className="text-sm"
                style={{ color: "#ccc", fontFamily: "system-ui, sans-serif" }}
              >
                No photos uploaded yet.
              </p>
            ) : (
              <div className="flex flex-col gap-3 overflow-y-auto" style={{ maxHeight: "70vh" }}>
                {photos.map((photo) => (
                  <div
                    key={photo.id}
                    className="flex items-center gap-4 group"
                    style={{ border: "1px solid #ebebeb", padding: "10px", background: "#fff" }}
                  >
                    <div
                      className="relative flex-shrink-0"
                      style={{ width: 64, height: 48, background: "#f0eeec", overflow: "hidden" }}
                    >
                      <Image
                        src={`/uploads/${photo.filename}`}
                        alt={photo.title}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm font-light truncate"
                        style={{ fontFamily: "Georgia, serif" }}
                      >
                        {photo.title}
                      </p>
                      <p
                        className="text-xs truncate mt-0.5"
                        style={{ color: "#bbb", fontFamily: "system-ui, sans-serif" }}
                      >
                        {photo.location && `${photo.location} · `}
                        {photo.takenAt}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(photo.id)}
                      className="text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{
                        color: "#c0392b",
                        fontFamily: "system-ui, sans-serif",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        flexShrink: 0,
                      }}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
