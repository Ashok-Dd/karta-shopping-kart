"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CreditCard, ShoppingBag, Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatPrice } from "@/lib/utils";
import type { CartItem, Product } from "@/types";

const addressSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  phone: z.string().min(10, "Valid phone number required").max(10),
  line1: z.string().min(5, "Address is required"),
  line2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().length(6, "Valid 6-digit pincode required"),
});

type AddressForm = z.infer<typeof addressSchema>;

interface CheckoutClientProps {
  cartItems: (CartItem & { product: Product })[];
  user: { id: string; name?: string | null; email: string };
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => { open(): void };
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => void;
  prefill: { name?: string | null; email: string };
  theme: { color: string };
  modal: { ondismiss: () => void };
}

export function CheckoutClient({ cartItems, user }: CheckoutClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"address" | "review">("address");

  const subtotal = cartItems.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const shipping = subtotal > 999 ? 0 : 99;
  const total = subtotal + shipping;

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<AddressForm>({ resolver: zodResolver(addressSchema) });

  async function loadRazorpay(): Promise<boolean> {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  async function handlePayment(address: AddressForm) {
    setLoading(true);
    try {
      const loaded = await loadRazorpay();
      if (!loaded) throw new Error("Failed to load payment gateway");

      // Create Razorpay order
      const orderRes = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, amount: total }),
      });
      if (!orderRes.ok) throw new Error("Failed to create order");
      const { orderId, razorpayOrderId, amount } = await orderRes.json();

      const options: RazorpayOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount: amount * 100,
        currency: "INR",
        name: "Karta",
        description: "Order Payment",
        order_id: razorpayOrderId,
        handler: async (response) => {
          // Verify payment
          const verifyRes = await fetch("/api/payment/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            }),
          });
          if (verifyRes.ok) {
            router.push(`/orders/${orderId}?success=true`);
          }
        },
        prefill: { name: user.name, email: user.email },
        theme: { color: "#d4a853" },
        modal: { ondismiss: () => setLoading(false) },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left: Form */}
      <div className="lg:col-span-2">
        {step === "address" ? (
          <div className="surface rounded-2xl p-6">
            <h2 className="font-display text-xl mb-6 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-[var(--color-accent)] text-[#0a0a0a] text-xs font-bold flex items-center justify-center">1</span>
              Delivery Address
            </h2>
            <form onSubmit={handleSubmit(() => setStep("review"))} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Input label="Full Name" {...register("fullName")} error={errors.fullName?.message} placeholder="Ravi Shankar" />
              </div>
              <Input label="Phone Number" {...register("phone")} error={errors.phone?.message} placeholder="9876543210" maxLength={10} />
              <div className="sm:col-span-2">
                <Input label="Address Line 1" {...register("line1")} error={errors.line1?.message} placeholder="Flat 4B, Green Towers" />
              </div>
              <div className="sm:col-span-2">
                <Input label="Address Line 2 (Optional)" {...register("line2")} placeholder="Near City Mall" />
              </div>
              <Input label="City" {...register("city")} error={errors.city?.message} placeholder="Hyderabad" />
              <Input label="State" {...register("state")} error={errors.state?.message} placeholder="Telangana" />
              <Input label="Pincode" {...register("pincode")} error={errors.pincode?.message} placeholder="500001" maxLength={6} />
              <div className="sm:col-span-2 flex justify-end pt-2">
                <Button type="submit" size="lg">Continue to Review</Button>
              </div>
            </form>
          </div>
        ) : (
          <div className="surface rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-[var(--color-accent)] text-[#0a0a0a] text-xs font-bold flex items-center justify-center">2</span>
                Review & Pay
              </h2>
              <button onClick={() => setStep("address")} className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors underline underline-offset-2">
                Edit Address
              </button>
            </div>

            {/* Address summary */}
            <div className="surface-2 rounded-xl p-4 mb-6 text-sm text-[var(--color-text-muted)]">
              {(() => {
                const v = getValues();
                return <p>{v.fullName} · {v.phone}<br />{v.line1}{v.line2 ? `, ${v.line2}` : ""}<br />{v.city}, {v.state} — {v.pincode}</p>;
              })()}
            </div>

            {/* Items */}
            <div className="flex flex-col gap-3 mb-6">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-[var(--color-surface-2)] shrink-0">
                    {item.product.images[0] && (
                      <Image src={item.product.images[0]} alt={item.product.name} fill className="object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.product.name}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">Qty: {item.quantity}</p>
                  </div>
                  <span className="text-sm font-semibold shrink-0">{formatPrice(item.product.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <Button
              size="lg"
              onClick={handleSubmit(handlePayment)}
              loading={loading}
              className="w-full gap-2"
            >
              <Lock size={15} />
              Pay {formatPrice(total)} Securely
            </Button>
            <p className="text-xs text-center text-[var(--color-text-subtle)] mt-3 flex items-center justify-center gap-1">
              <CreditCard size={11} /> Secured by Razorpay
            </p>
          </div>
        )}
      </div>

      {/* Right: Summary */}
      <div className="lg:col-span-1">
        <div className="surface rounded-2xl p-6 sticky top-24 flex flex-col gap-4">
          <h2 className="font-display text-lg flex items-center gap-2">
            <ShoppingBag size={16} /> Order Summary
          </h2>
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between text-[var(--color-text-muted)]">
              <span>Subtotal</span><span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-[var(--color-text-muted)]">
              <span>Shipping</span>
              <span className={shipping === 0 ? "text-[var(--color-success)]" : ""}>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
            </div>
          </div>
          <div className="border-t border-[var(--color-border)] pt-4 flex justify-between font-semibold">
            <span>Total</span>
            <span className="font-display text-lg">{formatPrice(total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
