import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("Cloudflare headers declare the static application security baseline", () => {
  const headers = readFileSync(new URL("../public/_headers", import.meta.url), "utf8");
  for (const directive of [
    "Content-Security-Policy:",
    "X-Content-Type-Options: nosniff",
    "Referrer-Policy:",
    "Permissions-Policy:",
    "frame-ancestors 'none'",
    "script-src 'self'",
    "object-src 'none'",
  ]) {
    assert.ok(headers.includes(directive), `missing ${directive}`);
  }
});
