"use client";
import { usePathname, useRouter } from "next/navigation";

export function SidebarItem({
  icon,
  label,
  path = "/",
}: {
  icon: React.ReactNode;
  label: string;
  path?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const active = pathname.includes(path);
  return (
    <button
      onClick={() => router.push(path)}
      className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm transition ${
        active
          ? "bg-red-500 text-white"
          : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
