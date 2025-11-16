import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { type QRCodeGroup, type QRCode } from "@shared/schema";
import { QRCodeGroupInstance, QRCodeInstance, User } from "@/routes/schema";
import { RetrieveSingleQRCodeGroup, RetrieveQRCodesByGroupId, DeleteSingleQRCode, EditActivationQRCode } from "@/routes";
import { useAuth } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { QRCodeCard } from "@/components/qr-code-card";
import { GroupDialog } from "@/components/group-dialog";
import { ArrowLeft, Plus, ExternalLink, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function GroupDetailPage() {
  const [, params] = useRoute("/groups/:id");
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const groupId = params?.id || "";
  
  const [groupDialogOpen, setGroupDialogOpen] = useState(false);

  const { data: group, isLoading: groupLoading } = useQuery<QRCodeGroupInstance>({
    queryKey: [`/api/groups/${groupId}`],
    enabled: !!groupId,
    queryFn: async () => {
      if(user) {
        const QRCodeGroup : QRCodeGroupInstance = await RetrieveSingleQRCodeGroup(user.id, groupId);
        console.log('retrievedListfromGroup', QRCodeGroup)
        return QRCodeGroup;
      } else {
        logout();
        throw new Error("User data not found");
      }
    }
  });

  const { data: qrCodes = [], isLoading: qrLoading } = useQuery<QRCodeInstance[]>({
    queryKey: [`/api/groups/${groupId}/qrcodes`],
    enabled: !!groupId,
    queryFn: async () => {
      if(user) {
        const QRCodeListByGroup : QRCodeInstance[] = await RetrieveQRCodesByGroupId(user.id, groupId);
        console.log('retrieved List Of Group', QRCodeListByGroup)
        return QRCodeListByGroup;
      } else {
        logout();
        throw new Error("User data not found");
      }
    }
  });

  const isLoading = groupLoading || qrLoading;

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if(user) {
        return await DeleteSingleQRCode(user.id, id);
      } else {
        logout();
        throw new Error("User data not found");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/groups/${groupId}/qrcodes`] });
      queryClient.invalidateQueries({ queryKey: ["/api/qrcodes"] });
      toast({
        title: "Success",
        description: "QR code deleted successfully",
      });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      if(user) {
        return await EditActivationQRCode(user.id, id, { isActive });
      } else {
        logout();
        throw new Error("User data not found");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/groups/${groupId}/qrcodes`] });
      queryClient.invalidateQueries({ queryKey: ["/api/qrcodes"] });
    },
  });

  const handleBack = () => {
    setLocation("/groups");
  };

  const handleCreateQR = () => {
    setLocation("/dashboard");
  };

  const handleEditGroup = () => {
    setGroupDialogOpen(true);
  };

  const handleEditQR = (qr: QRCode) => {
    setLocation("/dashboard");
  };

  const handleDeleteQR = (id: string) => {
    if (confirm("Are you sure you want to delete this QR code?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleToggleActive = (id: string, isActive: boolean) => {
    toggleActiveMutation.mutate({ id, isActive });
  };

  const getUrlVariation = (url: string, baseUrl: string) => {
    if (!url.startsWith(baseUrl)) {
      return { type: "different", variation: url };
    }

    const remaining = url.substring(baseUrl.length);
    
    if (remaining.includes("?")) {
      const [path, params] = remaining.split("?");
      return {
        type: "params",
        path: path || "/",
        params: params,
      };
    }

    return {
      type: "path",
      variation: remaining || "/",
    };
  };

  const groupedQRCodes = qrCodes.map((qr) => ({
    ...qr,
    urlInfo: group ? getUrlVariation(qr.destinationUrl, group.baseUrl) : null,
  }));

  const totalScans = qrCodes.reduce((sum, qr) => sum + qr.scanCount, 0);
  const activeCount = qrCodes.filter((qr) => qr.isActive).length;

  if (isLoading) {
    return (
      <div className="h-full overflow-auto">
        <div className="max-w-7xl mx-auto p-6">
          <div className="text-muted-foreground">Loading group details...</div>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="h-full overflow-auto">
        <div className="max-w-7xl mx-auto p-6">
          <div className="text-destructive">Group not found</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="h-full overflow-auto">
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              data-testid="button-back-to-groups"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold tracking-tight">{group.name}</h1>
              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                <ExternalLink className="h-3 w-3" />
                <span>{group.baseUrl}</span>
              </div>
              {group.description && (
                <p className="text-muted-foreground mt-2">{group.description}</p>
              )}
            </div>
            <Button
              variant="outline"
              onClick={handleEditGroup}
              data-testid="button-edit-group-details"
            >
              <Pencil className="h-4 w-4 mr-2" />
              Edit Group
            </Button>
            <Button onClick={handleCreateQR} data-testid="button-create-qr-in-group">
              <Plus className="h-4 w-4 mr-2" />
              Add QR Code
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total QR Codes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="stat-group-total-qrs">
                  {qrCodes.length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {activeCount} active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Scans</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="stat-group-total-scans">
                  {totalScans.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Across all QR codes
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Scans</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="stat-group-avg-scans">
                  {qrCodes.length > 0 ? Math.round(totalScans / qrCodes.length) : 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Per QR code
                </p>
              </CardContent>
            </Card>
          </div>

          {groupedQRCodes.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Plus className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No QR codes yet</h3>
                <p className="text-sm text-muted-foreground mb-6 text-center max-w-sm">
                  Add QR codes to this group with different paths or URL parameters
                  based on {group.baseUrl}
                </p>
                <Button onClick={handleCreateQR} data-testid="button-create-first-qr-in-group">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First QR Code
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">QR Codes in this Group</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {groupedQRCodes.map((qr) => (
                  <div key={qr.id} className="space-y-2">
                    <QRCodeCard
                      qrCode={qr}
                      onEdit={handleEditQR}
                      onDelete={handleDeleteQR}
                      onToggleActive={handleToggleActive}
                    />
                    {qr.urlInfo && (
                      <div className="px-2 py-1 bg-muted rounded-md text-xs">
                        {qr.urlInfo.type === "path" && (
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">Path</Badge>
                            <code className="text-muted-foreground">{qr.urlInfo.variation}</code>
                          </div>
                        )}
                        {qr.urlInfo.type === "params" && (
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">Path</Badge>
                              <code className="text-muted-foreground">{qr.urlInfo.path}</code>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">Params</Badge>
                              <code className="text-muted-foreground break-all">{qr.urlInfo.params}</code>
                            </div>
                          </div>
                        )}
                        {qr.urlInfo.type === "different" && (
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">Different URL</Badge>
                            <code className="text-muted-foreground truncate">{qr.urlInfo.variation}</code>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <GroupDialog
        open={groupDialogOpen}
        onOpenChange={setGroupDialogOpen}
        group={group}
      />
    </>
  );
}
