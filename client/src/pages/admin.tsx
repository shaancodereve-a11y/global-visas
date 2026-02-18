import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient, getQueryFn } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import type { Application, User } from "@shared/schema";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LogOut, FileText, Clock, CheckCircle2, XCircle, Users, LayoutDashboard, Loader2, Download, UserPlus, Shield, Trash2 } from "lucide-react";
import logoPath from "@assets/GLOBAL-VISA-logo_1771013259487.webp";

type ApplicationWithUser = Application & { user?: User };

type Stats = {
  total: number;
  draft: number;
  submitted: number;
  pending: number;
  approved: number;
  rejected: number;
};

type AdminUser = Omit<User, "password">;

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

export default function AdminPage() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedApp, setSelectedApp] = useState<ApplicationWithUser | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [activeTab, setActiveTab] = useState<"applications" | "admins">("applications");
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [newAdminForm, setNewAdminForm] = useState({ email: "", firstName: "", lastName: "", password: "" });
  const [deleteApp, setDeleteApp] = useState<ApplicationWithUser | null>(null);

  const { data: stats, isLoading: statsLoading } = useQuery<Stats>({
    queryKey: ["/api/admin/stats"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const { data: applications, isLoading: appsLoading } = useQuery<ApplicationWithUser[]>({
    queryKey: ["/api/admin/applications"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const { data: admins, isLoading: adminsLoading } = useQuery<AdminUser[]>({
    queryKey: ["/api/admin/admins"],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: activeTab === "admins",
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: string; notes: string }) => {
      const res = await apiRequest("PATCH", `/api/admin/applications/${id}/status`, { status, adminNotes: notes });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/applications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      setSelectedApp(null);
      toast({ title: "Status updated", description: "The application status has been updated." });
    },
    onError: () => {
      toast({ title: "Error", description: "Could not update status.", variant: "destructive" });
    },
  });

  const addAdminMutation = useMutation({
    mutationFn: async (data: { email: string; firstName: string; lastName: string; password: string }) => {
      const res = await apiRequest("POST", "/api/admin/admins", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/admins"] });
      setShowAddAdmin(false);
      setNewAdminForm({ email: "", firstName: "", lastName: "", password: "" });
      toast({ title: "Admin added", description: "New admin account has been created." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message || "Could not add admin.", variant: "destructive" });
    },
  });

  const removeAdminMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/admin/admins/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/admins"] });
      toast({ title: "Admin removed", description: "Admin access has been revoked." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message || "Could not remove admin.", variant: "destructive" });
    },
  });

  const deleteAppMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/applications/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/applications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      setDeleteApp(null);
      toast({ title: "Application deleted", description: "The application and all its documents have been permanently deleted." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message || "Could not delete application.", variant: "destructive" });
    },
  });

  const filteredApps = applications?.filter(
    (app) => filterStatus === "all" || app.status === filterStatus
  );

  const openStatusDialog = (app: ApplicationWithUser) => {
    setSelectedApp(app);
    setNewStatus(app.status);
    setAdminNotes(app.adminNotes || "");
  };

  const handleUpdateStatus = () => {
    if (!selectedApp) return;
    statusMutation.mutate({ id: selectedApp.id, status: newStatus, notes: adminNotes });
  };

  const handleExportCsv = () => {
    window.open("/api/admin/export", "_blank");
  };

  const handleAddAdmin = () => {
    if (!newAdminForm.email || !newAdminForm.firstName || !newAdminForm.lastName || !newAdminForm.password) {
      toast({ title: "Error", description: "All fields are required.", variant: "destructive" });
      return;
    }
    addAdminMutation.mutate(newAdminForm);
  };

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Access denied. Admin privileges required.</p>
            <Button className="mt-4" onClick={() => setLocation("/dashboard")} data-testid="button-back">Back to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <img src={logoPath} alt="Global Visas" className="h-10 object-contain" data-testid="img-logo" />
            <Badge variant="secondary">Admin</Badge>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm text-muted-foreground">{user?.email}</span>
            <Button variant="ghost" size="sm" onClick={logout} data-testid="button-logout">
              <LogOut className="h-4 w-4 mr-1" /> Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
          <h1 className="text-2xl font-semibold" data-testid="text-admin-title">
            <LayoutDashboard className="inline h-6 w-6 mr-2" />
            Admin Dashboard
          </h1>
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant={activeTab === "applications" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("applications")}
              data-testid="button-tab-applications"
            >
              <FileText className="h-4 w-4 mr-1" /> Applications
            </Button>
            <Button
              variant={activeTab === "admins" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("admins")}
              data-testid="button-tab-admins"
            >
              <Shield className="h-4 w-4 mr-1" /> Manage Admins
            </Button>
          </div>
        </div>

        {activeTab === "applications" && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
              {statsLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <Card key={i}><CardContent className="p-4"><Skeleton className="h-12" /></CardContent></Card>
                ))
              ) : (
                <>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-2xl font-bold" data-testid="stat-total">{stats?.total || 0}</p>
                      <p className="text-xs text-muted-foreground">Total</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-2xl font-bold text-muted-foreground" data-testid="stat-draft">{stats?.draft || 0}</p>
                      <p className="text-xs text-muted-foreground">Draft</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-2xl font-bold text-amber-500" data-testid="stat-pending">{stats?.pending || 0}</p>
                      <p className="text-xs text-muted-foreground">Pending</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-2xl font-bold text-emerald-600" data-testid="stat-approved">{stats?.approved || 0}</p>
                      <p className="text-xs text-muted-foreground">Approved</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-2xl font-bold text-destructive" data-testid="stat-rejected">{stats?.rejected || 0}</p>
                      <p className="text-xs text-muted-foreground">Rejected</p>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>

            <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
              <h2 className="text-lg font-semibold">All Applications</h2>
              <div className="flex items-center gap-2 flex-wrap">
                <Button variant="outline" size="sm" onClick={handleExportCsv} data-testid="button-export-csv">
                  <Download className="h-4 w-4 mr-1" /> Export CSV
                </Button>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-40" data-testid="select-filter-status">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {appsLoading ? (
              <Card><CardContent className="p-4"><Skeleton className="h-64 w-full" /></CardContent></Card>
            ) : filteredApps && filteredApps.length > 0 ? (
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Applicant</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Step</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Submitted</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredApps.map((app) => (
                          <TableRow key={app.id} data-testid={`row-application-${app.id}`}>
                            <TableCell className="font-medium" data-testid={`text-applicant-${app.id}`}>
                              {app.user ? `${app.user.firstName} ${app.user.lastName}` : "Unknown"}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {app.user?.email || "N/A"}
                            </TableCell>
                            <TableCell>{app.currentStep}/20</TableCell>
                            <TableCell>{getStatusBadge(app.status)}</TableCell>
                            <TableCell className="text-sm">
                              {app.submittedAt ? new Date(app.submittedAt).toLocaleDateString() : "-"}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1 flex-wrap">
                                <Button variant="outline" size="sm" onClick={() => setLocation(`/admin/application/${app.id}`)} data-testid={`button-view-${app.id}`}>
                                  View
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => openStatusDialog(app)} data-testid={`button-manage-${app.id}`}>
                                  Manage
                                </Button>
                                <Button size="sm" className="bg-emerald-600 text-white border-emerald-600" data-testid={`button-biometrics-${app.id}`} onClick={() => toast({ title: "Biometrics", description: `Biometrics action for application #${app.id} - feature coming soon.` })}>
                                  Biometrics
                                </Button>
                                <Button size="sm" className="bg-amber-500 text-white border-amber-500" data-testid={`button-request-info-${app.id}`} onClick={() => toast({ title: "Request Info", description: `Request further information for application #${app.id} - feature coming soon.` })}>
                                  Request Info
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => setDeleteApp(app)} data-testid={`button-delete-${app.id}`}>
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No applications found.</p>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {activeTab === "admins" && (
          <>
            <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
              <h2 className="text-lg font-semibold">Admin Accounts</h2>
              <Button size="sm" onClick={() => setShowAddAdmin(true)} data-testid="button-add-admin">
                <UserPlus className="h-4 w-4 mr-1" /> Add Admin
              </Button>
            </div>

            {adminsLoading ? (
              <Card><CardContent className="p-4"><Skeleton className="h-32 w-full" /></CardContent></Card>
            ) : admins && admins.length > 0 ? (
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {admins.map((admin) => (
                          <TableRow key={admin.id} data-testid={`row-admin-${admin.id}`}>
                            <TableCell className="font-medium">
                              {admin.firstName} {admin.lastName}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {admin.email}
                            </TableCell>
                            <TableCell className="text-sm">
                              {new Date(admin.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              {admin.id === user?.id ? (
                                <Badge variant="secondary">You</Badge>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeAdminMutation.mutate(admin.id)}
                                  disabled={removeAdminMutation.isPending}
                                  data-testid={`button-remove-admin-${admin.id}`}
                                >
                                  <Trash2 className="h-4 w-4 mr-1" /> Remove
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No admin accounts found.</p>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </main>

      <Dialog open={!!selectedApp} onOpenChange={(open) => !open && setSelectedApp(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Application</DialogTitle>
          </DialogHeader>
          {selectedApp && (
            <div className="space-y-4">
              <div className="text-sm space-y-1">
                <p><strong>Applicant:</strong> {selectedApp.user ? `${selectedApp.user.firstName} ${selectedApp.user.lastName}` : "Unknown"}</p>
                <p><strong>Email:</strong> {selectedApp.user?.email}</p>
                <p><strong>Progress:</strong> Step {selectedApp.currentStep}/20</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Update Status</label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger data-testid="select-new-status">
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
                  placeholder="Add notes for the applicant..."
                  className="resize-none"
                  data-testid="textarea-admin-notes"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedApp(null)} data-testid="button-cancel">Cancel</Button>
            <Button onClick={handleUpdateStatus} disabled={statusMutation.isPending} data-testid="button-update-status">
              {statusMutation.isPending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showAddAdmin} onOpenChange={setShowAddAdmin}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Admin</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-email">Email</Label>
              <Input
                id="admin-email"
                type="email"
                placeholder="admin@example.com"
                value={newAdminForm.email}
                onChange={(e) => setNewAdminForm({ ...newAdminForm, email: e.target.value })}
                data-testid="input-admin-email"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="admin-first-name">First Name</Label>
                <Input
                  id="admin-first-name"
                  placeholder="First name"
                  value={newAdminForm.firstName}
                  onChange={(e) => setNewAdminForm({ ...newAdminForm, firstName: e.target.value })}
                  data-testid="input-admin-first-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-last-name">Last Name</Label>
                <Input
                  id="admin-last-name"
                  placeholder="Last name"
                  value={newAdminForm.lastName}
                  onChange={(e) => setNewAdminForm({ ...newAdminForm, lastName: e.target.value })}
                  data-testid="input-admin-last-name"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-password">Password</Label>
              <Input
                id="admin-password"
                type="password"
                placeholder="Set a secure password"
                value={newAdminForm.password}
                onChange={(e) => setNewAdminForm({ ...newAdminForm, password: e.target.value })}
                data-testid="input-admin-password"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              If the email already belongs to an existing user, they will be promoted to admin.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddAdmin(false)} data-testid="button-cancel-add-admin">Cancel</Button>
            <Button onClick={handleAddAdmin} disabled={addAdminMutation.isPending} data-testid="button-confirm-add-admin">
              {addAdminMutation.isPending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
              Add Admin
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteApp} onOpenChange={(open) => !open && setDeleteApp(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Application</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to permanently delete this application? This action cannot be undone.
            </p>
            {deleteApp && (
              <Card>
                <CardContent className="p-3 space-y-1">
                  <p className="text-sm font-medium">
                    {deleteApp.user ? `${deleteApp.user.firstName} ${deleteApp.user.lastName}` : "Unknown"}
                  </p>
                  <p className="text-xs text-muted-foreground">{deleteApp.user?.email || "N/A"}</p>
                  <p className="text-xs text-muted-foreground">Status: {deleteApp.status} | Step: {deleteApp.currentStep}/22</p>
                </CardContent>
              </Card>
            )}
            <p className="text-sm text-destructive font-medium">
              All associated documents will also be deleted.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteApp(null)} data-testid="button-cancel-delete">Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => deleteApp && deleteAppMutation.mutate(deleteApp.id)}
              disabled={deleteAppMutation.isPending}
              data-testid="button-confirm-delete"
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
