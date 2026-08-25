"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signInWithEmailAndPassword } from "firebase/auth";
import { FieldError } from "@/components/FieldError";
import { useAuth } from "@/lib/AuthContext";
import { auth } from "@/lib/firebase";
import { mapFirebaseAuthError } from "@/lib/firebaseErrors";

// ── Types ─────────────────────────────────────────────────────────────────────

type Fields = {
  email: string;
  password: string;
  rememberMe: boolean;
};

type Errors = Partial<Record<keyof Fields, string>>;

// ── Validation ────────────────────────────────────────────────────────────────

function validate(f: Fields): Errors {
  const e: Errors = {};
  if (!f.email.trim()) e.email = "Email is required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = "Enter a valid email address";

  if (!f.password) e.password = "Password is required";
  return e;
}

// ── Styles ────────────────────────────────────────────────────────────────────
// Same split SignUpForm uses: shared .input-field base + stateful border/focus.

function fieldCls(hasError?: string) {
  return `input-field ${hasError ? "border-red-400 focus:border-red-400" : "border-sand focus:border-sage"}`;
}

// ── Eye icon ──────────────────────────────────────────────────────────────────

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

// ── Inner Form Component ──────────────────────────────────────────────────────

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAdmin, loading } = useAuth();

  // 1. Extract return target, else send admins to the console and everyone else to bookings.
  const explicitRedirect = searchParams.get("redirect");
  const redirectUrl = explicitRedirect || (isAdmin ? "/admin" : "/bookings");

  // 2. Preserve redirect URL when switching to Sign Up
  const signUpUrl = searchParams.get("redirect")
    ? `/signup?redirect=${encodeURIComponent(searchParams.get("redirect")!)}`
    : "/signup";

  const [fields, setFields] = useState<Fields>({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof Fields, boolean>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    // Wait for `loading` to clear so isAdmin has resolved before picking a default target.
    if (!loading && user) {
      router.replace(redirectUrl);
    }
  }, [loading, user, router, redirectUrl]);

  function set(field: keyof Fields, value: string | boolean) {
    const next = { ...fields, [field]: value };
    setFields(next);
    setSubmitError(null);
    if (touched[field]) {
      const e = validate(next);
      setErrors((prev) => ({ ...prev, [field]: e[field] }));
    }
  }

  function touch(field: keyof Fields) {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const e = validate(fields);
    setErrors((prev) => ({ ...prev, [field]: e[field] }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const allTouched = Object.fromEntries(
      Object.keys(fields).map((k) => [k, true])
    ) as Record<keyof Fields, boolean>;
    setTouched(allTouched);

    const errs = validate(fields);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      await signInWithEmailAndPassword(auth, fields.email, fields.password);
      // Redirect happens in the effect above, once AuthContext resolves the signed-in
      // user's profile and admin claim (redirectUrl depends on isAdmin).
    } catch (error: unknown) {
      setSubmitError(mapFirebaseAuthError(error, "Failed to log in. Please try again."));
    } finally {
      setSubmitting(false);
    }
  }

  const err = (field: keyof Fields) => (touched[field] ? errors[field] : undefined);

  return (
    <form onSubmit={handleSubmit} noValidate className="flex w-full max-w-[400px] flex-col items-start gap-[24px]">
      {/* ── Heading ── */}
      <div className="flex w-full flex-col items-start gap-[10px]">
        <p className="font-jakarta text-[12px] font-medium uppercase tracking-[3px] text-sage">
          Member Access
        </p>
        <h1 className="font-fraunces text-heading-sm font-medium tracking-[-0.5px] text-jungle-dark sm:text-heading-md lg:text-heading-lg">
          Welcome back
        </h1>
        <p className="font-jakarta text-field text-jungle/65 lg:text-[16px]">
          Log in to manage your reservation.
        </p>
      </div>

      {/* ── Fields ── */}
      <div className="flex w-full flex-col gap-[14px]">
        <div className="flex flex-col gap-[4px]">
          <input
            type="email"
            placeholder="Email*"
            value={fields.email}
            onChange={(e) => set("email", e.target.value)}
            onBlur={() => touch("email")}
            className={fieldCls(err("email"))}
          />
          <FieldError message={err("email")} />
        </div>

        <div className="flex flex-col gap-[4px]">
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password*"
              value={fields.password}
              onChange={(e) => set("password", e.target.value)}
              onBlur={() => touch("password")}
              className={`${fieldCls(err("password"))} pr-[44px]`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-[16px] top-1/2 -translate-y-1/2 text-jungle/50 transition-colors hover:text-jungle"
            >
              <EyeIcon open={showPassword} />
            </button>
          </div>
          <FieldError message={err("password")} />
        </div>
      </div>

      {/* ── Remember me ── */}
      <label className="flex cursor-pointer select-none items-center gap-[10px]">
        <input
          type="checkbox"
          checked={fields.rememberMe}
          onChange={(e) => set("rememberMe", e.target.checked)}
          className="form-checkbox border-sage"
        />
        <span className="font-jakarta text-meta text-jungle/85">Remember me</span>
      </label>

      {submitError && (
        <div className="w-full rounded-input border border-red-400 px-4 py-3 font-jakarta text-[13px] text-red-500">
          {submitError}
        </div>
      )}

      <button type="submit" disabled={submitting} className="btn-primary disabled:opacity-60">
        {submitting ? "Logging in…" : "Log In"}
      </button>

      <div className="flex w-full items-center justify-center gap-[6px] text-meta">
        <span className="font-jakarta text-jungle/65">Don&apos;t have an account?</span>
        <Link href={signUpUrl} className="font-jakarta font-semibold text-jungle-dark hover:underline">
          Sign up
        </Link>
      </div>
    </form>
  );
}

export default function LoginForm() {
  return (
    <Suspense fallback={<div className="p-4 font-jakarta text-sm">Loading...</div>}>
      <LoginFormContent />
    </Suspense>
  );
}