"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  FileText,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { updateUserOffice } from "@/app/actions/office";
import type { Office } from "@/types";

const inputClass =
  "w-full border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary placeholder:text-text-muted bg-background text-text-primary";

export default function EditOfficeForm({ office }: { office: Office }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: office.name ?? "",
    address: office.address ?? "",
    email: office.email ?? "",
    phone: office.phone ?? "",
    description: office.description ?? "",
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("اسم المكتب مطلوب");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await updateUserOffice(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.push("/office");
      router.refresh();
    });
  }

  return (
    <div dir="rtl" className="min-h-screen bg-background p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => router.push("/office")}
          className="p-2 hover:bg-surface rounded-lg text-text-muted transition"
        >
          <ArrowRight className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            تعديل معلومات المكتب
          </h1>
          <p className="text-text-muted text-sm mt-0.5">
            قم بتحديث بيانات مكتبك
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name */}
        <div>
          <label className="text-sm font-semibold text-text-primary mb-1.5 block">
            اسم المكتب *
          </label>
          <div className="flex items-center gap-3 border border-border focus-within:border-primary rounded-lg px-4 py-3 bg-background transition-colors">
            <Building2 className="text-text-muted w-5 h-5 flex-shrink-0" />
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="أدخل اسم المكتب"
              className="w-full outline-none bg-transparent text-text-primary text-sm"
              required
            />
          </div>
        </div>

        {/* Address */}
        <div>
          <label className="text-sm font-semibold text-text-primary mb-1.5 block">
            العنوان
          </label>
          <div className="flex items-center gap-3 border border-border focus-within:border-primary rounded-lg px-4 py-3 bg-background transition-colors">
            <MapPin className="text-text-muted w-5 h-5 flex-shrink-0" />
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="عنوان المكتب"
              className="w-full outline-none bg-transparent text-text-primary text-sm"
            />
          </div>
        </div>

        {/* Phone */}
        <div>
          <label className="text-sm font-semibold text-text-primary mb-1.5 block">
            رقم الهاتف
          </label>
          <div className="flex items-center gap-3 border border-border focus-within:border-primary rounded-lg px-4 py-3 bg-background transition-colors">
            <Phone className="text-text-muted w-5 h-5 flex-shrink-0" />
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="رقم هاتف المكتب"
              className="w-full outline-none bg-transparent text-text-primary text-sm"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="text-sm font-semibold text-text-primary mb-1.5 block">
            البريد الإلكتروني
          </label>
          <div className="flex items-center gap-3 border border-border focus-within:border-primary rounded-lg px-4 py-3 bg-background transition-colors">
            <Mail className="text-text-muted w-5 h-5 flex-shrink-0" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="بريد المكتب الإلكتروني"
              className="w-full outline-none bg-transparent text-text-primary text-sm"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="text-sm font-semibold text-text-primary mb-1.5 block">
            وصف المكتب
          </label>
          <div className="flex gap-3 border border-border focus-within:border-primary rounded-lg px-4 py-3 bg-background transition-colors">
            <FileText className="text-text-muted w-5 h-5 flex-shrink-0 mt-0.5" />
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="وصف مختصر عن المكتب وتخصصاته"
              rows={4}
              className="w-full outline-none bg-transparent text-text-primary text-sm resize-none"
            />
          </div>
        </div>

        {error && (
          <div className="bg-error/10 border border-error/30 text-error rounded-lg px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.push("/office")}
            className="flex-1 py-3 rounded-xl border border-border text-text-secondary hover:bg-surface transition font-medium"
          >
            إلغاء
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="flex-1 py-3 rounded-xl bg-primary text-white hover:bg-primary-dark transition font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                جاري الحفظ...
              </>
            ) : (
              "حفظ التغييرات"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
