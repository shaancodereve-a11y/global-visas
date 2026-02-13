import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Loader2, Mail, Lock, Shield } from "lucide-react";
import logoPath from "@assets/GLOBAL-VISA-logo_1771013259487.webp";

const loginFormSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showOtp, setShowOtp] = useState(false);
  const [otpEmail, setOtpEmail] = useState("");
  const [otpValue, setOtpValue] = useState("");

  const form = useForm<z.infer<typeof loginFormSchema>>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { email: "", password: "" },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: z.infer<typeof loginFormSchema>) => {
      const res = await apiRequest("POST", "/api/auth/login", data);
      return res.json();
    },
    onSuccess: (data) => {
      if (data.requiresOtp) {
        setOtpEmail(data.email);
        setShowOtp(true);
        toast({ title: "Verification code sent", description: "Please check your email for the 6-digit code." });
      }
    },
    onError: (error: Error) => {
      toast({ title: "Login failed", description: error.message.replace(/^\d+:\s*/, ""), variant: "destructive" });
    },
  });

  const verifyMutation = useMutation({
    mutationFn: async (code: string) => {
      const res = await apiRequest("POST", "/api/auth/verify-otp", { email: otpEmail, code, type: "login" });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({ title: "Login successful", description: "Welcome back!" });
      setLocation("/dashboard");
    },
    onError: (error: Error) => {
      toast({ title: "Verification failed", description: error.message.replace(/^\d+:\s*/, ""), variant: "destructive" });
    },
  });

  const resendMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/resend-otp", { email: otpEmail, type: "login" });
    },
    onSuccess: () => {
      toast({ title: "Code resent", description: "A new verification code has been sent to your email." });
    },
  });

  const onSubmit = (data: z.infer<typeof loginFormSchema>) => {
    loginMutation.mutate(data);
  };

  const handleOtpComplete = (value: string) => {
    setOtpValue(value);
    if (value.length === 6) {
      verifyMutation.mutate(value);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
          <img src={logoPath} alt="Global Visas" className="h-12 object-contain" data-testid="img-logo" />
        </div>

        {!showOtp ? (
          <Card>
            <CardHeader className="text-center pb-4">
              <h1 className="text-xl font-semibold" data-testid="text-login-title">Sign in to your account</h1>
              <p className="text-sm text-muted-foreground">Enter your credentials to access your visa applications</p>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input {...field} type="email" placeholder="you@example.com" className="pl-10" data-testid="input-email" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input {...field} type="password" placeholder="Enter your password" className="pl-10" data-testid="input-password" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={loginMutation.isPending} data-testid="button-login">
                    {loginMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Sign In
                  </Button>
                </form>
              </Form>
              <div className="mt-4 text-center text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link href="/signup" className="text-primary font-medium" data-testid="link-signup">
                  Create account
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-accent">
                <Shield className="h-6 w-6 text-accent-foreground" />
              </div>
              <h1 className="text-xl font-semibold" data-testid="text-otp-title">Two-Factor Authentication</h1>
              <p className="text-sm text-muted-foreground">
                We sent a 6-digit verification code to <strong>{otpEmail}</strong>
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center space-y-4">
                <InputOTP maxLength={6} value={otpValue} onChange={handleOtpComplete} data-testid="input-otp">
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>

                {verifyMutation.isPending && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" /> Verifying...
                  </div>
                )}

                <div className="flex flex-col items-center gap-2 text-sm">
                  <button
                    type="button"
                    onClick={() => resendMutation.mutate()}
                    disabled={resendMutation.isPending}
                    className="text-primary font-medium"
                    data-testid="button-resend-otp"
                  >
                    {resendMutation.isPending ? "Sending..." : "Resend code"}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowOtp(false); setOtpValue(""); }}
                    className="text-muted-foreground"
                    data-testid="button-back-login"
                  >
                    Back to login
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
