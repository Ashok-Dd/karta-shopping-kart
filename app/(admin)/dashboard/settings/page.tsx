import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CheckCircle, XCircle, Settings, Database, CreditCard, Image as ImageIcon, Globe } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Settings — Admin" };

function EnvCheck({ label, value, secret = false }: { label: string; value: string | undefined; secret?: boolean }) {
  const set = !!value;
  return (
    <div className="flex items-center justify-between py-3 border-b border-[var(--color-border)] last:border-0">
      <div className="flex items-center gap-2">
        {set
          ? <CheckCircle size={14} style={{ color: "var(--color-success)" }} />
          : <XCircle    size={14} style={{ color: "var(--color-error)"   }} />}
        <span className="text-sm font-mono" style={{ color: "var(--color-text)" }}>{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {set ? (
          <span className="text-xs font-mono" style={{ color: "var(--color-text-subtle)" }}>
            {secret ? "••••••••" : value!.length > 40 ? value!.slice(0, 40) + "…" : value}
          </span>
        ) : (
          <Badge variant="error">Not set</Badge>
        )}
      </div>
    </div>
  );
}

export default function AdminSettingsPage() {
  const checks = {
    database:   !!process.env.DATABASE_URL,
    authSecret: !!process.env.AUTH_SECRET,
    googleId:   !!process.env.GOOGLE_CLIENT_ID,
    googleSec:  !!process.env.GOOGLE_CLIENT_SECRET,
    rzpId:      !!process.env.RAZORPAY_KEY_ID,
    rzpSec:     !!process.env.RAZORPAY_KEY_SECRET,
    cloudName:  !!process.env.CLOUDINARY_CLOUD_NAME,
    cloudKey:   !!process.env.CLOUDINARY_API_KEY,
    cloudSec:   !!process.env.CLOUDINARY_API_SECRET,
    appUrl:     !!process.env.NEXT_PUBLIC_APP_URL,
  };

  const allSet = Object.values(checks).every(Boolean);

  const sections = [
    {
      icon: Database,
      title: "Database",
      vars: [
        { label: "DATABASE_URL",    value: process.env.DATABASE_URL,    secret: true },
        { label: "AUTH_SECRET",     value: process.env.AUTH_SECRET,     secret: true },
      ],
    },
    {
      icon: Globe,
      title: "Google OAuth",
      vars: [
        { label: "GOOGLE_CLIENT_ID",     value: process.env.GOOGLE_CLIENT_ID,     secret: false },
        { label: "GOOGLE_CLIENT_SECRET", value: process.env.GOOGLE_CLIENT_SECRET, secret: true  },
      ],
    },
    {
      icon: CreditCard,
      title: "Razorpay",
      vars: [
        { label: "RAZORPAY_KEY_ID",              value: process.env.RAZORPAY_KEY_ID,              secret: false },
        { label: "RAZORPAY_KEY_SECRET",           value: process.env.RAZORPAY_KEY_SECRET,           secret: true  },
        { label: "NEXT_PUBLIC_RAZORPAY_KEY_ID",   value: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,   secret: false },
      ],
    },
    {
      icon: ImageIcon,
      title: "Cloudinary",
      vars: [
        { label: "CLOUDINARY_CLOUD_NAME", value: process.env.CLOUDINARY_CLOUD_NAME, secret: false },
        { label: "CLOUDINARY_API_KEY",    value: process.env.CLOUDINARY_API_KEY,    secret: false },
        { label: "CLOUDINARY_API_SECRET", value: process.env.CLOUDINARY_API_SECRET, secret: true  },
      ],
    },
    {
      icon: Settings,
      title: "App",
      vars: [
        { label: "NEXT_PUBLIC_APP_URL",  value: process.env.NEXT_PUBLIC_APP_URL,  secret: false },
        { label: "NEXT_PUBLIC_APP_NAME", value: process.env.NEXT_PUBLIC_APP_NAME, secret: false },
      ],
    },
  ];

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="font-display text-3xl" style={{ color: "var(--color-text)" }}>Settings</h1>
        <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
          Environment configuration status.
        </p>
      </div>

      {/* Overall status */}
      <Card variant="default" padding="md" className="mb-6">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: allSet ? "var(--color-success)" + "20" : "var(--color-error)" + "20" }}
          >
            <Settings size={18} style={{ color: allSet ? "var(--color-success)" : "var(--color-error)" }} />
          </div>
          <div>
            <p className="font-semibold" style={{ color: "var(--color-text)" }}>
              {allSet ? "All systems configured" : "Missing configuration"}
            </p>
            <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
              {Object.values(checks).filter(Boolean).length}/{Object.values(checks).length} environment variables set
            </p>
          </div>
          <Badge variant={allSet ? "success" : "error"} className="ml-auto">
            {allSet ? "Ready" : "Incomplete"}
          </Badge>
        </div>
      </Card>

      {/* Section cards */}
      <div className="flex flex-col gap-4">
        {sections.map(({ icon: Icon, title, vars }) => (
          <Card key={title} variant="default" padding="md">
            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-[var(--color-border)]">
              <Icon size={15} style={{ color: "var(--color-accent-2)" }} />
              <h2 className="font-semibold text-sm" style={{ color: "var(--color-text)" }}>{title}</h2>
            </div>
            {vars.map((v) => (
              <EnvCheck key={v.label} label={v.label} value={v.value} secret={v.secret} />
            ))}
          </Card>
        ))}
      </div>

      {/* Setup hint */}
      {!allSet && (
        <div
          className="mt-6 p-4 rounded-xl text-sm"
          style={{
            background: "var(--color-warning)" + "10",
            border: "1px solid " + "var(--color-warning)" + "30",
            color: "var(--color-warning)",
          }}
        >
          Copy <code className="font-mono text-xs">.env.example</code> to <code className="font-mono text-xs">.env</code> and fill in the missing values, then restart the dev server.
        </div>
      )}
    </div>
  );
}