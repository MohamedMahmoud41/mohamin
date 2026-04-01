export function formatDate(date: string | null | undefined) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("ar-EG");
}

export function formatDateTime(date: string | null | undefined) {
  if (!date) return "—";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });
}

export function getStatusClass(status: string) {
  const s = status?.toLowerCase();
  if (
    ["جارية", "نشطه", "نشطة", "active", "runing", "running", "جاري"].includes(s)
  )
    return "bg-info/10 text-info";
  if (["قيد الانتظار", "pending", "انتظار", "قيد الإنتظار"].includes(s))
    return "bg-warning/10 text-warning";
  if (
    [
      "مكسوبة",
      "مكسوبه",
      "completed",
      "won",
      "مكتملة",
      "منتهية لصالح الموكل",
    ].includes(s)
  )
    return "bg-success/10 text-success";
  return "bg-border text-text-secondary";
}
