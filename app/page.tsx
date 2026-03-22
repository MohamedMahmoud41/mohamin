import Link from "next/link";
import { Scale } from "lucide-react";

/**
 * Home page – public landing route (/)
 *
 * Migration note: The old React project has a full LandingPage component at
 * src/pages/Landing/LandingPage.jsx. Migrate it section by section from:
 *   ../src/components/Landing/HeroSection.jsx
 *   ../src/components/Landing/FeaturesSection.jsx
 *   ...etc.
 */
export default function HomePage() {
  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center gap-8 px-4 text-center">
      {/* Brand Icon */}
      <div className="text-primary">
        <Scale size={72} strokeWidth={1.5} />
      </div>

      {/* Heading */}
      <div className="space-y-3">
        <h1 className="text-4xl font-bold text-text-primary font-cairo">
          محامي
        </h1>
        <p className="text-lg text-text-muted max-w-md mx-auto leading-relaxed">
          نظام إدارة مكاتب المحاماة والقضايا القانونية
        </p>
        <p className="text-sm text-text-muted/70">
          Law Office &amp; Case Management System
        </p>
      </div>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mt-2">
        <Link href="/login" className="btn-primary">
          تسجيل الدخول
        </Link>
        <Link href="/signup" className="btn-outline">
          إنشاء حساب
        </Link>
      </div>

      {/* Migration status badge */}
      <div className="mt-8 border border-border rounded-lg p-4 bg-surface text-right max-w-sm w-full">
        <p className="text-xs font-semibold text-text-muted mb-2">
          حالة الترحيل — Migration Status
        </p>
        <ul className="space-y-1 text-xs text-text-muted">
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-success inline-block" />
            Next.js App Router — جاهز
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-success inline-block" />
            Tailwind CSS — جاهز
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-success inline-block" />
            TypeScript — جاهز
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-warning inline-block" />
            Supabase — إعداد البيئة جاهز — ينتظر الربط
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-border inline-block" />
            الصفحات — لم تُرحَّل بعد
          </li>
        </ul>
      </div>
    </main>
  );
}
