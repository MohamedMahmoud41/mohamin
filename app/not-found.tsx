import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6 text-center px-4">
      <p className="text-8xl font-bold text-primary">404</p>
      <h1 className="text-2xl font-bold text-text-primary">
        الصفحة غير موجودة
      </h1>
      <p className="text-text-muted">
        الصفحة التي تبحث عنها غير موجودة أو تم نقلها.
      </p>
      <Link href="/" className="btn-primary">
        العودة للرئيسية
      </Link>
    </div>
  );
}
