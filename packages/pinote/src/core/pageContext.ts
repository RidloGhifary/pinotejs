import type { PageContext } from "./types";

export function normalizePath(path: string): string {
  if (!path) return "/";
  // Remove trailing slashes unless it's exactly "/"
  const normalized = path.endsWith("/") && path.length > 1 ? path.slice(0, -1) : path;
  return normalized;
}

export function getPageContext(doc?: Document): PageContext {
  const ownerDocument =
    doc ?? (typeof document !== "undefined" ? document : undefined);
  const ownerWindow =
    ownerDocument?.defaultView ??
    (typeof window !== "undefined" ? window : undefined);
  const location = ownerWindow?.location;
  const route = location?.pathname ?? "";

  return {
    path: normalizePath(route),
    route,
    url: location?.href ?? "",
    origin: location?.origin ?? "",
    title: ownerDocument?.title ?? "",
    capturedAt: new Date().toISOString(),
  };
}
