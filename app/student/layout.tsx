import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "student") redirect("/login");

  return (
    <div className="flex min-h-screen">
      <Sidebar role="student" />
      <div className="flex-1 flex flex-col">
        <Topbar title="Student Portal" />
        <main className="flex-1 p-6 bg-gray-50">{children}</main>
      </div>
    </div>
  );
}
