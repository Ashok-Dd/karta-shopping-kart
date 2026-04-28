import { LoginForm } from "@/components/features/auth/LoginForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-16">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-semibold text-gradient mb-2">KARTA</h1>
          <p className="text-[var(--color-text-muted)] text-sm">Sign in to your account</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
