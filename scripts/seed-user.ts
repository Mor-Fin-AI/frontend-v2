import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const email = process.env.SEED_USER_EMAIL ?? "user@morfinance.io";
const password = process.env.SEED_USER_PASSWORD ?? "MorfinanceUser123!";
const fullName = process.env.SEED_USER_NAME ?? "Demo User";

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
    throw new Error(
      `Auth admin API failed: ${error.message}. Check SUPABASE_SERVICE_ROLE_KEY (use the service_role JWT from Supabase → Settings → API, not the publishable key).`
    );
  }

  return data.users.find(
    (user) => user.email?.toLowerCase() === targetEmail.toLowerCase()
  );
}

async function ensureProfile(userId: string) {
  const { error } = await adminClient.from("profiles").upsert(
    {
      id: userId,
      email,
      full_name: fullName,
      role: "user",
    },
    { onConflict: "id" }
  );

  if (error) {
    throw new Error(
      `Failed to upsert profile: ${error.message}. Have you run supabase migrations 001–004?`
    );
  }
}

async function main() {
  console.log(`Seeding Morfinance user: ${email}`);

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
      throw new Error(error?.message ?? "Failed to create user.");
    }

    user = data.user;
    console.log("Created auth user.");
  } else {
    const { error } = await adminClient.auth.admin.updateUserById(user.id, {
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
      },
    });

    if (error) {
      throw new Error(`Failed to update existing user: ${error.message}`);
    }

    console.log("Auth user already exists — password refreshed.");
  }

  await ensureProfile(user.id);

  console.log("User profile ready.");
  console.log("");
  console.log("Sign in with:");
  console.log(`  Email:    ${email}`);
  console.log(`  Password: ${password}`);
  console.log("");
  console.log("Dashboard: http://localhost:5173/sign-in");
}

main().catch((error: unknown) => {
  if (error instanceof Error) {
    console.error(error.message);
  } else if (error && typeof error === "object" && "message" in error) {
    console.error(String((error as { message: unknown }).message));
  } else {
    console.error("Seed failed:", error);
  }
  process.exit(1);
});
