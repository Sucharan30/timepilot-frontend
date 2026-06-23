"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { apiClient } from "@/lib/api/client";
import { useAuth } from "@/lib/auth/context";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const phoneSchema = z.object({
  phone_number: z.string().min(10, "Invalid phone number"),
});

const otpSchema = z.object({
  otp: z.string().min(6, "OTP must be 6 digits").max(6, "OTP must be 6 digits"),
});

// Safely extracts a plain string from FastAPI errors.
// FastAPI 422 returns: { detail: [{type, loc, msg, input}] }
// FastAPI 400/401 returns: { detail: "some string" }
function getApiError(error: any, fallback: string): string {
  const detail = error?.response?.data?.detail;
  if (!detail) return fallback;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail.map((e: any) => (typeof e === "object" ? e.msg || JSON.stringify(e) : String(e))).join(", ");
  }
  return fallback;
}

export default function LoginPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const phoneForm = useForm({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone_number: "" },
  });

  const otpForm = useForm({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: "" },
  });

  const onSendOtp = async (data: { phone_number: string }) => {
    setIsLoading(true);
    try {
      const res: any = await apiClient.post("/auth/send-otp", { phone_number: data.phone_number });
      setPhone(data.phone_number);
      setStep(2);
      toast.success("OTP sent successfully");
      if (res.data?.otp) {
        toast.info(`DEV MODE: OTP is ${res.data.otp}`, { duration: 10000 });
      }
    } catch (error: any) {
      toast.error(getApiError(error, "Failed to send OTP"));
    } finally {
      setIsLoading(false);
    }
  };

  const onVerifyOtp = async (data: { otp: string }) => {
    setIsLoading(true);
    try {
      const res: any = await apiClient.post("/auth/verify-otp", {
        phone_number: phone,
        otp: data.otp,
      });
      toast.success("Login successful");
      await login(res.data.access_token, res.data.refresh_token);
    } catch (error: any) {
      toast.error(getApiError(error, "Invalid OTP. Please try again."));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border bg-card p-8 shadow-xl">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight">TimePilot AI</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {step === 1 ? "Enter your phone number to sign in" : "Enter the verification code"}
          </p>
        </div>

        <div className="relative min-h-[180px]">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0"
              >
                <form onSubmit={phoneForm.handleSubmit(onSendOtp)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      placeholder="+1234567890"
                      {...phoneForm.register("phone_number")}
                      disabled={isLoading}
                    />
                    {phoneForm.formState.errors.phone_number && (
                      <p className="text-xs text-destructive">
                        {phoneForm.formState.errors.phone_number.message}
                      </p>
                    )}
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Sending..." : "Send Code"}
                  </Button>
                </form>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0"
              >
                <form onSubmit={otpForm.handleSubmit(onVerifyOtp)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="otp">6-Digit Code</Label>
                    <Input
                      id="otp"
                      placeholder="000000"
                      maxLength={6}
                      className="text-center text-lg tracking-widest"
                      {...otpForm.register("otp")}
                      disabled={isLoading}
                      autoFocus
                    />
                    {otpForm.formState.errors.otp && (
                      <p className="text-xs text-destructive">
                        {otpForm.formState.errors.otp.message}
                      </p>
                    )}
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Verifying..." : "Sign In"}
                  </Button>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="mt-4 w-full text-center text-sm text-muted-foreground hover:text-foreground"
                    disabled={isLoading}
                  >
                    Back to phone number
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
