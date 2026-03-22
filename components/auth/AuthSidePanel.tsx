// SERVER COMPONENT — pure SVG/text, no interactivity
import { Scale } from "lucide-react";

export default function AuthSidePanel() {
  return (
    <div className="hidden md:flex items-center justify-center w-1/2 bg-gradient-to-b from-primary via-secondary to-accent p-8">
      <div className="max-w-xs text-center text-surface">
        <div className="mb-6 flex items-center justify-center">
          <Scale className="h-24 w-24" />
        </div>

        <h2 className="text-3xl font-extrabold mb-3">
          نظام إدارة المكاتب القانونية
        </h2>

        <p className="text-base mb-6 text-surface/90">
          حلول متكاملة لإدارة القضايا والمحامين بكفاءة واحترافية
        </p>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="bg-surface/10 rounded-md p-6">
            <div className="text-3xl font-bold">100+</div>
            <div className="text-sm mt-1">عملاء</div>
          </div>
          <div className="bg-surface/10 rounded-md p-6">
            <div className="text-3xl font-bold">500+</div>
            <div className="text-sm mt-1">قضايا</div>
          </div>
        </div>
      </div>
    </div>
  );
}
