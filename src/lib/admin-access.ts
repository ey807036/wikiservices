const ADMIN_EMAILS = new Set(["admin@wikiservices.pk", "haki84226@gmail.com"]);

export function isAdminEmail(email?: string | null) {
  return ADMIN_EMAILS.has((email ?? "").trim().toLowerCase());
}
