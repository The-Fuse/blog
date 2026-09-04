"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setPending(false);
    if (!res.ok) {
      setError("Wrong password.");
      return;
    }
    router.push(params.get("next") || "/admin");
    router.refresh();
  }

  return (
    <form className="login-card" onSubmit={onSubmit}>
      <span style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", display: "block" }}>Rohit Yadav</span>
      <span className="mono-sm" style={{ color: "var(--copper)" }}>Admin</span>
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoFocus
      />
      {error ? <p style={{ color: "var(--verm)", fontSize: "0.9rem", margin: "0 0 12px" }}>{error}</p> : null}
      <button type="submit" className="primary-btn" disabled={pending}>
        {pending ? "Signing in…" : "Enter"}
      </button>
    </form>
  );
}
