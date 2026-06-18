import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const email = process.env.SEED_ADMIN_EMAIL ?? "admin@morfinance.io";
const password = process.env.SEED_ADMIN_PASSWORD ?? "MorfinanceAdmin123!";
const fullName = process.env.SEED_ADMIN_NAME ?? "Morfinance Admin";

const supabaseUrl =
  process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    "Missing SUPABASE_URL (or VITE_SUPABASE_URL) or SUPABASE_SERVICE_ROLE_KEY. Set them in .env before seeding."
  );
  process.exit(1);
}

const adminClient = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

async function findUserByEmail(targetEmail: string) {
  const { data, error } = await adminClient.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data.users.find(
    (user) => user.email?.toLowerCase() === targetEmail.toLowerCase()
  );
}

async function ensureSeedConfig() {
  const { error } = await adminClient.from("platform_config").upsert(
    {
      key: "seed_admin_emails",
      value: email,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "key" }
  );

  if (error) {
    throw new Error(`Failed to update platform_config: ${error.message}`);
  }
}

async function promoteProfile(userId: string) {
  const { error } = await adminClient
    .from("profiles")
    .update({
      role: "admin",
      full_name: fullName,
      email,
    })
    .eq("id", userId);

  if (error) {
    throw new Error(`Failed to promote profile: ${error.message}`);
  }
}

async function main() {
  console.log(`Seeding Morfinance admin: ${email}`);

  await ensureSeedConfig();

  let user = await findUserByEmail(email);

  if (!user) {
    const { data, error } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
      },
    });

    if (error || !data.user) {
      throw new Error(error?.message ?? "Failed to create admin user.");
    }

    user = data.user;
    console.log("Created admin auth user.");
  } else {
    console.log("Admin auth user already exists.");
  }

  await promoteProfile(user.id);

  console.log("Admin profile promoted.");
  console.log("");
  console.log("Sign in with:");
  console.log(`  Email:    ${email}`);
  console.log(`  Password: ${password}`);
  console.log("");
  console.log("Admin dashboard: http://localhost:5173/admin");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
