type AuthMeResponse = {
  authenticated?: boolean;
  user?: unknown;
};

export function normalizeNextPath(rawNext?: string | null) {
  if (!rawNext) {
    return null;
  }

  const trimmed = rawNext.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return null;
  }

  return trimmed;
}

export function getCurrentPathWithSearchAndHash() {
  if (typeof window === "undefined") {
    return "/";
  }

  return `${window.location.pathname}${window.location.search}${window.location.hash}`;
}

export function buildLoginHref(nextPath?: string | null) {
  const next = normalizeNextPath(nextPath) || "/";
  return `/login?next=${encodeURIComponent(next)}`;
}

export function redirectToLogin(nextPath?: string | null) {
  if (typeof window === "undefined") {
    return;
  }

  window.location.href = buildLoginHref(nextPath || getCurrentPathWithSearchAndHash());
}

export async function isAuthenticatedClientSide() {
  try {
    const response = await fetch("/api/auth/me", {
      method: "GET",
      cache: "no-store",
      credentials: "same-origin"
    });

    if (!response.ok) {
      return false;
    }

    const data = (await response.json()) as AuthMeResponse;
    return Boolean(data.authenticated && data.user);
  } catch {
    return false;
  }
}

export async function ensureAuthenticatedOrRedirect(nextPath?: string | null) {
  const authenticated = await isAuthenticatedClientSide();

  if (authenticated) {
    return true;
  }

  redirectToLogin(nextPath);
  return false;
}
