"use client";
import { useState } from "react";
import { PixelCard } from "../../components/pixel/PixelCard";
import { PixelButton } from "../../components/pixel/PixelButton";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) throw new Error("WRONG PASSWORD");
      window.location.href = "/admin";
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-12">
      <PixelCard>
        <h1 className="font-pixel text-rl-text text-sm uppercase mb-4">Host Login</h1>
        <form onSubmit={submit} className="space-y-3">
          <input
            type="password"
            required
            placeholder="ADMIN_SECRET"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full"
          />
          {err && <div className="font-sans text-xs text-rl-danger">{err}</div>}
          <PixelButton type="submit" className="w-full" disabled={loading}>
            {loading ? "..." : "ENTER →"}
          </PixelButton>
        </form>
      </PixelCard>
    </div>
  );
}
