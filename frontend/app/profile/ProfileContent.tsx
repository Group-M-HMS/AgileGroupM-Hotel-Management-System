"use client";

// Auth-gated orchestrator for the profile page: shows a loading state, redirects
// unauthenticated visitors to login, and toggles between view and edit modes.
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { ProfileView } from "./ProfileView";
import { ProfileEditForm } from "./ProfileEditForm";

export default function ProfileContent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login?redirect=/profile");
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="rounded-[28px] border border-sand bg-white p-10 text-center font-jakarta text-[14px] text-jungle/60 shadow-soft">
        Loading your profile…
      </div>
    );
  }

  if (!user) return null; // redirecting to login

  if (editing) {
    return (
      <ProfileEditForm
        initial={{
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
        }}
        onCancel={() => setEditing(false)}
        onSaved={() => setEditing(false)}
      />
    );
  }

  return <ProfileView user={user} onEdit={() => setEditing(true)} />;
}
