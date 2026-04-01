"use client";

import { useState } from "react";
import {
  Users,
  Search,
  Phone,
  Mail,
  MapPin,
  Hash,
  Building2,
  User as UserIcon,
} from "lucide-react";
import type { Client } from "@/types";

interface ClientsPanelProps {
  clients: Client[];
}

const typeLabels: Record<string, string> = {
  individual: "فرد",
  company: "شركة",
};

export default function ClientsPanel({ clients }: ClientsPanelProps) {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  const filtered = clients.filter((c) => {
    const matchesSearch =
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.nationalId.includes(search);
    const matchesType = filterType === "all" || c.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div dir="rtl" className="w-full bg-background min-h-screen p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Users className="w-7 h-7 text-primary" />
          <div>
            <h1 className="text-text-primary text-2xl font-bold">العملاء</h1>
            <p className="text-text-muted text-sm">
              {filtered.length} عميل مسجل
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-surface rounded-lg border border-border p-4 mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث بالاسم أو الهاتف أو الرقم القومي..."
            className="w-full pr-10 p-3 bg-background border-2 border-border rounded-lg text-text-primary focus:outline-none focus:border-primary placeholder:text-text-muted"
          />
        </div>
        <div className="flex gap-2">
          {[
            { value: "all", label: "الكل" },
            { value: "individual", label: "أفراد" },
            { value: "company", label: "شركات" },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilterType(opt.value)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                filterType === opt.value
                  ? "bg-primary text-white"
                  : "bg-background text-text-secondary border border-border hover:bg-beige"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Clients Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-text-muted">
          <Users className="w-12 h-12 mx-auto mb-4 opacity-40" />
          <p className="text-lg">لا يوجد عملاء</p>
          <p className="text-sm mt-1">
            ستظهر بيانات العملاء هنا عند إضافتهم من صفحة القضايا
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((client) => (
            <div
              key={client.id}
              className="bg-surface rounded-lg border border-border p-5 hover:shadow-md transition"
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  {client.type === "company" ? (
                    <Building2 className="w-5 h-5 text-primary" />
                  ) : (
                    <UserIcon className="w-5 h-5 text-primary" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-text-primary font-bold truncate">
                    {client.name}
                  </h3>
                  <span className="text-xs text-text-muted bg-beige px-2 py-0.5 rounded-full">
                    {typeLabels[client.type] || client.type}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2 text-sm">
                {client.phone && (
                  <div className="flex items-center gap-2 text-text-secondary">
                    <Phone className="w-4 h-4 text-text-muted flex-shrink-0" />
                    <span dir="ltr">{client.phone}</span>
                  </div>
                )}
                {client.email && (
                  <div className="flex items-center gap-2 text-text-secondary">
                    <Mail className="w-4 h-4 text-text-muted flex-shrink-0" />
                    <span className="truncate">{client.email}</span>
                  </div>
                )}
                {client.nationalId && (
                  <div className="flex items-center gap-2 text-text-secondary">
                    <Hash className="w-4 h-4 text-text-muted flex-shrink-0" />
                    <span dir="ltr">{client.nationalId}</span>
                  </div>
                )}
                {client.address && (
                  <div className="flex items-center gap-2 text-text-secondary">
                    <MapPin className="w-4 h-4 text-text-muted flex-shrink-0" />
                    <span className="truncate">{client.address}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-border">
                <p className="text-xs text-text-muted">
                  أضيف في{" "}
                  {new Date(client.createdAt).toLocaleDateString("ar-EG")}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
