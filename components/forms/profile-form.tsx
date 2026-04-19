"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

type User = {
  id: string;
  phone: string;
  name?: string;
  email?: string;
  city?: string;
  avatarUrl?: string;
  role: "user" | "admin";
};

export default function ProfileForm() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    let active = true;

    fetch("/api/auth/me", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (active) {
          setUser(data.user || null);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          setUser(null);
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!user) return;

    setSaving(true);
    setMessage("");
    setError("");

    const formData = new FormData(event.currentTarget);

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          city: formData.get("city"),
          avatarUrl: formData.get("avatarUrl"),
          currentPassword,
          newPassword,
          confirmPassword
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save profile");
      }

      setUser(data.user);
      setMessage("Profile updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="soft-card rounded-3xl p-6">Loading profile...</div>;
  }

  if (!user) {
    return (
      <div className="soft-card rounded-3xl p-6">
        <h2 className="text-2xl font-black">Please login first</h2>
        <p className="mt-2 text-sm text-on-surface-variant">You need email-password login to update your profile or raise tickets.</p>
        <Link href="/login?next=/profile" className="btn-primary mt-4">
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <form onSubmit={handleSubmit} className="soft-card rounded-3xl p-6 md:p-8">
        <h2 className="text-3xl font-black">Your Profile</h2>
        <p className="mt-1 text-sm text-on-surface-variant">Phone: {user.phone}</p>
        <p className="mt-1 text-sm text-on-surface-variant">Login Email: {user.email || "Not set"}</p>
        <p className="mt-1 text-sm text-on-surface-variant">
          Password: Hidden for security. Use fields below to change it anytime.
        </p>

        <div className="mt-6 grid gap-4">
          <div>
            <label className="label-text" htmlFor="name">
              Full Name
            </label>
            <input id="name" name="name" className="input-plain" defaultValue={user.name || ""} />
          </div>

          <div>
            <label className="label-text" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="input-plain"
              value={user.email || ""}
              readOnly
            />
            <p className="mt-1 text-xs text-on-surface-variant">Email is your login username.</p>
          </div>

          <div>
            <label className="label-text" htmlFor="city">
              City
            </label>
            <input id="city" name="city" className="input-plain" defaultValue={user.city || ""} />
          </div>

          <div>
            <label className="label-text" htmlFor="avatarUrl">
              Avatar Image URL
            </label>
            <input
              id="avatarUrl"
              name="avatarUrl"
              className="input-plain"
              placeholder="https://..."
              defaultValue={user.avatarUrl || ""}
            />
          </div>

          <div className="rounded-2xl border border-outline-variant/35 bg-surface-container-low p-4">
            <h4 className="text-lg font-bold text-on-surface">Change Password</h4>
            <p className="mt-1 text-xs text-on-surface-variant">
              Enter these only when you want to update your password.
            </p>

            <div className="mt-3 grid gap-3">
              <div>
                <label className="label-text" htmlFor="currentPassword">
                  Current Password
                </label>
                <input
                  id="currentPassword"
                  type="password"
                  className="input-plain"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  placeholder="Current password"
                />
              </div>

              <div>
                <label className="label-text" htmlFor="newPassword">
                  New Password
                </label>
                <input
                  id="newPassword"
                  type="password"
                  className="input-plain"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  placeholder="At least 6 characters"
                  minLength={6}
                />
              </div>

              <div>
                <label className="label-text" htmlFor="confirmPassword">
                  Confirm New Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  className="input-plain"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Re-enter new password"
                  minLength={6}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button className="btn-primary" type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Profile"}
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              window.location.href = "/";
            }}
          >
            Logout
          </button>
          {user.role === "admin" ? (
            <Link href="/admin" className="btn-secondary">
              Open Admin Dashboard
            </Link>
          ) : null}
        </div>

        {message ? <p className="mt-4 text-sm font-semibold text-secondary">{message}</p> : null}
        {error ? <p className="mt-4 text-sm font-semibold text-red-600">{error}</p> : null}
      </form>

      <div className="soft-card rounded-3xl p-6 md:p-8">
        <h3 className="text-2xl font-black">Support & Orders</h3>
        <p className="mt-2 text-sm text-on-surface-variant">
          Need help with delivery, product details, or custom stationery bundles? Raise a support ticket.
        </p>
        <Link href="/tickets" className="btn-primary mt-5">
          Go to Tickets
        </Link>
      </div>
    </div>
  );
}
