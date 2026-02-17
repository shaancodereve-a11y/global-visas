import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient, getQueryFn } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { useLocation, useParams } from "wouter";
import { useToast } from "@/hooks/use-toast";
import type { Application, User, Document } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Loader2,
  Upload,
  Trash2,
  FileText,
  ChevronDown,
  ChevronRight,
  HelpCircle,
  Plus,
  Send,
  Eye,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import logoPath from "@assets/GLOBAL-VISA-logo_1771013259487.webp";

type ApplicationWithUser = Application & { user?: User };

const DOCUMENT_CATEGORIES = {
  required: [
    { key: "travel_document", label: "Travel Document", helpText: "A certified copy of the bio-data page of the applicant's current passport" },
    { key: "national_id", label: "National Identity Document (other than Passport)", helpText: "A certified copy of the applicant's national identity card or birth certificate" },
    { key: "previous_travel", label: "Evidence of the applicant's previous travel", helpText: "Copies of previous visas or entry/exit stamps" },
  ],
  recommended: [
    { key: "family_register", label: "Family register and composition form (if applicable)", helpText: "Documents showing family composition and relationships" },
    { key: "tourism_evidence", label: "Evidence of planned tourism activities in Australia", helpText: "Hotel bookings, tour reservations, itinerary" },
    { key: "financial_evidence", label: "Evidence of the financial status and funding for visit", helpText: "Bank statements, employment letter, sponsorship letter" },
  ],
};

function getStatusBadge(status: string) {
  switch (status) {
    case "draft": return <Badge variant="secondary">Draft</Badge>;
    case "submitted": return <Badge variant="default">Submitted</Badge>;
    case "pending": return <Badge className="bg-amber-500 text-white">Pending</Badge>;
    case "approved": return <Badge className="bg-emerald-600 text-white">Approved</Badge>;
    case "rejected": return <Badge variant="destructive">Rejected</Badge>;
    default: return <Badge variant="outline">{status}</Badge>;
  }
}

export default function AdminApplicationPage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const params = useParams<{ id: string }>();
  const { toast } = useToast();
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [uploadingCategory, setUploadingCategory] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [activeTab, setActiveTab] = useState<"details" | "documents">("documents");

  const { data: application, isLoading } = useQuery<ApplicationWithUser>({
    queryKey: ["/api/admin/applications", params.id],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const { data: documents = [] } = useQuery<Document[]>({
    queryKey: [`/api/documents/${params.id}`],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: !!params.id,
  });

  const statusMutation = useMutation({
    mutationFn: async ({ status, notes }: { status: string; notes: string }) => {
      const res = await apiRequest("PATCH", `/api/admin/applications/${params.id}/status`, { status, adminNotes: notes });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/applications", params.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/applications"] });
      setShowStatusDialog(false);
      toast({ title: "Status updated" });
    },
    onError: () => {
      toast({ title: "Error", description: "Could not update status.", variant: "destructive" });
    },
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/admin/applications/${params.id}/submit`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/applications", params.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/applications"] });
      toast({ title: "Application submitted", description: "The application has been submitted on behalf of the applicant." });
    },
    onError: () => {
      toast({ title: "Error", description: "Could not submit application.", variant: "destructive" });
    },
  });

  const deleteAppMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/admin/applications/${params.id}`);
    },
    onSuccess: () => {
      toast({ title: "Application deleted", description: "The application and all documents have been permanently deleted." });
      setLocation("/admin");
    },
    onError: () => {
      toast({ title: "Error", description: "Could not delete application.", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (docId: string) => {
      await apiRequest("DELETE", `/api/documents/${docId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/documents/${params.id}`] });
      toast({ title: "Document deleted" });
    },
    onError: () => {
      toast({ title: "Error", description: "Could not delete document.", variant: "destructive" });
    },
  });

  const toggleCategory = (key: string) => {
    setExpandedCategories((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const getDocsForCategory = (categoryKey: string) => {
    return documents.filter((d) => d.category === categoryKey);
  };

  const handleFileUpload = async (categoryKey: string, file: File) => {
    setUploadingCategory(categoryKey);
    try {
      const urlRes = await apiRequest("POST", "/api/uploads/request-url", {
        name: file.name,
        size: file.size,
        contentType: file.type,
      });
      const { uploadURL, objectPath } = await urlRes.json();

      const putRes = await fetch(uploadURL, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });
      if (!putRes.ok) throw new Error("Failed to upload file to storage");

      await apiRequest("POST", "/api/documents", {
        applicationId: params.id,
        name: file.name,
        category: categoryKey,
        objectPath,
        fileType: file.type,
        fileSize: file.size,
      });

      queryClient.invalidateQueries({ queryKey: [`/api/documents/${params.id}`] });
      toast({ title: "Uploaded", description: `${file.name} has been uploaded on behalf of the applicant.` });
    } catch (error) {
      console.error("Upload error:", error);
      toast({ title: "Upload failed", description: "Could not upload the file.", variant: "destructive" });
    } finally {
      setUploadingCategory(null);
    }
  };

  const openStatusDialog = () => {
    if (application) {
      setNewStatus(application.status);
      setAdminNotes(application.adminNotes || "");
      setShowStatusDialog(true);
    }
  };

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card><CardContent className="p-8 text-center"><p className="text-muted-foreground">Access denied.</p></CardContent></Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto space-y-4">
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
            <Button className="mt-4" onClick={() => setLocation("/admin")} data-testid="button-back">Back to Admin</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formData = (application.formData || {}) as Record<string, unknown>;
  const applicantName = application.user ? `${application.user.firstName} ${application.user.lastName}` : "Unknown";
  const applicantEmail = application.user?.email || "N/A";
  const totalDocs = documents.length;

  const renderCategory = (cat: { key: string; label: string; helpText: string }) => {
    const docs = getDocsForCategory(cat.key);
    const isExpanded = expandedCategories[cat.key];
    const isUploading = uploadingCategory === cat.key;

    return (
      <div key={cat.key} className="border rounded-md" data-testid={`admin-doc-category-${cat.key}`}>
        <button
          type="button"
          className="w-full flex items-center justify-between p-3 text-left hover-elevate"
          onClick={() => toggleCategory(cat.key)}
          data-testid={`admin-button-toggle-${cat.key}`}
        >
          <div className="flex items-center gap-2">
            <Plus className="h-4 w-4 text-primary shrink-0" />
            <span className="text-sm font-medium text-primary">{cat.label}</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-muted-foreground shrink-0" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs"><p>{cat.helpText}</p></TooltipContent>
            </Tooltip>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{docs.length} Received</span>
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </div>
        </button>

        {isExpanded && (
          <div className="border-t p-3 space-y-3">
            {docs.length > 0 && (
              <div className="space-y-2">
                {docs.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between gap-2 p-2 bg-accent/30 rounded-md" data-testid={`admin-doc-item-${doc.id}`}>
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="h-4 w-4 text-primary shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm truncate">{doc.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {doc.fileSize ? `${(doc.fileSize / 1024).toFixed(1)} KB` : ""}
                          {doc.uploadedBy === "admin" ? " (uploaded by admin)" : " (uploaded by applicant)"}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMutation.mutate(doc.id)}
                      disabled={deleteMutation.isPending}
                      data-testid={`admin-button-delete-doc-${doc.id}`}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2">
              <label className="flex-1">
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleFileUpload(cat.key, file);
                      e.target.value = "";
                    }
                  }}
                  data-testid={`admin-input-file-${cat.key}`}
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  disabled={isUploading}
                  onClick={(e) => {
                    const input = (e.currentTarget as HTMLElement).parentElement?.querySelector("input[type=file]") as HTMLInputElement;
                    input?.click();
                  }}
                  data-testid={`admin-button-upload-${cat.key}`}
                >
                  {isUploading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Upload className="h-4 w-4 mr-1" />}
                  {isUploading ? "Uploading..." : "Upload on behalf of applicant"}
                </Button>
              </label>
            </div>
          </div>
        )}
      </div>
    );
  };

  const field = (label: string, value: unknown) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm">{(value as string) || "Not provided"}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <img src={logoPath} alt="Global Visas" className="h-10 object-contain" data-testid="img-admin-logo" />
            <Badge variant="secondary">Admin</Badge>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setLocation("/admin")} data-testid="button-back-admin">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Dashboard
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <Card>
          <CardContent className="p-6 space-y-3">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h1 className="text-xl font-semibold" data-testid="text-admin-app-title">
                  Application: {application.trn}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {applicantName} ({applicantEmail})
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {getStatusBadge(application.status)}
                <Badge variant="outline">Step {application.currentStep}/22</Badge>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Button variant="outline" size="sm" onClick={openStatusDialog} data-testid="button-update-status">
                Update Status
              </Button>
              {application.status === "draft" && (
                <Button
                  size="sm"
                  onClick={() => submitMutation.mutate()}
                  disabled={submitMutation.isPending}
                  data-testid="button-submit-application"
                >
                  {submitMutation.isPending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                  <Send className="h-4 w-4 mr-1" /> Submit Application
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLocation(`/application/${params.id}/view`)}
                data-testid="button-view-form"
              >
                <Eye className="h-4 w-4 mr-1" /> View Form Data
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
                data-testid="button-delete-application"
              >
                <Trash2 className="h-4 w-4 mr-1" /> Delete
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant={activeTab === "documents" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("documents")}
            data-testid="button-tab-documents"
          >
            <FileText className="h-4 w-4 mr-1" /> Documents ({totalDocs})
          </Button>
          <Button
            variant={activeTab === "details" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("details")}
            data-testid="button-tab-details"
          >
            <Eye className="h-4 w-4 mr-1" /> Application Summary
          </Button>
        </div>

        {activeTab === "documents" && (
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-primary" data-testid="text-applicant-name-docs">
                  {formData.familyName ? `${String(formData.familyName)}, ${String(formData.givenNames || "")}` : applicantName}
                </span>
                {typeof formData.dateOfBirth === "string" && formData.dateOfBirth && (
                  <span className="text-sm text-muted-foreground">({formData.dateOfBirth})</span>
                )}
              </div>
              <p className="text-sm text-muted-foreground" data-testid="text-admin-attachment-count">
                {totalDocs} attachment{totalDocs !== 1 ? "s" : ""} received of <strong>60</strong> maximum.
              </p>

              <div className="space-y-2">
                <p className="text-sm font-semibold text-primary">Required</p>
                <div className="space-y-2">
                  {DOCUMENT_CATEGORIES.required.map((cat) => renderCategory(cat))}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold text-primary">Recommended</p>
                <div className="space-y-2">
                  {DOCUMENT_CATEGORIES.recommended.map((cat) => renderCategory(cat))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "details" && (
          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="text-lg font-semibold text-primary">Application Summary</h3>
              {field("Family Name", formData.familyName)}
              {field("Given Names", formData.givenNames)}
              {field("Sex", formData.sex)}
              {field("Date of Birth", formData.dateOfBirth)}
              {field("Passport Number", formData.passportNumber)}
              {field("Country of Passport", formData.countryOfPassport)}
              {field("Nationality", formData.nationalityOfHolder)}
              {field("Birth Country", formData.birthCountry)}
              {field("Relationship Status", formData.relationshipStatus)}
              {field("Employment Status", formData.employmentStatus)}
              {field("Visa Stream", formData.visaStream)}
              {field("Email", formData.email)}
              {field("Phone", formData.phone)}
              {application.adminNotes && (
                <div className="border-t pt-3">
                  <p className="text-sm font-medium text-muted-foreground">Admin Notes:</p>
                  <p className="text-sm mt-1">{application.adminNotes}</p>
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                For full form data, click "View Form Data" above to see all 20 steps.
              </p>
            </CardContent>
          </Card>
        )}
      </main>

      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Application Status</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger data-testid="admin-select-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="pending">Pending Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Admin Notes</label>
              <Textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add notes..."
                className="resize-none"
                data-testid="admin-textarea-notes"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStatusDialog(false)} data-testid="admin-button-cancel-status">Cancel</Button>
            <Button
              onClick={() => statusMutation.mutate({ status: newStatus, notes: adminNotes })}
              disabled={statusMutation.isPending}
              data-testid="admin-button-confirm-status"
            >
              {statusMutation.isPending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Application</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to permanently delete this application? This action cannot be undone.
            </p>
            <Card>
              <CardContent className="p-3 space-y-1">
                <p className="text-sm font-medium">{applicantName}</p>
                <p className="text-xs text-muted-foreground">{applicantEmail}</p>
                <p className="text-xs text-muted-foreground">TRN: {application.trn} | Status: {application.status}</p>
              </CardContent>
            </Card>
            <p className="text-sm text-destructive font-medium">
              All associated documents will also be deleted.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} data-testid="button-cancel-delete-detail">Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => deleteAppMutation.mutate()}
              disabled={deleteAppMutation.isPending}
              data-testid="button-confirm-delete-detail"
            >
              {deleteAppMutation.isPending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
              Delete Application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
