const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  process.exit(1);
}

const response = await fetch(`${url}/auth/v1/settings`, {
  headers: {
    apikey: anonKey,
    Authorization: `Bearer ${anonKey}`,
  },
});

if (!response.ok) {
  console.error(`Supabase check failed with status ${response.status}`);
  process.exit(1);
}

console.log("Supabase reachable. Cross-device sync backend is online.");
