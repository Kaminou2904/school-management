import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/login");

  const role = session.user.role;
  if (role === "admin") redirect("/admin/dashboard");
  if (role === "teacher") redirect("/teacher/dashboard");
  if (role === "student") redirect("/student/dashboard");

  redirect("/login");
}
