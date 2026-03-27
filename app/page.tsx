import Link from "next/link";
import { Scale, FolderOpen, CalendarCheck, Users, FileText, BarChart3, Bell } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background text-text-primary" dir="rtl">

      {/* ── Nav ─────────────────────────────────────────────────────── */}
      <nav className="bg-surface border-b border-border sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-primary font-bold text-xl font-cairo">
            <Scale size={26} strokeWidth={1.8} />
            <span>محامي</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-text-secondary hover:text-primary transition-colors px-4 py-2"
            >
              تسجيل الدخول
            </Link>
            <Link href="/signup" className="btn-primary text-sm">
              ابدأ مجاناً
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-b from-primary/5 to-background pt-20 pb-24 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
            نظام إدارة مكاتب المحاماة
          </div>

          <h1 className="text-5xl font-extrabold font-cairo text-text-primary leading-tight mb-5">
            أدِر مكتبك القانوني
            <br />
            <span className="text-primary">بكفاءة واحترافية</span>
          </h1>

          <p className="text-lg text-text-secondary leading-relaxed max-w-xl mx-auto mb-10">
            منصة متكاملة لإدارة القضايا والجلسات والموكلين والمهام اليومية لمكتبك
            القانوني — كل ما تحتاجه في مكان واحد.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup" className="btn-primary text-base px-8 py-3">
              أنشئ حسابك مجاناً
            </Link>
            <Link href="/login" className="btn-outline text-base px-8 py-3">
              تسجيل الدخول
            </Link>
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────── */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold font-cairo text-text-primary mb-3">
            كل ما يحتاجه مكتبك
          </h2>
          <p className="text-text-secondary">
            أدوات مصممة خصيصاً لفرق المحاماة العربية
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: FolderOpen,
              title: "إدارة القضايا",
              desc: "تتبع كل قضية بالتفاصيل الكاملة — الموكل، الخصم، المحكمة، والحالة لحظة بلحظة.",
            },
            {
              icon: CalendarCheck,
              title: "جلسات وتواريخ",
              desc: "جدولة الجلسات القادمة مع تنبيهات تلقائية لضمان عدم تفويت أي موعد.",
            },
            {
              icon: Users,
              title: "فريق المكتب",
              desc: "أضف المحامين وصلاحياتهم، وتابع أداء كل عضو في الفريق.",
            },
            {
              icon: FileText,
              title: "وثائق ومرفقات",
              desc: "رفع وتنظيم جميع ملفات القضية في مكان آمن وسهل الوصول.",
            },
            {
              icon: BarChart3,
              title: "تقارير تفصيلية",
              desc: "احصائيات وتقارير فورية عن وضع القضايا وإنتاجية المكتب.",
            },
            {
              icon: Bell,
              title: "تنبيهات فورية",
              desc: "إشعارات لحظية عند إضافة جلسة أو تحديث قضية أو تكليف مهمة.",
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="card hover:shadow-md transition-shadow group"
            >
              <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Icon size={22} className="text-primary" />
              </div>
              <h3 className="font-bold text-text-primary mb-2 font-cairo">
                {title}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────────────────── */}
      <section className="bg-primary mx-6 mb-16 rounded-2xl px-8 py-14 text-center max-w-5xl lg:mx-auto">
        <h2 className="text-3xl font-bold font-cairo text-white mb-3">
          ابدأ إدارة مكتبك اليوم
        </h2>
        <p className="text-blue-100 mb-8 max-w-md mx-auto">
          سجّل حسابك خلال دقيقة واحدة وابدأ بتنظيم قضاياك فوراً.
        </p>
        <Link
          href="/signup"
          className="inline-block bg-white text-primary font-bold px-8 py-3 rounded-lg hover:bg-blue-50 transition-colors"
        >
          إنشاء حساب مجاني
        </Link>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer className="border-t border-border py-8 px-6 text-center text-sm text-text-muted">
        <div className="flex items-center justify-center gap-2 mb-2 text-text-secondary font-semibold">
          <Scale size={16} />
          <span>محامي</span>
        </div>
        <p>نظام إدارة مكاتب المحاماة والقضايا القانونية</p>
      </footer>

    </main>
  );
}
