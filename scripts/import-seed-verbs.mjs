import fs from "node:fs";
import path from "node:path";
import { parse as parseCsv } from "csv-parse/sync";
import { createClient } from "@supabase/supabase-js";

function normalizeArgValue(value) {
  if (!value) {
    return value;
  }

  return value
    .trim()
    .replace(/^["'“”‘’]+/, "")
    .replace(/["'“”‘’]+$/, "");
}

function getArg(flag) {
  const index = process.argv.indexOf(flag);
  if (index === -1 || index + 1 >= process.argv.length) {
    return undefined;
  }
  return normalizeArgValue(process.argv[index + 1]);
}

function hasFlag(flag) {
  return process.argv.includes(flag);
}

function getRequiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

async function resolveUserId(supabase, { userId, email }) {
  if (userId) {
    return userId;
  }

  if (!email) {
    throw new Error("Provide either --user-id or --email.");
  }

  let page = 1;
  const perPage = 200;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage,
    });

    if (error) {
      throw new Error(`Unable to list users: ${error.message}`);
    }

    const found = data.users.find((user) => user.email?.toLowerCase() === email.toLowerCase());
    if (found) {
      return found.id;
    }

    if (data.users.length < perPage) {
      break;
    }

    page += 1;
  }

  throw new Error(`No Supabase user found for email: ${email}`);
}

function readCsvRows(csvPath) {
  const content = fs.readFileSync(csvPath, "utf8");
  const rows = parseCsv(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  if (!rows.length) {
    throw new Error("CSV appears empty.");
  }

  return rows;
}

async function main() {
  const supabaseUrl = getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY");

  const csvArg = getArg("--file");
  const csvPath = csvArg
    ? path.resolve(process.cwd(), csvArg)
    : path.resolve(process.cwd(), "../verbs1-500-spain-final.csv");

  if (!fs.existsSync(csvPath)) {
    throw new Error(`CSV file not found: ${csvPath}`);
  }

  const userIdArg = getArg("--user-id");
  const emailArg = getArg("--email");
  const shouldReplace = !hasFlag("--append");

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const userId = await resolveUserId(supabase, {
    userId: userIdArg,
    email: emailArg,
  });

  const rows = readCsvRows(csvPath);
  const prepared = rows.map((row) => {
    const aiEnrichment = row.meta_json ? JSON.parse(row.meta_json) : null;
    return {
      user_id: userId,
      word: row.word,
      translation: row.translation,
      part_of_speech: row.part_of_speech,
      notes: row.notes || null,
      source_context: row.source_context || "seed_b1_b2_core",
      example_sentence: row.example_sentence || null,
      ai_enrichment: aiEnrichment,
    };
  });

  if (shouldReplace) {
    const { error: deleteError } = await supabase
      .from("vocab_items")
      .delete()
      .eq("user_id", userId)
      .eq("source_context", "seed_b1_b2_core");

    if (deleteError) {
      throw new Error(`Failed deleting existing seeded rows: ${deleteError.message}`);
    }
  }

  const batchSize = 200;
  for (let i = 0; i < prepared.length; i += batchSize) {
    const batch = prepared.slice(i, i + batchSize);
    const { error } = await supabase.from("vocab_items").insert(batch);
    if (error) {
      throw new Error(`Insert failed for batch ${i / batchSize + 1}: ${error.message}`);
    }
  }

  console.log(`Imported ${prepared.length} verbs for user ${userId}.`);
  console.log(`Mode: ${shouldReplace ? "replace" : "append"}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
