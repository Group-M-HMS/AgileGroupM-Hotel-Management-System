// Profile details view (NIBM2-540): avatar initials badge, full name, and
// account details (first name, last name, email, phone) with an Edit action.
import { Pencil } from "lucide-react";
import type { AuthUser } from "@/lib/AuthContext";

function initialsOf(user: AuthUser): string {
  const first = user.firstName?.[0] ?? "";
  const last = user.lastName?.[0] ?? "";
  return (first + last).toUpperCase() || "?";
}

const rowCls = "flex flex-col gap-1";
const labelCls =
  "font-jakarta text-[12px] font-medium uppercase tracking-[1.5px] text-jungle/55";
const valueCls = "font-jakarta text-[15px] text-jungle-dark";

export function ProfileView({
  user,
  onEdit,
}: {
  user: AuthUser;
  onEdit: () => void;
}) {
  const fullName = `${user.firstName} ${user.lastName}`.trim();

  return (
    <div className="rounded-[28px] border border-sand bg-white p-8 shadow-soft sm:p-10">
      {/* Header: avatar + name + edit */}
      <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
        <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-sage/20 font-fraunces text-[28px] text-jungle-dark">
          {initialsOf(user)}
        </span>
        <div className="sm:mr-auto">
          <h2 className="font-fraunces text-[28px] leading-tight text-jungle-dark">
            {fullName || "Your profile"}
          </h2>
          <p className="mt-1 font-jakarta text-[14px] text-jungle/60">
            River Nest member
          </p>
        </div>
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center gap-2 rounded-full border border-sand px-5 py-2.5 font-jakarta text-[14px] font-semibold text-jungle-dark transition hover:border-sage focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2"
        >
          <Pencil size={16} className="text-sage" />
          Edit Profile
        </button>
      </div>

      {/* Details */}
      <dl className="mt-8 grid gap-6 border-t border-sand pt-8 sm:grid-cols-2">
        <div className={rowCls}>
          <dt className={labelCls}>First name</dt>
          <dd className={valueCls}>{user.firstName || "—"}</dd>
        </div>
        <div className={rowCls}>
          <dt className={labelCls}>Last name</dt>
          <dd className={valueCls}>{user.lastName || "—"}</dd>
        </div>
        <div className={rowCls}>
          <dt className={labelCls}>Email</dt>
          <dd className={valueCls}>{user.email || "—"}</dd>
        </div>
        <div className={rowCls}>
          <dt className={labelCls}>Phone</dt>
          <dd className={valueCls}>{user.phone || "—"}</dd>
        </div>
      </dl>
    </div>
  );
}
