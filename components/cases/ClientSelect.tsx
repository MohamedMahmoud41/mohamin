"use client";

import { useState } from "react";
import { UserPlus, Users } from "lucide-react";
import type { Client } from "@/types";
import { SearchableSelectField } from "@/components/ui/SearchableSelect";

type ClientMode = "new" | "existing";

interface ClientSelectProps {
  clients: Client[];
  selectedClientId: string;
  onClientSelect: (client: Client | null) => void;
  onFillFields: (client: Client) => void;
  onModeChange?: (mode: ClientMode) => void;
}

export default function ClientSelect({
  clients,
  selectedClientId,
  onClientSelect,
  onFillFields,
  onModeChange,
}: ClientSelectProps) {
  const [mode, setMode] = useState<ClientMode>(
    selectedClientId ? "existing" : "new",
  );

  const clientOptions = clients.map((c) => ({
    value: c.id,
    label: `${c.name}${c.phone ? ` (${c.phone})` : ""}`,
  }));

  function handleModeChange(newMode: ClientMode) {
    setMode(newMode);
    onModeChange?.(newMode);
    if (newMode === "new") {
      onClientSelect(null);
    }
  }

  function handleSelect(value: string) {
    const client = clients.find((c) => c.id === value) ?? null;
    onClientSelect(client);
    if (client) onFillFields(client);
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Toggle tabs */}
      <div className="flex rounded-lg border-2 border-border overflow-hidden">
        <button
          type="button"
          onClick={() => handleModeChange("new")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-all ${
            mode === "new"
              ? "bg-primary text-white"
              : "bg-surface text-text-secondary hover:bg-beige"
          }`}
        >
          <UserPlus className="w-4 h-4" />
          عميل جديد
        </button>
        <button
          type="button"
          onClick={() => handleModeChange("existing")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-all ${
            mode === "existing"
              ? "bg-primary text-white"
              : "bg-surface text-text-secondary hover:bg-beige"
          }`}
        >
          <Users className="w-4 h-4" />
          عميل حالي
        </button>
      </div>

      {/* Existing client selector */}
      {mode === "existing" && (
        <SearchableSelectField
          name="clientId"
          label="اختر من العملاء المسجلين"
          value={selectedClientId}
          onChange={handleSelect}
          placeholder="ابحث عن عميل بالاسم أو الهاتف..."
          options={clientOptions}
        />
      )}

      {/* New client hint */}
      {mode === "new" && (
        <div className="bg-beige/50 rounded-lg p-3 border border-border">
          <p className="text-text-muted text-sm">
            أدخل بيانات العميل في الحقول أدناه وسيتم حفظه تلقائيا عند إنشاء
            القضية
          </p>
        </div>
      )}
    </div>
  );
}
