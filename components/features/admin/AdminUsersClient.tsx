"use client";

import { useState } from "react";
import Image from "next/image";
import { Search, User, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { toast } from "@/components/ui/Toaster";

interface AdminUser {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: "USER" | "ADMIN";
  createdAt: string;
  _count: { orders: number };
}

export function AdminUsersClient({ initialUsers }: { initialUsers: AdminUser[] }) {
  const [users,     setUsers]     = useState(initialUsers);
  const [search,    setSearch]    = useState("");
  const [updatingId,setUpdatingId]= useState<string | null>(null);

  const filtered = users.filter(
    (u) =>
      (u.name  || "").toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  async function updateRole(userId: string, role: "USER" | "ADMIN") {
    setUpdatingId(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ role }),
      });
      if (res.ok) {
        setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role } : u)));
        toast.success("Role updated");
      } else {
        toast.error("Failed to update role");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <>
      {/* Toolbar */}
      <div className="mb-6">
        <Input
          placeholder="Search by name or email…"
          leftIcon={<Search size={15} />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Users",   value: users.length },
          { label: "Admins",        value: users.filter((u) => u.role === "ADMIN").length },
          { label: "OAuth Users",   value: users.filter((u) => !u.image?.includes("picsum")).length },
        ].map(({ label, value }) => (
          <div key={label} className="surface rounded-xl p-4">
            <p className="text-xl font-semibold font-display" style={{ color: "var(--color-text)" }}>{value}</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="surface rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-(--color-border)" style={{ background: "var(--color-surface-2)" }}>
                {["User", "Email", "Orders", "Role", "Joined"].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold uppercase tracking-wider px-4 py-3"
                    style={{ color: "var(--color-text-subtle)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-(--color-border) last:border-0 transition-colors"
                  style={{ cursor: "default" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-surface-2)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "")}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center shrink-0"
                        style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)" }}
                      >
                        
                          <User size={16} style={{ color: "var(--color-text-subtle)" }} />
                    
                      </div>
                      <span className="font-medium" style={{ color: "var(--color-text)" }}>
                        {user.name || "—"}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3" style={{ color: "var(--color-text-muted)" }}>{user.email}</td>
                  <td className="px-4 py-3" style={{ color: "var(--color-text-muted)" }}>{user._count.orders}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Badge variant={user.role === "ADMIN" ? "accent" : "default"}>{user.role}</Badge>
                      <div className="relative">
                        <select
                          value={user.role}
                          onChange={(e) => updateRole(user.id, e.target.value as "USER" | "ADMIN")}
                          disabled={updatingId === user.id}
                          className="h-7 pl-2 pr-6 rounded-lg text-xs appearance-none cursor-pointer outline-none transition-colors disabled:opacity-50"
                          style={{
                            background: "var(--color-surface-2)",
                            border: "1px solid var(--color-border)",
                            color: "var(--color-text-muted)",
                          }}
                        >
                          <option value="USER">USER</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                        <ChevronDown size={10} className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none"
                          style={{ color: "var(--color-text-subtle)" }} />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: "var(--color-text-muted)" }}>
                    {new Date(user.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12" style={{ color: "var(--color-text-muted)" }}>
              <User size={32} className="mx-auto mb-3 opacity-30" />
              <p>No users found.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}