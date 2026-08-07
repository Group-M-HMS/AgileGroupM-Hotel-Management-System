"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, User } from "lucide-react";

export function ProfileMenu({
  firstName,
  onSignOut,
}: {
  firstName: string;
  onSignOut: () => void;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 text-sm font-medium tracking-wide text-sand-light transition-colors hover:text-sage"
      >
        <User className="h-4 w-4" />
        {firstName}
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-44 overflow-hidden rounded-2xl border border-sand bg-white py-1 shadow-soft-lg">
          <Link
            href="/dashboard"
            onClick={() => setOpen(false)}
            className="block px-4 py-2 font-outfit text-sm text-jungle-dark hover:bg-sand-light"
          >
            My Bookings
          </Link>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onSignOut();
            }}
            className="block w-full px-4 py-2 text-left font-outfit text-sm text-jungle-dark hover:bg-sand-light"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
