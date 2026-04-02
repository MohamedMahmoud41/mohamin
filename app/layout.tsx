import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: {
    default: "محامي - نظام إدارة القضايا",
    template: "%s | محامي",
  },
  description:
    "نظام إدارة مكاتب المحاماة والقضايا القانونية - Law office management system",
  keywords: ["محامي", "قضايا", "مكتب محاماة", "نظام قانوني"],
  authors: [{ name: "Lawyer App" }],
  robots: "index, follow",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        {/* Preconnect for Google Fonts performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* Inline script to apply theme before first paint — prevents FOUC */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("theme")||"light";if(t==="system"){t=window.matchMedia("(prefers-color-scheme:dark)").matches?"dark":"light"}document.documentElement.setAttribute("data-theme",t);if(t==="dark")document.documentElement.classList.add("dark");else document.documentElement.classList.remove("dark")}catch(e){}})()`,
          }}
        />
      </head>
      <body
        className="font-sans bg-background text-text-primary antialiased"
        suppressHydrationWarning
      >
        {/* Global toast notifications — mirrors react-hot-toast in old project */}
        <Toaster
          position="top-center"
          reverseOrder={false}
          toastOptions={{
            duration: 4000,
            style: {
              fontFamily: "Cairo, sans-serif",
              direction: "rtl",
            },
          }}
        />
        {children}
      </body>
    </html>
  );
}
