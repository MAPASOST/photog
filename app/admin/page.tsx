"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/admin/upload");
    }
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.ok) {
      router.replace("/admin/upload");
    } else {
      setError("Invalid credentials.");
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#f9f8f6" }}>
        <div className="w-5 h-5 rounded-full border border-gray-300 border-t-gray-700 animate-spin" />
      </div>
    );
  }

  if (session) return null;

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center"
      style={{ background: "#f9f8f6" }}
    >
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <p
            className="text-xl tracking-[0.2em] uppercase font-light mb-2"
            style={{ fontFamily: "Georgia, serif" }}
          >
            photog
          </p>
          <p
            className="text-sm"
            style={{ color: "#aaa", fontFamily: "system-ui, sans-serif" }}
          >
            Admin
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label
              className="block text-xs mb-1.5 tracking-widest uppercase"
              style={{ color: "#888", fontFamily: "system-ui, sans-serif" }}
              htmlFor="username"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-4 py-3 text-sm outline-none transition-colors"
              style={{
                background: "#fff",
                border: "1px solid #e0e0e0",
                fontFamily: "system-ui, sans-serif",
                color: "#1a1a1a",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#1a1a1a")}
              onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
            />
          </div>

          <div>
            <label
              className="block text-xs mb-1.5 tracking-widest uppercase"
              style={{ color: "#888", fontFamily: "system-ui, sans-serif" }}
              htmlFor="password"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 text-sm outline-none transition-colors"
              style={{
                background: "#fff",
                border: "1px solid #e0e0e0",
                fontFamily: "system-ui, sans-serif",
                color: "#1a1a1a",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#1a1a1a")}
              onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
            />
          </div>

          {error && (
            <p
              className="text-xs text-center"
              style={{ color: "#c0392b", fontFamily: "system-ui, sans-serif" }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 text-sm tracking-[0.1em] uppercase transition-colors mt-2"
            style={{
              background: loading ? "#ccc" : "#1a1a1a",
              color: "#fff",
              fontFamily: "system-ui, sans-serif",
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
