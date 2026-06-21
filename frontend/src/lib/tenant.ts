export function resolveTenant(): string | null {
  if (typeof window === "undefined") return null;

  // 1. Resolve from query param "?tenant=identifier" (highest priority for local dev)
  const urlParams = new URLSearchParams(window.location.search);
  const tenantParam = urlParams.get("tenant");
  if (tenantParam) {
    return tenantParam.toLowerCase();
  }

  // 2. Resolve from subdomain (e.g., vortex.localhost or vortex.portfolify.com)
  const hostname = window.location.hostname;
  const parts = hostname.split(".");

  // Local development case: e.g. vortex.localhost
  if (parts.length === 2 && parts[1] === "localhost") {
    return parts[0].toLowerCase();
  }

  // Production case: e.g. vortex.portfolify.com
  if (parts.length > 2 && parts[0] !== "www") {
    return parts[0].toLowerCase();
  }

  return null;
}
