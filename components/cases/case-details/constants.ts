export const STATUS_OPTIONS = [
  {
    value: "جارية",
    label: "جارية",
    color: "bg-info/10 text-info border-info/30",
    dot: "bg-info",
  },
  {
    value: "قيد الانتظار",
    label: "قيد الانتظار",
    color: "bg-warning/10 text-warning border-warning/30",
    dot: "bg-warning",
  },
  {
    value: "منتهية لصالح الموكل",
    label: "منتهية لصالح الموكل",
    color: "bg-success/10 text-success border-success/30",
    dot: "bg-success",
  },
  {
    value: "مغلقة",
    label: "مغلقة",
    color: "bg-border text-text-secondary border-border",
    dot: "bg-text-muted",
  },
] as const;

export const DOCUMENT_TYPE_OPTIONS = [
  { value: "اعلان حكم", label: "اعلان حكم" },
  { value: "اعلان بصيغة تنفيذية", label: "اعلان بصيغة تنفيذية" },
  { value: "انذار", label: "انذار" },
  { value: "صحيفة دعوى", label: "صحيفة دعوى" },
  { value: "اعلان وفاء", label: "اعلان وفاء" },
  { value: "محضر تسليم", label: "محضر تسليم" },
];
