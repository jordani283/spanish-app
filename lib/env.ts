function getEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

export function getPublicSupabaseConfig() {
  return {
    url: getEnv("NEXT_PUBLIC_SUPABASE_URL"),
    anonKey: getEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  };
}

export function getOpenAiConfig() {
  return {
    apiKey: getEnv("OPENAI_API_KEY"),
  };
}
