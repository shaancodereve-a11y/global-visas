import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { useLocation, useParams } from "wouter";
import type { Application } from "@shared/schema";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, FileText, Clock, CheckCircle2, XCircle } from "lucide-react";
import logoPath from "@assets/GLOBAL-VISA-logo_1771013259487.webp";

function getStatusDisplay(status: string) {
  switch (status) {
    case "submitted":
      return { label: "Submitted", icon: Clock, color: "text-primary", bg: "bg-accent" };
    case "pending":
      return { label: "Pending Review", icon: Clock, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950" };
    case "approved":
      return { label: "Approved", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950" };
    case "rejected":
      return { label: "Rejected", icon: XCircle, color: "text-destructive", bg: "bg-red-50 dark:bg-red-950" };
    default:
      return { label: status, icon: FileText, color: "text-muted-foreground", bg: "bg-muted" };
  }
}

export default function ApplicationViewPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const params = useParams<{ id: string }>();

  const { data: application, isLoading } = useQuery<Application>({
    queryKey: ["/api/applications", params.id],
    queryFn: getQueryFn({ on401: "throw" }),
  });

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
            <Button className="mt-4" onClick={() => setLocation("/dashboard")} data-testid="button-back">Back to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusInfo = getStatusDisplay(application.status);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <img src={logoPath} alt="Global Visas" className="h-8 brightness-0 invert object-contain" data-testid="img-logo" />
          <span className="font-semibold text-sm">Application Status</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <Button variant="ghost" size="sm" onClick={() => setLocation("/dashboard")} className="mb-4" data-testid="button-back-dashboard">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Dashboard
        </Button>

        <Card className="mb-6">
          <CardContent className="p-6">
            <div className={`flex items-center gap-4 p-4 rounded-md ${statusInfo.bg}`}>
              <StatusIcon className={`h-8 w-8 ${statusInfo.color}`} />
              <div>
                <h2 className="text-lg font-semibold" data-testid="text-status-label">{statusInfo.label}</h2>
                <p className="text-sm text-muted-foreground">
                  Visitor Visa (Subclass 600) Application
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader className="pb-3">
            <h3 className="font-semibold">Application Details</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground">Application ID</span>
                <span className="font-mono text-xs" data-testid="text-app-id">{application.id}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground">Progress</span>
                <span data-testid="text-progress">Step {application.currentStep}/20</span>
              </div>
              {application.submittedAt && (
                <div className="flex justify-between gap-2">
                  <span className="text-muted-foreground">Submitted</span>
                  <span data-testid="text-submitted-date">{new Date(application.submittedAt).toLocaleDateString()}</span>
                </div>
              )}
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground">Last Updated</span>
                <span data-testid="text-updated-date">{new Date(application.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {application.adminNotes && (
          <Card>
            <CardHeader className="pb-3">
              <h3 className="font-semibold">Notes from Admin</h3>
            </CardHeader>
            <CardContent>
              <p className="text-sm" data-testid="text-admin-notes">{application.adminNotes}</p>
            </CardContent>
          </Card>
        )}

        {application.status === "draft" && (
          <div className="mt-6">
            <Button onClick={() => setLocation(`/application/${application.id}`)} data-testid="button-continue-application">
              Continue Application
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
