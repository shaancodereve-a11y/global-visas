import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { getQueryFn } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import type { Application } from "@shared/schema";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, FileText, Clock, CheckCircle2, XCircle, ArrowRight, Printer, LogOut } from "lucide-react";
import logoPath from "@assets/GLOBAL-VISA-logo_1771013259487.webp";

function getStatusBadge(status: string) {
  switch (status) {
    case "draft":
      return <Badge variant="secondary" data-testid={`badge-status-${status}`}>Draft</Badge>;
    case "submitted":
      return <Badge variant="default" data-testid={`badge-status-${status}`}>Submitted</Badge>;
    case "pending":
      return <Badge className="bg-amber-500 text-white" data-testid={`badge-status-${status}`}>Pending Review</Badge>;
    case "approved":
      return <Badge className="bg-emerald-600 text-white" data-testid={`badge-status-${status}`}>Approved</Badge>;
    case "rejected":
      return <Badge variant="destructive" data-testid={`badge-status-${status}`}>Rejected</Badge>;
    default:
      return <Badge variant="outline" data-testid={`badge-status-${status}`}>{status}</Badge>;
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case "draft":
      return <FileText className="h-5 w-5 text-muted-foreground" />;
    case "submitted":
    case "pending":
      return <Clock className="h-5 w-5 text-amber-500" />;
    case "approved":
      return <CheckCircle2 className="h-5 w-5 text-emerald-600" />;
    case "rejected":
      return <XCircle className="h-5 w-5 text-destructive" />;
    default:
      return <FileText className="h-5 w-5 text-muted-foreground" />;
  }
}

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: applications, isLoading } = useQuery<Application[]>({
    queryKey: ["/api/applications"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/applications", {
        userId: user!.id,
        formData: {},
        currentStep: 1,
        status: "draft",
      });
      return res.json();
    },
    onSuccess: (app) => {
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
      setLocation(`/application/${app.id}`);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: "Could not create application.", variant: "destructive" });
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
          <img src={logoPath} alt="Global Visas" className="h-10 object-contain" data-testid="img-logo" />
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm text-muted-foreground" data-testid="text-user-email">{user?.email}</span>
            <Button variant="ghost" size="sm" onClick={logout} data-testid="button-logout">
              <LogOut className="h-4 w-4 mr-1" /> Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
          <div>
            <h1 className="text-2xl font-semibold" data-testid="text-dashboard-title">My Applications</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Welcome back, {user?.firstName}. Manage your visa applications below.
            </p>
          </div>
          <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending} data-testid="button-new-application">
            <Plus className="h-4 w-4 mr-1" /> New Application
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-16 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : applications && applications.length > 0 ? (
          <div className="space-y-3">
            {applications.map((app) => (
              <Card key={app.id} className="hover-elevate cursor-pointer" onClick={() => setLocation(app.status === "draft" ? `/application/${app.id}` : `/application/${app.id}/view`)} data-testid={`card-application-${app.id}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(app.status)}
                      <div>
                        <p className="font-medium" data-testid={`text-app-title-${app.id}`}>
                          Visitor Visa (Subclass 600)
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Step {app.currentStep}/20 {app.status === "draft" ? "- In progress" : ""}
                          {app.submittedAt && ` - Submitted ${new Date(app.submittedAt).toLocaleDateString()}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(app.status)}
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-lg font-medium mb-2" data-testid="text-no-applications">No applications yet</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Start your Visitor Visa (Subclass 600) application by clicking the button below.
              </p>
              <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending} data-testid="button-start-application">
                <Plus className="h-4 w-4 mr-1" /> Start New Application
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
