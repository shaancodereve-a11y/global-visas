import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient, getQueryFn } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { useLocation, useParams } from "wouter";
import { useToast } from "@/hooks/use-toast";
import type { Application } from "@shared/schema";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Printer, ArrowLeft, ArrowRight, Save, Loader2 } from "lucide-react";
import logoPath from "@assets/GLOBAL-VISA-logo_1771013259487.webp";

function TermsContent() {
  return (
    <div className="space-y-4 text-sm text-foreground leading-relaxed">
      <h3 className="font-semibold text-base">Terms and Conditions</h3>
      <p>
        By using this service, you agree to the following terms and conditions
        governing the submission of your visa application through Global Visas.
      </p>
      <ul className="list-disc pl-5 space-y-2">
        <li>
          All information provided in this application must be accurate and
          truthful. Providing false or misleading information may result in the
          refusal of your visa application.
        </li>
        <li>
          You understand that Global Visas acts as an authorized representative
          to assist with visa applications and does not guarantee the outcome
          of any application.
        </li>
        <li>
          Processing times may vary. Global Visas is not responsible for delays
          caused by government authorities or third parties.
        </li>
        <li>
          You consent to the collection, storage, and processing of your
          personal data in accordance with applicable privacy laws and our
          Privacy Policy.
        </li>
        <li>
          All documents submitted become part of your application record and
          may be shared with relevant government authorities as required.
        </li>
        <li>
          You agree to promptly provide any additional information or
          documentation requested during the processing of your application.
        </li>
        <li>
          Application fees are non-refundable once the application has been
          submitted to the relevant authority.
        </li>
      </ul>

      <h3 className="font-semibold text-base mt-6">Privacy Statement</h3>
      <p>
        Global Visas is committed to protecting your privacy. We collect
        personal information necessary for processing your visa application,
        including but not limited to: name, date of birth, passport details,
        employment history, and travel plans.
      </p>
      <p>
        Your information is stored securely and is only shared with relevant
        government authorities as required for your application. We do not sell
        or share your personal data with third parties for marketing purposes.
      </p>
      <p>
        You have the right to access, correct, or request deletion of your
        personal data at any time by contacting our support team.
      </p>
    </div>
  );
}

export default function ApplicationPage() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const params = useParams<{ id: string }>();
  const { toast } = useToast();
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const { data: application, isLoading } = useQuery<Application>({
    queryKey: ["/api/applications", params.id],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  useEffect(() => {
    if (application?.formData) {
      const fd = application.formData as Record<string, unknown>;
      if (fd.termsAccepted) {
        setAgreedToTerms(true);
      }
    }
  }, [application]);

  const saveMutation = useMutation({
    mutationFn: async (data: { formData?: Record<string, unknown>; currentStep?: number }) => {
      const res = await apiRequest("PATCH", `/api/applications/${params.id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/applications", params.id] });
    },
  });

  const handleSave = useCallback(() => {
    const currentFormData = (application?.formData || {}) as Record<string, unknown>;
    saveMutation.mutate({
      formData: { ...currentFormData, termsAccepted: agreedToTerms },
      currentStep: 1,
    });
    toast({ title: "Saved", description: "Your progress has been saved." });
  }, [agreedToTerms, application, saveMutation, toast]);

  const handleNext = useCallback(() => {
    if (!agreedToTerms) {
      toast({
        title: "Terms required",
        description: "Please read and agree to the terms and conditions before proceeding.",
        variant: "destructive",
      });
      return;
    }
    const currentFormData = (application?.formData || {}) as Record<string, unknown>;
    saveMutation.mutate(
      {
        formData: { ...currentFormData, termsAccepted: true },
        currentStep: 2,
      },
      {
        onSuccess: () => {
          toast({ title: "Step 1 complete", description: "Moving to the next step. Share the screenshot for Step 2 to continue building." });
        },
      }
    );
  }, [agreedToTerms, application, saveMutation, toast]);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-3xl mx-auto space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Application not found.</p>
            <Button className="mt-4" onClick={() => setLocation("/dashboard")} data-testid="button-back-dashboard">
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentStep = application.currentStep;
  const totalSteps = 20;
  const progressPercent = (currentStep / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="bg-primary text-primary-foreground px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <img src={logoPath} alt="Global Visas" className="h-8 brightness-0 invert object-contain" data-testid="img-logo-header" />
            <span className="font-semibold text-sm">Application for a Visitor Short Stay Visa</span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto w-full px-4 py-6 flex-1">
        <div className="mb-6">
          <div className="flex items-center justify-between gap-2 mb-2">
            <Progress value={progressPercent} className="flex-1 h-2" data-testid="progress-bar" />
          </div>
          <p className="text-center text-sm text-muted-foreground" data-testid="text-step-counter">{currentStep}/{totalSteps}</p>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <h2 className="text-lg font-semibold text-primary" data-testid="text-step-title">Terms and Conditions</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setShowTerms(!showTerms)}
                className="text-primary text-sm font-medium underline"
                data-testid="button-view-terms"
              >
                {showTerms ? "Hide Terms and Conditions" : "View Terms and Conditions"}
              </button>
              <br />
              <button
                type="button"
                onClick={() => setShowTerms(!showTerms)}
                className="text-primary text-sm font-medium underline"
                data-testid="button-view-privacy"
              >
                View Privacy Statement
              </button>
            </div>

            {showTerms && (
              <Card>
                <CardContent className="p-4 max-h-96 overflow-y-auto">
                  <TermsContent />
                </CardContent>
              </Card>
            )}

            <div className="flex items-start gap-3 py-4">
              <Checkbox
                id="terms"
                checked={agreedToTerms}
                onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
                data-testid="checkbox-terms"
              />
              <label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                I have read and agree to the terms and conditions
              </label>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="border-t bg-card mt-auto">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={handlePrint} data-testid="button-print">
              <Printer className="h-4 w-4 mr-1" /> Print
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setLocation("/dashboard")} data-testid="button-go-to-account">
              Go to my account
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSave} disabled={saveMutation.isPending} data-testid="button-save">
              {saveMutation.isPending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
              Save
            </Button>
          </div>
          <Button onClick={handleNext} disabled={saveMutation.isPending} data-testid="button-next">
            {saveMutation.isPending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
            Next <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
