"use client";

// Profile edit form (NIBM2-541): first name, last name, phone with validation,
// saving via the user-service (updateProfile). Follows the SignUpForm validation
// pattern (pure validate(), touched-gated errors, live re-validation).
import { useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { FieldError } from "@/components/FieldError";

type Fields = { firstName: string; lastName: string; phone: string };
type Errors = Partial<Record<keyof Fields, string>>;

function validate(f: Fields): Errors {
  const e: Errors = {};

  if (!f.firstName.trim()) e.firstName = "First name is required";
  else if (f.firstName.trim().length < 2) e.firstName = "At least 2 characters";
  else if (!/^[a-zA-Z\s'-]+$/.test(f.firstName.trim())) e.firstName = "Letters only";

  if (!f.lastName.trim()) e.lastName = "Last name is required";
  else if (f.lastName.trim().length < 2) e.lastName = "At least 2 characters";
  else if (!/^[a-zA-Z\s'-]+$/.test(f.lastName.trim())) e.lastName = "Letters only";

  if (!f.phone.trim()) e.phone = "Phone number is required";
  else if (!/^\+?[\d\s\-()+]{7,15}$/.test(f.phone)) e.phone = "Enter a valid phone number";

  return e;
}

function fieldCls(hasError?: string) {
  return `input-field ${hasError ? "border-red-400 focus:border-red-400" : "border-sand focus:border-sage"}`;
}

export function ProfileEditForm({
  initial,
  onCancel,
  onSaved,
}: {
  initial: Fields;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const { updateProfile } = useAuth();
  const [fields, setFields] = useState<Fields>(initial);
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof Fields, boolean>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function set(field: keyof Fields, value: string) {
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
      await updateProfile({
        firstName: fields.firstName.trim(),
        lastName: fields.lastName.trim(),
        phone: fields.phone.trim(),
      });
      onSaved();
    } catch {
      setSubmitError("We couldn't save your changes right now. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const err = (field: keyof Fields) => (touched[field] ? errors[field] : undefined);

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-[28px] border border-sand bg-white p-8 shadow-soft sm:p-10"
    >
      <h2 className="font-fraunces text-[28px] leading-tight text-jungle-dark">
        Edit profile
      </h2>
      <p className="mt-1 font-jakarta text-[14px] text-jungle/60">
        Update your account details below.
      </p>

      <div className="mt-6 flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex flex-1 min-w-0 flex-col gap-1">
            <label className="font-jakarta text-[12px] font-medium uppercase tracking-[1.5px] text-jungle/55">
              First name
            </label>
            <input
              type="text"
              value={fields.firstName}
              onChange={(e) => set("firstName", e.target.value)}
              onBlur={() => touch("firstName")}
              className={fieldCls(err("firstName"))}
            />
            <FieldError message={err("firstName")} />
          </div>
          <div className="flex flex-1 min-w-0 flex-col gap-1">
            <label className="font-jakarta text-[12px] font-medium uppercase tracking-[1.5px] text-jungle/55">
              Last name
            </label>
            <input
              type="text"
              value={fields.lastName}
              onChange={(e) => set("lastName", e.target.value)}
              onBlur={() => touch("lastName")}
              className={fieldCls(err("lastName"))}
            />
            <FieldError message={err("lastName")} />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="font-jakarta text-[12px] font-medium uppercase tracking-[1.5px] text-jungle/55">
            Phone number
          </label>
          <input
            type="tel"
            value={fields.phone}
            onChange={(e) => set("phone", e.target.value)}
            onBlur={() => touch("phone")}
            className={fieldCls(err("phone"))}
          />
          <FieldError message={err("phone")} />
        </div>
      </div>

      {submitError && (
        <div className="mt-5 w-full rounded-input border border-red-400 px-4 py-3 font-jakarta text-[13px] text-red-500">
          {submitError}
        </div>
      )}

      <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="inline-flex items-center justify-center rounded-full border border-sand px-6 py-3 font-jakarta text-[14px] font-semibold text-jungle-dark transition hover:border-sage disabled:opacity-60"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 font-jakarta text-[14px] font-semibold text-sand-light transition hover:opacity-90 disabled:opacity-60"
        >
          {submitting ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
