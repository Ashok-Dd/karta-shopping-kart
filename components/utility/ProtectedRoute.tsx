import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

export async function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (adminOnly && (session.user as { role?: string }).role !== "ADMIN") {
    redirect("/");
  }

  return <>{children}</>;
}
