/**
 * Enable Google OAuth on a hosted Supabase project (Management API).
 *
 * Requires in .env.local (or env):
 *   SUPABASE_ACCESS_TOKEN — https://supabase.com/dashboard/account/tokens
 *   AUTH_GOOGLE_ID
 *   AUTH_GOOGLE_SECRET
 *
 * Usage: node scripts/configure-supabase-google.mjs [project-ref]
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const projectRef = process.argv[2] ?? "suokltvrqhrttiqfzmtc";

function loadEnvLocal() {
  try {
    const raw = readFileSync(resolve(".env.local"), "utf8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (process.env[key] === undefined) process.env[key] = val;
    }
  } catch {
    // optional
  }
}

loadEnvLocal();

const token = process.env.SUPABASE_ACCESS_TOKEN;
const clientId = process.env.AUTH_GOOGLE_ID;
const clientSecret = process.env.AUTH_GOOGLE_SECRET;

if (!token) {
  console.error(
    "SUPABASE_ACCESS_TOKEN is missing. Create one at https://supabase.com/dashboard/account/tokens"
  );
  process.exit(1);
}
if (!clientId || !clientSecret) {
  console.error("AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET must be set in .env.local");
  process.exit(1);
}

const body = {
  external_google_enabled: true,
  external_google_client_id: clientId,
  external_google_secret: clientSecret,
  site_url: "http://localhost:3000",
  uri_allow_list:
    "http://localhost:3000/auth/callback,http://localhost:3000/**",
};

const res = await fetch(
  `https://api.supabase.com/v1/projects/${projectRef}/config/auth`,
  {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  }
);

const text = await res.text();
if (!res.ok) {
  console.error(`Failed (${res.status}):`, text);
  process.exit(1);
}

console.log(`Google auth enabled for project ${projectRef}.`);
console.log(
  "Also add this redirect URI in Google Cloud Console → OAuth client:"
);
console.log(`  https://${projectRef}.supabase.co/auth/v1/callback`);
