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

// ── Inner Form Component ──────────────────────────────────────────────────────

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  // 1. Extract return target or fallback to dashboard
  const redirectUrl = searchParams.get("redirect") || "/dashboard";

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

  useEffect(() => {
    if (user) {
      router.replace(redirectUrl);
    }
  }, [user, router, redirectUrl]);

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

      // 3. Redirect user back to checkout with saved parameters
      router.push(redirectUrl);
    } catch (error: unknown) {
      setSubmitError(mapFirebaseAuthError(error, "Failed to log in. Please try again."));
    } finally {
      setSubmitting(false);
    }
  }

  const err = (field: keyof Fields) => (touched[field] ? errors[field] : undefined);

  return (
    <form onSubmit={handleSubmit} noValidate className="flex w-full flex-col items-start gap-[24px]">
      <div className="flex w-full flex-col items-start gap-[10px]">
        <h1 className="font-lora text-heading-md font-medium text-jungle-dark">Welcome Back</h1>
        <p className="font-outfit text-field text-jungle/65">Log in to manage your reservation.</p>
      </div>

      <div className="flex w-full flex-col gap-[14px]">
        <div className="flex flex-col gap-[4px]">
          <input
            type="email"
            placeholder="Email*"
            value={fields.email}
            onChange={(e) => set("email", e.target.value)}
            onBlur={() => touch("email")}
            className={`input-field ${err("email") ? "border-red-400" : "border-sand"}`}
          />
          <FieldError message={err("email")} />
        </div>

        <div className="flex flex-col gap-[4px]">
          <input
            type="password"
            placeholder="Password*"
            value={fields.password}
            onChange={(e) => set("password", e.target.value)}
            onBlur={() => touch("password")}
            className={`input-field ${err("password") ? "border-red-400" : "border-sand"}`}
          />
          <FieldError message={err("password")} />
        </div>
      </div>

      {submitError && (
        <div className="w-full rounded-input border border-red-400 px-4 py-3 font-outfit text-[13px] text-red-500">
          {submitError}
        </div>
      )}

      <button type="submit" disabled={submitting} className="btn-primary disabled:opacity-60">
        {submitting ? "LOGGING IN..." : "LOG IN"}
      </button>

      <div className="flex w-full items-center justify-center gap-[6px] text-meta">
        <span className="font-outfit text-jungle/65">Don&apos;t have an account?</span>
        <Link href={signUpUrl} className="font-outfit font-semibold text-jungle-dark hover:underline">
          Sign up
        </Link>
      </div>
    </form>
  );
}

export default function LoginForm() {
  return (
    <Suspense fallback={<div className="p-4 font-outfit text-sm">Loading...</div>}>
      <LoginFormContent />
    </Suspense>
  );
}