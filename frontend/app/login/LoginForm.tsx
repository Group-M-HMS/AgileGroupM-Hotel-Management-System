"use client";

import { useState } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

type Fields = {
  email: string;
  password: string;
};

type Errors = Partial<Record<keyof Fields, string>>;

// ── Validation ────────────────────────────────────────────────────────────────

function validate(f: Fields): Errors {
  const e: Errors = {};

  if (!f.email.trim()) e.email = "Email is required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email))
    e.email = "Enter a valid email address";

  if (!f.password) e.password = "Password is required";

  return e;
}

// ── Styles ────────────────────────────────────────────────────────────────────

function fieldCls(hasError?: string) {
  return `input-field ${
    hasError
      ? "border-red-400 focus:border-red-400"
      : "border-sand focus:border-sage"
  }`;
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

// ── Component ─────────────────────────────────────────────────────────────────

export default function LoginForm() {
  const [fields, setFields] = useState<Fields>({ email: "", password: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof Fields, boolean>>>({});
  const [showPassword, setShowPassword] = useState(false);

  function set(field: keyof Fields, value: string) {
    const next = { ...fields, [field]: value };
    setFields(next);
    if (touched[field]) {
      const e = validate(next);
      setErrors(prev => ({ ...prev, [field]: e[field] }));
    }
  }

  function touch(field: keyof Fields) {
    setTouched(prev => ({ ...prev, [field]: true }));
    const e = validate(fields);
    setErrors(prev => ({ ...prev, [field]: e[field] }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const allTouched = Object.fromEntries(
      Object.keys(fields).map(k => [k, true])
    ) as Record<keyof Fields, boolean>;
    setTouched(allTouched);
    const errs = validate(fields);
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      // TODO: call login API
      console.log("Submitting", fields);
    }
  }

  const err = (field: keyof Fields) => (touched[field] ? errors[field] : undefined);

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex w-full flex-col items-start gap-[24px] px-6 sm:px-10 lg:px-0"
    >

      {/* ── Heading ── */}
      <div className="flex w-full flex-col items-start gap-[10px] leading-[normal]">
        <h1 className="font-lora text-heading-sm font-medium tracking-[-0.5px] text-jungle-dark sm:text-heading-md lg:text-heading-lg">
          Log In
        </h1>
        <p className="font-outfit text-field font-normal text-jungle/65 lg:text-[16px]">
          Welcome back. Enter your details to continue.
        </p>
      </div>

      {/* ── Fields ── */}
      <div className="flex w-full flex-col items-start gap-[14px]">

        {/* Email */}
        <div className="flex w-full flex-col gap-[4px]">
          <input
            type="email"
            placeholder="Email*"
            value={fields.email}
            onChange={e => set("email", e.target.value)}
            onBlur={() => touch("email")}
            className={fieldCls(err("email"))}
          />
        </div>

        {/* Password */}
        <div className="flex w-full flex-col gap-[4px]">
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password*"
              value={fields.password}
              onChange={e => set("password", e.target.value)}
              onBlur={() => touch("password")}
              className={`${fieldCls(err("password"))} pr-[44px]`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-[16px] top-1/2 -translate-y-1/2 text-jungle/50 transition-colors hover:text-jungle"
            >
              <EyeIcon open={showPassword} />
            </button>
          </div>
          <div className="flex justify-end">
            <a
              href="/forgot-password"
              className="font-outfit text-meta font-semibold text-jungle-dark hover:underline"
            >
              Forgot password?
            </a>
          </div>
        </div>

      </div>

      {/* ── Log In ── */}
      <button type="submit" className="btn-primary">
        LOG IN
      </button>

      {/* ── Sign up / OR / Social ── */}
      <div className="flex w-full flex-col items-center gap-[14px]">

        <div className="flex items-center gap-[6px] leading-[normal]">
          <span className="font-outfit text-meta font-normal text-jungle/65">
            Don&apos;t have an account?
          </span>
          <a href="/signup" className="font-outfit text-meta font-semibold text-jungle-dark hover:underline">
            Sign up
          </a>
        </div>

        <div className="flex w-full items-center gap-[16px]">
          <div className="h-px flex-1 bg-sand" />
          <span className="font-outfit text-[12px] font-normal leading-[normal] tracking-[2px] text-jungle/55">OR</span>
          <div className="h-px flex-1 bg-sand" />
        </div>

        <div className="flex items-center justify-center gap-[18px]">
          <button type="button" aria-label="Log in with Google" className="btn-social">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icons/google.svg" alt="" aria-hidden="true" className="h-6 w-6" />
          </button>
          <button type="button" aria-label="Log in with Apple" className="btn-social">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icons/apple.svg" alt="" aria-hidden="true" className="h-6 w-6" />
          </button>
        </div>

      </div>
    </form>
  );
}
