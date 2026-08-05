"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Quote = {
  nightlyRate: number;
  nights: number;
  subtotal: number;
  tax: number;
  total: number;
};

type Fields = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialRequests: string;
};

type Errors = Partial<Record<keyof Fields, string>>;

function validate(f: Fields): Errors {
  const e: Errors = {};

  if (!f.firstName.trim()) e.firstName = "First name is required";
  if (!f.lastName.trim()) e.lastName = "Last name is required";

  if (!f.email.trim()) e.email = "Email is required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email))
    e.email = "Enter a valid email address";

  if (!f.phone.trim()) e.phone = "Phone number is required";
  else if (!/^\+?[\d\s\-()]{7,15}$/.test(f.phone))
    e.phone = "Enter a valid phone number";

  if (f.specialRequests.length > 500)
    e.specialRequests = "Special requests cannot exceed 500 characters";

  return e;
}

function fieldCls(hasError?: string) {
  return `input-field ${
    hasError
      ? "border-red-400 focus:border-red-400"
      : "border-sand focus:border-sage"
  }`;
}

export function GuestInfoForm({
  roomId,
  checkIn,
  checkOut,
  guests,
  quote,
}: {
  roomId: string;
  checkIn: string;
  checkOut: string;
  guests: string;
  quote: Quote | null;
}) {
  const router = useRouter();

  const [fields, setFields] = useState<Fields>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    specialRequests: "",
  });

  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] =
    useState<Partial<Record<keyof Fields, boolean>>>({});

  const [isSubmitting, setIsSubmitting] = useState(false);

  function set(field: keyof Fields, value: string) {
    const next = { ...fields, [field]: value };
    setFields(next);

    if (touched[field]) {
      const e = validate(next);
      setErrors((prev) => ({
        ...prev,
        [field]: e[field],
      }));
    }
  }

  function touch(field: keyof Fields) {
    setTouched((prev) => ({
      ...prev,
      [field]: true,
    }));

    const e = validate(fields);

    setErrors((prev) => ({
      ...prev,
      [field]: e[field],
    }));
  }


  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (isSubmitting) return;

    const allTouched = Object.fromEntries(
      Object.keys(fields).map((k) => [k, true])
    ) as Record<keyof Fields, boolean>;

    setTouched(allTouched);

    const errs = validate(fields);

    setErrors(errs);

    if (Object.keys(errs).length > 0) return;


    // Lock button to prevent duplicate booking requests
    setIsSubmitting(true);


    try {

      console.log("Starting fake payment...");

      console.log({
        roomId,
        checkIn,
        checkOut,
        guests,
        quote,
        guest: fields,
      });


      // Fake payment processing
      await new Promise((resolve) =>
        setTimeout(resolve, 2000)
      );


      console.log("Payment successful");


      // Redirect after successful booking
      router.push("/manage-booking");


    } catch (error) {

      console.error("Booking failed", error);
      setIsSubmitting(false);

    }

  }


  const err = (field: keyof Fields) =>
    touched[field] ? errors[field] : undefined;


  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex w-full max-w-2xl flex-col gap-[24px]"
    >

      <div className="flex flex-col gap-[6px]">
        <h2 className="font-lora text-[24px] font-medium text-jungle-dark">
          Guest Information
        </h2>

        <p className="font-outfit text-field text-jungle/60">
          We'll use these details to send your booking confirmation and contact you if needed.
        </p>
      </div>


      <div className="flex flex-col gap-[14px]">

        <div className="flex flex-col gap-[14px] sm:flex-row">

          <input
            type="text"
            placeholder="First Name*"
            value={fields.firstName}
            onChange={(e)=>set("firstName",e.target.value)}
            onBlur={()=>touch("firstName")}
            className={`flex-1 min-w-0 ${fieldCls(err("firstName"))}`}
          />


          <input
            type="text"
            placeholder="Last Name*"
            value={fields.lastName}
            onChange={(e)=>set("lastName",e.target.value)}
            onBlur={()=>touch("lastName")}
            className={`flex-1 min-w-0 ${fieldCls(err("lastName"))}`}
          />

        </div>


        <div className="flex flex-col gap-[14px] sm:flex-row">

          <input
            type="email"
            placeholder="Email Address*"
            value={fields.email}
            onChange={(e)=>set("email",e.target.value)}
            onBlur={()=>touch("email")}
            className={`flex-1 min-w-0 ${fieldCls(err("email"))}`}
          />


          <input
            type="tel"
            placeholder="Phone Number*"
            value={fields.phone}
            onChange={(e)=>set("phone",e.target.value)}
            onBlur={()=>touch("phone")}
            className={`flex-1 min-w-0 ${fieldCls(err("phone"))}`}
          />

        </div>


        <textarea
          placeholder="Special Requests (optional)"
          value={fields.specialRequests}
          onChange={(e)=>set("specialRequests",e.target.value)}
          onBlur={()=>touch("specialRequests")}
          rows={4}
          maxLength={500}
          className={`w-full resize-none rounded-input border-2 bg-white px-field-x py-4 font-outfit text-field text-jungle ${
            err("specialRequests")
              ? "border-red-400"
              : "border-sand"
          }`}
        />


        <span className="self-end font-outfit text-[12px] text-jungle/45">
          {fields.specialRequests.length}/500
        </span>


      </div>


      <button
        type="submit"
        disabled={isSubmitting}
        className="
        btn-primary 
        sm:w-auto 
        sm:self-start 
        sm:px-10
        disabled:opacity-50
        disabled:cursor-not-allowed
        "
      >
        {isSubmitting ? "Processing Payment..." : "Pay & Book"}
      </button>


    </form>
  );
}