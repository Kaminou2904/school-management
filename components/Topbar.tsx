"use client";
import { useSession, signOut } from "next-auth/react";

export default function Topbar({ title }: { title: string }) {
  const { data: session } = useSession();

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <h1 className="text-navy font-bold text-xl">{title}</h1>
      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-semibold text-gray-800">{session?.user?.name}</p>
          <p className="text-xs text-gray-400">{session?.user?.branchName}</p>
        </div>
        <div className="w-9 h-9 rounded-full bg-navy text-white flex items-center justify-center font-bold text-sm uppercase">
          {session?.user?.name?.[0] ?? "?"}
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="text-sm text-gray-500 hover:text-red-600 transition-colors font-medium cursor-pointer"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
