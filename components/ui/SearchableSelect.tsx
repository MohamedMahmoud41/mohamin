"use client";

import Select, { type StylesConfig, type GroupBase } from "react-select";
import CreatableSelect from "react-select/creatable";

// ─── Option type ──────────────────────────────────────────────────────────────

export interface SelectOption {
  value: string;
  label: string;
}

// ─── Shared styles (matches the app's design tokens) ─────────────────────────

const baseStyles: StylesConfig<SelectOption, false, GroupBase<SelectOption>> = {
  control: (base, state) => ({
    ...base,
    backgroundColor: "#f8fafc",
    borderWidth: "2px",
    borderColor: state.isFocused ? "#2563eb" : "#e2e8f0",
    borderRadius: "0.5rem",
    padding: "0.35rem 0.25rem",
    boxShadow: state.isFocused ? "0 0 0 1px rgba(37,99,235,0.2)" : "none",
    direction: "rtl",
    textAlign: "right",
    minHeight: "3.25rem",
    "&:hover": {
      borderColor: state.isFocused ? "#2563eb" : "#cbd5e1",
    },
  }),
  menu: (base) => ({
    ...base,
    zIndex: 50,
    borderRadius: "0.5rem",
    border: "1px solid #e2e8f0",
    boxShadow: "0 4px 12px rgba(15,23,42,0.10)",
    direction: "rtl",
    textAlign: "right",
  }),
  menuList: (base) => ({
    ...base,
    maxHeight: "200px",
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? "#2563eb"
      : state.isFocused
        ? "#f1f5f9"
        : "#ffffff",
    color: state.isSelected ? "#ffffff" : "#0f172a",
    cursor: "pointer",
    "&:active": {
      backgroundColor: "#dbeafe",
    },
  }),
  placeholder: (base) => ({
    ...base,
    color: "#94a3b8",
  }),
  singleValue: (base) => ({
    ...base,
    color: "#0f172a",
  }),
  input: (base) => ({
    ...base,
    color: "#0f172a",
  }),
  indicatorSeparator: () => ({
    display: "none",
  }),
  dropdownIndicator: (base, state) => ({
    ...base,
    color: state.isFocused ? "#2563eb" : "#94a3b8",
    "&:hover": { color: "#2563eb" },
  }),
  noOptionsMessage: (base) => ({
    ...base,
    color: "#94a3b8",
  }),
};

// ─── Shared props ─────────────────────────────────────────────────────────────

interface BaseSelectProps {
  name: string;
  label?: string;
  value: string;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  onChange: (value: string) => void;
  onBlur?: () => void;
}

// ─── SearchableSelect (pick from list only) ──────────────────────────────────

export function SearchableSelectField({
  name,
  label,
  value,
  options,
  placeholder = "اختر...",
  error,
  required,
  disabled,
  onChange,
  onBlur,
}: BaseSelectProps) {
  const selected = options.find((o) => o.value === value) ?? null;

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-text-primary font-semibold">
          {label}
          {required && <span className="text-error"> *</span>}
        </label>
      )}
      <Select<SelectOption, false>
        instanceId={name}
        name={name}
        value={selected}
        options={options}
        onChange={(opt) => onChange(opt?.value ?? "")}
        onBlur={onBlur}
        placeholder={placeholder}
        isDisabled={disabled}
        isClearable
        isSearchable
        noOptionsMessage={() => "لا توجد نتائج"}
        styles={baseStyles}
      />
      {error && <p className="text-error text-xs">{error}</p>}
    </div>
  );
}

// ─── CreatableSelectField (pick OR type custom) ──────────────────────────────

export function CreatableSelectField({
  name,
  label,
  value,
  options,
  placeholder = "اختر أو اكتب...",
  error,
  required,
  disabled,
  onChange,
  onBlur,
}: BaseSelectProps) {
  // For creatable: if value is not in options, create a virtual option
  const selected = value
    ? (options.find((o) => o.value === value) ?? { value, label: value })
    : null;

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-text-primary font-semibold">
          {label}
          {required && <span className="text-error"> *</span>}
        </label>
      )}
      <CreatableSelect<SelectOption, false>
        instanceId={name}
        name={name}
        value={selected}
        options={options}
        onChange={(opt) => onChange(opt?.value ?? "")}
        onBlur={onBlur}
        placeholder={placeholder}
        isDisabled={disabled}
        isClearable
        isSearchable
        formatCreateLabel={(input) => `إضافة "${input}"`}
        noOptionsMessage={() => "اكتب لإضافة قيمة جديدة"}
        styles={baseStyles}
      />
      {error && <p className="text-error text-xs">{error}</p>}
    </div>
  );
}

// ─── Multi-select styles override ─────────────────────────────────────────────

const multiStyles: StylesConfig<SelectOption, true, GroupBase<SelectOption>> = {
  ...(baseStyles as unknown as StylesConfig<
    SelectOption,
    true,
    GroupBase<SelectOption>
  >),
  multiValue: (base) => ({
    ...base,
    backgroundColor: "#dbeafe",
    borderRadius: "0.375rem",
    padding: "1px 4px",
  }),
  multiValueLabel: (base) => ({
    ...base,
    color: "#1e40af",
    fontSize: "0.875rem",
  }),
  multiValueRemove: (base) => ({
    ...base,
    color: "#3b82f6",
    cursor: "pointer",
    "&:hover": {
      backgroundColor: "#bfdbfe",
      color: "#1e3a8a",
    },
  }),
};

// ─── MultiSelectField (pick multiple from list) ──────────────────────────────

interface MultiSelectProps {
  name: string;
  label?: string;
  values: string[];
  options: SelectOption[];
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  onChange: (values: string[]) => void;
  onBlur?: () => void;
}

export function MultiSelectField({
  name,
  label,
  values,
  options,
  placeholder = "اختر...",
  error,
  required,
  disabled,
  onChange,
  onBlur,
}: MultiSelectProps) {
  const selected = options.filter((o) => values.includes(o.value));

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-text-primary font-semibold">
          {label}
          {required && <span className="text-error"> *</span>}
        </label>
      )}
      <Select<SelectOption, true>
        instanceId={name}
        name={name}
        value={selected}
        options={options}
        onChange={(opts) => onChange(opts ? opts.map((o) => o.value) : [])}
        onBlur={onBlur}
        placeholder={placeholder}
        isDisabled={disabled}
        isClearable
        isSearchable
        isMulti
        noOptionsMessage={() => "لا توجد نتائج"}
        styles={multiStyles}
      />
      {error && <p className="text-error text-xs">{error}</p>}
    </div>
  );
}
