"use client";

import { useActionState } from "react";
import { signup, loginWithGoogle } from "@/app/actions/auth";
import Link from "next/link";
import type { FormState } from "@/lib/definitions";

const initialState: FormState = {
  errors: undefined,
  message: undefined,
};

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState(signup, initialState);

  return (
    <div className="min-h-screen flex items-center justify-center bg-wa-bg">
      <div className="w-full max-w-md mx-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-wa-header-bg p-6 text-center">
            <h1 className="text-2xl font-bold text-white">
              Create an Account
            </h1>
            <p className="text-green-100 mt-1 text-sm">
              Join groups and start chatting
            </p>
          </div>

          <div className="p-8">
            <form action={formAction} className="space-y-4">
              <div>
                <label
                  htmlFor="fullName"
                  className="block text-sm font-medium text-wa-text mb-1"
                >
                  Full Name
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  className="w-full px-4 py-2.5 border border-wa-border rounded-lg focus:outline-none focus:ring-2 focus:ring-wa-green focus:border-transparent text-sm"
                  placeholder="John Doe"
                />
                {state?.errors?.fullName && (
                  <p className="text-red-500 text-xs mt-1">
                    {state.errors.fullName[0]}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-wa-text mb-1"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="w-full px-4 py-2.5 border border-wa-border rounded-lg focus:outline-none focus:ring-2 focus:ring-wa-green focus:border-transparent text-sm"
                  placeholder="you@example.com"
                />
                {state?.errors?.email && (
                  <p className="text-red-500 text-xs mt-1">
                    {state.errors.email[0]}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-wa-text mb-1"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  className="w-full px-4 py-2.5 border border-wa-border rounded-lg focus:outline-none focus:ring-2 focus:ring-wa-green focus:border-transparent text-sm"
                  placeholder="At least 6 characters"
                />
                {state?.errors?.password && (
                  <p className="text-red-500 text-xs mt-1">
                    {state.errors.password[0]}
                  </p>
                )}
              </div>

              {state?.message && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2 rounded-lg">
                  {state.message}
                </div>
              )}

              <button
                type="submit"
                disabled={pending}
                className="w-full bg-wa-green hover:bg-wa-green-dark text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {pending ? "Creating account..." : "Create Account"}
              </button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-wa-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-4 text-wa-text-secondary">
                  or continue with
                </span>
              </div>
            </div>

            <form action={loginWithGoogle}>
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-3 border border-wa-border hover:bg-wa-hover text-wa-text font-medium py-2.5 rounded-lg transition-colors text-sm"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Sign up with Google
              </button>
            </form>

            <p className="text-center text-sm text-wa-text-secondary mt-6">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-wa-green font-medium hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
