import { SignupForm } from "@/components/features/auth/SignupForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account",
  robots: { index: false, follow: false },
};

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-16">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-semibold text-gradient mb-2">KARTA</h1>
          <p className="text-[var(--color-text-muted)] text-sm">Create your account</p>
        </div>
        <SignupForm />
      </div>
    </div>
  );
}
