import { ProtectedRoute } from "@/components/utility/ProtectedRoute";
import { AdminSidebar } from "@/components/features/admin/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute adminOnly>
      <div className="min-h-screen pt-16 flex">
        <AdminSidebar />
        <main className="flex-1 min-w-0 p-6 lg:p-8">{children}</main>
      </div>
    </ProtectedRoute>
  );
}
