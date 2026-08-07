"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { PasswordRequirements } from "./PasswordRequirements";
import { FieldError } from "@/components/FieldError";
import { useAuth } from "@/lib/AuthContext";
import { auth } from "@/lib/firebase";
import { mapFirebaseAuthError } from "@/lib/firebaseErrors";
import { syncProfile } from "@/lib/apiClient";

// ── Types ─────────────────────────────────────────────────────────────────────

type Fields = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  terms: boolean;
};

type Errors = Partial<Record<keyof Fields, string>>;

// ── Validation ────────────────────────────────────────────────────────────────

function validate(f: Fields): Errors {
  const e: Errors = {};

  if (!f.firstName.trim()) e.firstName = "First name is required";
  else if (f.firstName.trim().length < 2) e.firstName = "At least 2 characters";
  else if (!/^[a-zA-Z\s'-]+$/.test(f.firstName.trim())) e.firstName = "Letters only";

  if (!f.lastName.trim()) e.lastName = "Last name is required";
  else if (f.lastName.trim().length < 2) e.lastName = "At least 2 characters";
  else if (!/^[a-zA-Z\s'-]+$/.test(f.lastName.trim())) e.lastName = "Letters only";

  if (!f.email.trim()) e.email = "Email is required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = "Enter a valid email address";

  if (!f.phoneNumber.trim()) e.phoneNumber = "Phone number is required";
  else if (!/^\+?[\d\s\-()+]{7,15}$/.test(f.phoneNumber)) e.phoneNumber = "Enter a valid phone number";

  if (!f.password) e.password = "Password is required";
  else if (f.password.length < 8) e.password = "At least 8 characters required";
  else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(f.password))
    e.password = "Must include uppercase, lowercase, and a number";

  if (!f.confirmPassword) e.confirmPassword = "Please confirm your password";
  else if (f.confirmPassword !== f.password) e.confirmPassword = "Passwords do not match";

  if (!f.terms) e.terms = "You must agree to the Terms & Conditions";

  return e;
}

// ── Styles ────────────────────────────────────────────────────────────────────

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

function SignUpFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  // Extract return URL if available, default to dashboard
  const redirectUrl = searchParams.get("redirect") || "/dashboard";

  // Preserve redirect query parameter when switching to Login
  const loginUrl = searchParams.get("redirect")
    ? `/login?redirect=${encodeURIComponent(searchParams.get("redirect")!)}`
    : "/login";

  const [fields, setFields] = useState<Fields>({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    terms: false,
  });

  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof Fields, boolean>>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
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
      await createUserWithEmailAndPassword(auth, fields.email, fields.password);
      await syncProfile({
        firstName: fields.firstName,
        lastName: fields.lastName,
        phone: fields.phoneNumber,
      });

      // Redirect directly back to checkout or dashboard
      router.push(redirectUrl);
    } catch (error: unknown) {
      setSubmitError(
        mapFirebaseAuthError(
          error,
          "We couldn't create your account right now. Please try again."
        )
      );
    } finally {
      setSubmitting(false);
    }
  }

  const err = (field: keyof Fields) =>
    touched[field] ? errors[field] : undefined;

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex w-full flex-col items-start gap-[24px] px-6 sm:px-10 lg:px-0"
    >
      {/* ── Heading ── */}
      <div className="flex w-full flex-col items-start gap-[10px] leading-[normal]">
        <h1 className="font-lora text-heading-sm font-medium tracking-[-0.5px] text-jungle-dark sm:text-heading-md lg:text-heading-lg">
          Sign Up
        </h1>
        <p className="font-outfit text-field font-normal text-jungle/65 lg:text-[16px]">
          Create an account to start booking your perfect stay.
        </p>
      </div>

      {/* ── Fields ── */}
      <div className="flex w-full flex-col items-start gap-[14px]">
        {/* First + Last Name */}
        <div className="flex w-full flex-col gap-[14px] sm:flex-row">
          <div className="flex flex-1 min-w-0 flex-col gap-[4px]">
            <input
              type="text"
              placeholder="First Name*"
              value={fields.firstName}
              onChange={(e) => set("firstName", e.target.value)}
              onBlur={() => touch("firstName")}
              className={fieldCls(err("firstName"))}
            />
            <FieldError message={err("firstName")} />
          </div>
          <div className="flex flex-1 min-w-0 flex-col gap-[4px]">
            <input
              type="text"
              placeholder="Last Name*"
              value={fields.lastName}
              onChange={(e) => set("lastName", e.target.value)}
              onBlur={() => touch("lastName")}
              className={fieldCls(err("lastName"))}
            />
            <FieldError message={err("lastName")} />
          </div>
        </div>

        {/* Email + Phone */}
        <div className="flex w-full flex-col gap-[14px] sm:flex-row">
          <div className="flex flex-1 min-w-0 flex-col gap-[4px]">
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
          <div className="flex flex-1 min-w-0 flex-col gap-[4px]">
            <input
              type="tel"
              placeholder="Phone Number*"
              value={fields.phoneNumber}
              onChange={(e) => set("phoneNumber", e.target.value)}
              onBlur={() => touch("phoneNumber")}
              className={fieldCls(err("phoneNumber"))}
            />
            <FieldError message={err("phoneNumber")} />
          </div>
        </div>

        {/* Password + Confirm */}
        <div className="flex w-full flex-col gap-[14px] sm:flex-row">
          <div className="flex flex-1 min-w-0 flex-col gap-[4px]">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password*"
                value={fields.password}
                onChange={(e) => set("password", e.target.value)}
                onFocus={() => setPasswordFocused(true)}
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
            {(passwordFocused || fields.password.length > 0) && (
              <PasswordRequirements password={fields.password} />
            )}
          </div>
          <div className="flex flex-1 min-w-0 flex-col gap-[4px]">
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm Password*"
                value={fields.confirmPassword}
                onChange={(e) => set("confirmPassword", e.target.value)}
                onBlur={() => touch("confirmPassword")}
                className={`${fieldCls(err("confirmPassword"))} pr-[44px]`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                aria-label={showConfirm ? "Hide password" : "Show password"}
                className="absolute right-[16px] top-1/2 -translate-y-1/2 text-jungle/50 transition-colors hover:text-jungle"
              >
                <EyeIcon open={showConfirm} />
              </button>
            </div>
            <FieldError message={err("confirmPassword")} />
          </div>
        </div>
      </div>

      {/* ── Terms ── */}
      <div className="flex flex-col gap-[6px]">
        <div className="flex items-center gap-[10px]">
          <input
            id="terms"
            type="checkbox"
            checked={fields.terms}
            onChange={(e) => set("terms", e.target.checked)}
            onBlur={() => touch("terms")}
            className={`form-checkbox ${
              err("terms") ? "border-red-400" : "border-sage"
            }`}
          />
          <label
            htmlFor="terms"
            className="flex cursor-pointer flex-wrap items-center gap-[4px] leading-[normal]"
          >
            <span className="font-outfit text-meta font-normal text-jungle/85">
              I agree to the
            </span>
            <span className="font-outfit text-meta font-semibold text-jungle">
              Terms &amp; Conditions
            </span>
          </label>
        </div>
        <FieldError message={err("terms")} />
      </div>

      {/* ── Submit error ── */}
      {submitError && (
        <div className="w-full rounded-input border border-red-400 px-4 py-3 font-outfit text-[13px] text-red-500">
          {submitError}
        </div>
      )}

      {/* ── Create Account ── */}
      <button
        type="submit"
        disabled={submitting}
        className="btn-primary disabled:opacity-60"
      >
        {submitting ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}
      </button>

      {/* ── Login / OR / Social ── */}
      <div className="flex w-full flex-col items-center gap-[14px]">
        <div className="flex items-center gap-[6px] leading-[normal]">
          <span className="font-outfit text-meta font-normal text-jungle/65">
            Already have an account?
          </span>
          <Link
            href={loginUrl}
            className="font-outfit text-meta font-semibold text-jungle-dark hover:underline"
          >
            Log in
          </Link>
        </div>

        <div className="flex w-full items-center gap-[16px]">
          <div className="h-px flex-1 bg-sand" />
          <span className="font-outfit text-[12px] font-normal leading-[normal] tracking-[2px] text-jungle/55">
            OR
          </span>
          <div className="h-px flex-1 bg-sand" />
        </div>

        <div className="flex items-center justify-center gap-[18px]">
          <button
            type="button"
            aria-label="Sign up with Google"
            className="btn-social"
          >
            <img
              src="/icons/google.svg"
              alt=""
              aria-hidden="true"
              className="h-6 w-6"
            />
          </button>
          <button
            type="button"
            aria-label="Sign up with Apple"
            className="btn-social"
          >
            <img
              src="/icons/apple.svg"
              alt=""
              aria-hidden="true"
              className="h-6 w-6"
            />
          </button>
        </div>
      </div>
    </form>
  );
}

export default function SignUpForm() {
  return (
    <Suspense fallback={<div className="text-sm font-outfit p-4">Loading...</div>}>
      <SignUpFormContent />
    </Suspense>
  );
}