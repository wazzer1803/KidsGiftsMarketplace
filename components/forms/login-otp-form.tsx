"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { normalizeNextPath } from "@/lib/client-auth";

type AuthMode = "signup" | "login";

export default function LoginOtpForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next");

  const [mode, setMode] = useState<AuthMode>("signup");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function navigateAfterAuth(data: any) {
    const safeNext = normalizeNextPath(next);
    const destination = safeNext || (data.user?.role === "admin" ? "/admin" : "/profile");
    router.push(destination);
    router.refresh();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const payload = mode === "signup" ? { phone, email, password } : { email, password };
      const endpoint = mode === "signup" ? "/api/auth/signup" : "/api/auth/login";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Authentication failed.");
      }

      setMessage(mode === "signup" ? "Account created. Redirecting..." : "Login successful. Redirecting...");
      navigateAfterAuth(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="soft-card mx-auto w-full max-w-md rounded-3xl p-6 md:p-8">
      <div className="mb-4 flex gap-2 rounded-2xl bg-surface-container p-1">
        <button
          type="button"
          className={`flex-1 rounded-xl px-3 py-2 text-sm font-bold transition-colors ${
            mode === "signup" ? "bg-primary text-on-primary" : "text-on-surface"
          }`}
          onClick={() => {
            setMode("signup");
            setMessage("");
            setError("");
          }}
        >
          Sign Up
        </button>
        <button
          type="button"
          className={`flex-1 rounded-xl px-3 py-2 text-sm font-bold transition-colors ${
            mode === "login" ? "bg-primary text-on-primary" : "text-on-surface"
          }`}
          onClick={() => {
            setMode("login");
            setMessage("");
            setError("");
          }}
        >
          Login
        </button>
      </div>

      <h2 className="text-3xl font-black text-on-surface">{mode === "signup" ? "Create Account" : "Login to Account"}</h2>
      <p className="mt-2 text-sm text-on-surface-variant">
        {mode === "signup"
          ? "Enter phone, email and password. Admin role is mapped from phone number in env."
          : "Login using your email and password."}
      </p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        {mode === "signup" ? (
          <div>
            <label className="label-text" htmlFor="phone">
              Phone Number
            </label>
            <input
              id="phone"
              type="tel"
              className="input-plain"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="+918692088987"
              required
            />
          </div>
        ) : null}

        <div>
          <label className="label-text" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="input-plain"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            required
          />
        </div>

        <div>
          <label className="label-text" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            className="input-plain"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="At least 6 characters"
            minLength={6}
            required
          />
        </div>

        <button className="btn-primary w-full" type="submit" disabled={loading}>
          {loading ? (mode === "signup" ? "Creating account..." : "Logging in...") : mode === "signup" ? "Create Account" : "Login"}
        </button>
      </form>

      {message ? <p className="mt-4 text-sm font-semibold text-secondary">{message}</p> : null}
      {error ? <p className="mt-4 text-sm font-semibold text-red-600">{error}</p> : null}
    </div>
  );
}
