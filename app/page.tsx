"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Photo } from "@/lib/photos";

export default function Home() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selected, setSelected] = useState<Photo | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/photos")
      .then((r) => r.json())
      .then((data) => {
        setPhotos(data);
        setLoaded(true);
      });
  }, []);

  const close = useCallback(() => setSelected(null), []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight" && selected) {
        const idx = photos.indexOf(selected);
        if (idx < photos.length - 1) setSelected(photos[idx + 1]);
      }
      if (e.key === "ArrowLeft" && selected) {
        const idx = photos.indexOf(selected);
        if (idx > 0) setSelected(photos[idx - 1]);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selected, photos, close]);

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-5"
        style={{
          background: "rgba(249,248,246,0.88)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid #e8e8e8",
        }}
      >
        <Link
          href="/"
          className="text-lg tracking-[0.2em] uppercase font-light"
          style={{ fontFamily: "Georgia, serif" }}
        >
          photog
        </Link>
        <nav
          className="flex gap-6 text-sm"
          style={{ fontFamily: "system-ui, sans-serif", color: "#888" }}
        >
          <a href="#gallery" className="hover:text-black transition-colors">
            Gallery
          </a>
        </nav>
      </header>

      <main className="pt-24 pb-24 px-6 md:px-12 max-w-7xl mx-auto">
        {/* Hero */}
        <section className="py-20 text-center">
          <p
            className="text-xs tracking-[0.35em] uppercase mb-5"
            style={{ color: "#aaa", fontFamily: "system-ui, sans-serif" }}
          >
            Personal Photography
          </p>
          <h1
            className="text-4xl md:text-6xl font-light mb-6"
            style={{ letterSpacing: "-0.01em", lineHeight: 1.1 }}
          >
            Moments, preserved.
          </h1>
          <p
            className="text-base max-w-sm mx-auto"
            style={{ color: "#888", lineHeight: 1.9 }}
          >
            A quiet collection of images from places and days worth
            remembering.
          </p>
        </section>

        {/* Gallery */}
        <section id="gallery">
          {!loaded ? (
            <div className="flex justify-center py-24">
              <div
                className="w-5 h-5 rounded-full border border-gray-300 border-t-gray-700 animate-spin"
              />
            </div>
          ) : photos.length === 0 ? (
            <div
              className="text-center py-24"
              style={{
                color: "#ccc",
                fontFamily: "system-ui, sans-serif",
                fontSize: "0.85rem",
              }}
            >
              No photos yet.
            </div>
          ) : (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
              {photos.map((photo, i) => (
                <div
                  key={photo.id}
                  className="photo-card break-inside-avoid cursor-pointer group relative overflow-hidden"
                  style={{
                    animationDelay: `${i * 0.04}s`,
                    background: "#ece9e5",
                  }}
                  onClick={() => setSelected(photo)}
                >
                  <div
                    className="relative w-full"
                    style={{
                      aspectRatio:
                        photo.width && photo.height
                          ? `${photo.width}/${photo.height}`
                          : "4/3",
                    }}
                  >
                    <Image
                      src={`/uploads/${photo.filename}`}
                      alt={photo.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.025]"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                  {/* Hover overlay */}
                  <div
                    className="absolute inset-0 flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background:
                        "linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 55%)",
                    }}
                  >
                    <p className="text-white text-sm font-light">
                      {photo.title}
                    </p>
                    {photo.location && (
                      <p
                        className="text-white/55 text-xs mt-0.5"
                        style={{ fontFamily: "system-ui, sans-serif" }}
                      >
                        {photo.location}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer
        className="border-t py-10 text-center"
        style={{
          borderColor: "#e8e8e8",
          color: "#ccc",
          fontFamily: "system-ui, sans-serif",
          fontSize: "0.78rem",
          letterSpacing: "0.05em",
        }}
      >
        <p>© {new Date().getFullYear()} photog</p>
      </footer>

      {/* Lightbox */}
      {selected && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center animate-fade-in"
          style={{ background: "rgba(6,6,6,0.97)" }}
          onClick={close}
        >
          {/* Prev */}
          {photos.indexOf(selected) > 0 && (
            <button
              className="absolute left-4 md:left-8 text-white/30 hover:text-white/80 transition-colors text-3xl select-none"
              onClick={(e) => {
                e.stopPropagation();
                setSelected(photos[photos.indexOf(selected) - 1]);
              }}
              aria-label="Previous"
            >
              ←
            </button>
          )}
          {/* Next */}
          {photos.indexOf(selected) < photos.length - 1 && (
            <button
              className="absolute right-4 md:right-8 text-white/30 hover:text-white/80 transition-colors text-3xl select-none"
              onClick={(e) => {
                e.stopPropagation();
                setSelected(photos[photos.indexOf(selected) + 1]);
              }}
              aria-label="Next"
            >
              →
            </button>
          )}

          <div
            className="flex flex-col items-center w-full px-16 max-w-5xl animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={`/uploads/${selected.filename}`}
              alt={selected.title}
              width={selected.width || 1400}
              height={selected.height || 933}
              className="object-contain w-full"
              style={{ maxHeight: "74vh" }}
              priority
            />
            <div className="mt-5 text-center">
              <p className="text-white font-light text-base">{selected.title}</p>
              <div
                className="flex gap-4 justify-center mt-1.5"
                style={{
                  color: "rgba(255,255,255,0.35)",
                  fontSize: "0.78rem",
                  fontFamily: "system-ui, sans-serif",
                  letterSpacing: "0.04em",
                }}
              >
                {selected.location && <span>{selected.location}</span>}
                {selected.takenAt && <span>{selected.takenAt}</span>}
              </div>
              {selected.description && (
                <p
                  className="mt-3 max-w-md text-sm"
                  style={{
                    color: "rgba(255,255,255,0.4)",
                    lineHeight: 1.8,
                    fontFamily: "system-ui, sans-serif",
                  }}
                >
                  {selected.description}
                </p>
              )}
            </div>
          </div>

          {/* Close */}
          <button
            className="absolute top-5 right-6 text-white/30 hover:text-white/80 text-2xl transition-colors"
            onClick={close}
            aria-label="Close"
          >
            ×
          </button>

          {/* Counter */}
          <div
            className="absolute bottom-6"
            style={{
              color: "rgba(255,255,255,0.25)",
              fontFamily: "system-ui, sans-serif",
              fontSize: "0.75rem",
              letterSpacing: "0.08em",
            }}
          >
            {photos.indexOf(selected) + 1} / {photos.length}
          </div>
        </div>
      )}
    </>
  );
}
