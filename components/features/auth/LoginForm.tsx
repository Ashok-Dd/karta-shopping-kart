"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { toast } from "@/components/ui/Toaster";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
type FormData = z.infer<typeof schema>;

export function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  function getAuthErrorMessage(error?: string) {
  switch (error) {
    case "CredentialsSignin":
      return "Invalid email or password";
    case "OAuthAccountNotLinked":
      return "Account already exists with a different provider";
    case "AccessDenied":
      return "Access denied";
    default:
      return error || "Something went wrong";
  }
}


  async function onSubmit(data: FormData) {
  try {
    setLoading(true);
    setError(null);

    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      const message = getAuthErrorMessage(result.error);

      toast.error(message, "Please try again");
      setError(message);
      return;
    }

    toast.success("Login successful!", "Welcome back");

    router.push("/");
    router.refresh();
  } catch (err) {
    setLoading(false);

    toast.error("Server error", "Please try again later");
    setError("Something went wrong");
  }
}

  async function signInWithGoogle() {
  try {
    setGoogleLoading(true);

    toast.info("Redirecting to Google...");

    await signIn("google", { callbackUrl: "/" });
  } catch (error) {
    toast.error("Google sign-in failed", "Please try again");
    setGoogleLoading(false);
  }
}

  return (
    <Card variant="elevated" padding="lg" className="flex flex-col gap-5">
      {/* Google OAuth */}
      <Button
        variant="secondary"
        size="lg"
        className="w-full gap-3"
        onClick={signInWithGoogle}
        loading={googleLoading}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
          <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
          <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
          <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
        </svg>
        Continue with Google
      </Button>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-[var(--color-border)]" />
        <span className="text-xs text-[var(--color-text-subtle)]">or</span>
        <div className="flex-1 h-px bg-[var(--color-border)]" />
      </div>

      {/* Credentials form */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          leftIcon={<Mail size={15} />}
          {...register("email")}
          error={errors.email?.message}
        />
        <Input
          label="Password"
          type={showPassword ? "text" : "password"}
          placeholder="••••••••"
          leftIcon={<Lock size={15} />}
          rightIcon={
            <button type="button" onClick={() => setShowPassword((v) => !v)} className="hover:text-[var(--color-text)] transition-colors">
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          }
          {...register("password")}
          error={errors.password?.message}
        />

        {error && (
          <p className="text-sm text-[var(--color-error)] bg-[var(--color-error)]/10 border border-[var(--color-error)]/20 rounded-xl px-4 py-2.5">
            {error}
          </p>
        )}

        <Button type="submit" size="lg" className="w-full mt-1" loading={loading}>
          Sign In
        </Button>
      </form>

      <p className="text-center text-sm text-[var(--color-text-muted)]">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-[var(--color-accent)] hover:underline underline-offset-2">
          Create one
        </Link>
      </p>
    </Card>
  );
}
