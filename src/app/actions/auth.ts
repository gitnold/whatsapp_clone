"use server";

import { redirect, unstable_rethrow } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { FormState } from "@/lib/definitions";

export async function signup(state: FormState, formData: FormData): Promise<FormState> {
  const fullName = formData.get("fullName") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!fullName || fullName.length < 2) {
    return {
      errors: { fullName: ["Name must be at least 2 characters."] },
    };
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return {
      errors: { email: ["Please enter a valid email."] },
    };
  }

  if (!password || password.length < 6) {
    return {
      errors: { password: ["Password must be at least 6 characters."] },
    };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  });

  if (error) {
    return { message: error.message };
  }

  if (data.user) {
    await db.insert(users).values({
      id: data.user.id,
      email: data.user.email!,
      fullName,
    });
  }

  redirect("/chat");
}

export async function login(state: FormState, formData: FormData): Promise<FormState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return {
      errors: { email: ["Please enter a valid email."] },
    };
  }

  if (!password) {
    return {
      errors: { password: ["Password is required."] },
    };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { message: error.message };
  }

  redirect("/chat");
}

export async function loginWithGoogle() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SUPABASE_URL!.replace(
        /\.supabase\.co$/,
        ".supabase.co"
      )}/auth/v1/callback`,
    },
  });

  if (error) {
    redirect("/login?error=" + encodeURIComponent(error.message));
  }

  if (data.url) {
    redirect(data.url);
  }
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function getCurrentUser() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const dbUser = await db.query.users.findFirst({
      where: eq(users.id, user.id),
    });

    return dbUser || null;
  } catch (error) {
    unstable_rethrow(error);
    console.error("Supabase auth error in getCurrentUser:", error);
    return null;
  }
}
