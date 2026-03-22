// SERVER COMPONENT — no interactivity, no hooks, no browser APIs
import Image from "next/image";

interface LoaderProps {
  /** Tailwind size classes, e.g. "w-16 h-16". Defaults to "w-24 h-24". */
  size?: string;
  /** When true, fills the full viewport height (for page-level loading). */
  fullPage?: boolean;
}

export default function Loader({
  size = "w-24 h-24",
  fullPage = false,
}: LoaderProps) {
  return (
    <div
      className={`flex justify-center items-center w-full ${
        fullPage ? "min-h-screen" : "min-h-[200px]"
      }`}
    >
      <Image
        src="/Icon.svg"
        alt="جارٍ التحميل..."
        width={96}
        height={96}
        className={`${size} animate-bounce-custom`}
        priority
      />
    </div>
  );
}
