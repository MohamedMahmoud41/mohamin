"use client";

import { useState, useTransition } from "react";
import { Camera, Save } from "lucide-react";
import { updateUserProfile } from "@/app/actions/users";
import type { User } from "@/types";

export default function ProfileForm({ user }: { user: User }) {
  const [form, setForm] = useState({
    firstName: user.firstName ?? "",
    lastName: user.lastName ?? "",
    email: user.email ?? "",
    phone: user.phone ?? "",
    specialization: user.specialization ?? "",
    experience: user.experience ?? "",
    bio: user.bio ?? "",
  });
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setSuccess(false);
    setError(null);
  }

  function handleSubmit() {
    startTransition(async () => {
      const res = await updateUserProfile(form);
      if (res.error) {
        setError(res.error);
        return;
      }
      setSuccess(true);
    });
  }

  const initials = `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`;

  return (
    <div dir="rtl" className="space-y-6 max-w-2xl">
      {/* Avatar */}
      <div className="bg-surface border border-border rounded-xl p-6 flex items-center gap-6">
        <div className="relative">
          {user.profileImageUrl ? (
            <img
              src={user.profileImageUrl}
              alt={initials}
              className="w-20 h-20 rounded-full object-cover"
            />
          ) : (
            <div className="w-20 h-20 bg-gradient-to-b from-accent/70 via-accent/50 to-accent/30 rounded-full flex items-center justify-center text-white font-bold text-2xl">
              {initials}
            </div>
          )}
          <button className="absolute bottom-0 right-0 w-7 h-7 bg-primary rounded-full flex items-center justify-center text-white hover:bg-primary-dark transition">
            <Camera className="w-3.5 h-3.5" />
          </button>
        </div>
        <div>
          <div className="text-text-primary font-bold text-lg">
            {user.firstName} {user.lastName}
          </div>
          <div className="text-text-muted text-sm">{user.email}</div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-surface border border-border rounded-xl p-6 space-y-5">
        {error && (
          <p className="text-error text-sm bg-error/10 p-3 rounded-lg">
            {error}
          </p>
        )}
        {success && (
          <p className="text-success text-sm bg-success/10 p-3 rounded-lg">
            تم حفظ التغييرات بنجاح
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(
            [
              { name: "firstName", label: "الاسم الأول" },
              { name: "lastName", label: "اسم العائلة" },
              { name: "email", label: "البريد الإلكتروني", type: "email" },
              { name: "phone", label: "رقم الهاتف" },
              { name: "specialization", label: "التخصص" },
              { name: "experience", label: "سنوات الخبرة" },
            ] as { name: keyof typeof form; label: string; type?: string }[]
          ).map(({ name, label, type = "text" }) => (
            <div key={name}>
              <label className="text-secondary text-sm font-medium mb-1.5 block">
                {label}
              </label>
              <input
                type={type}
                name={name}
                value={form[name]}
                onChange={handleChange}
                className="w-full border border-border rounded-lg p-3 bg-background outline-none focus:border-primary text-text-primary text-sm"
              />
            </div>
          ))}
        </div>

        <div>
          <label className="text-secondary text-sm font-medium mb-1.5 block">
            نبذة شخصية
          </label>
          <textarea
            name="bio"
            value={form.bio}
            onChange={handleChange}
            rows={4}
            className="w-full border border-border rounded-lg p-3 bg-background outline-none focus:border-primary text-text-primary text-sm resize-none"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={isPending}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition font-semibold disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {isPending ? "جاري الحفظ..." : "حفظ التغييرات"}
        </button>
      </div>
    </div>
  );
}
