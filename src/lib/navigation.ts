export function getPostAuthDestination(state: unknown): string | null {
  if (!state || typeof state !== "object" || !("from" in state)) return null;

  const from = (state as { from?: unknown }).from;
  if (typeof from !== "string" || !from.startsWith("/") || from.startsWith("//") || from.includes("\\")) {
    return null;
  }

  const target = new URL(from, window.location.origin);
  if (
    target.origin !== window.location.origin ||
    target.pathname === "/auth" ||
    target.pathname === "/reset-password"
  ) {
    return null;
  }

  return `${target.pathname}${target.search}${target.hash}`;
}
