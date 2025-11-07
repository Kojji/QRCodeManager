import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { type QRCode } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { QRCodeCard } from "@/components/qr-code-card";
import { QRCodeDialog } from "@/components/qr-code-dialog";
import { StatsCard } from "@/components/stats-card";
import { Plus, QrCode as QrCodeIcon, BarChart3, Eye, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingQRCode, setEditingQRCode] = useState<QRCode | null>(null);

  const { data: qrCodes, isLoading } = useQuery<QRCode[]>({
    queryKey: ["/api/qrcodes"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/qrcodes", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/qrcodes"] });
      setDialogOpen(false);
      setEditingQRCode(null);
      toast({
        title: "QR code created",
        description: "Your QR code has been created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Failed to create QR code",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return await apiRequest("PATCH", `/api/qrcodes/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/qrcodes"] });
      setDialogOpen(false);
      setEditingQRCode(null);
      toast({
        title: "QR code updated",
        description: "Your QR code has been updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Failed to update QR code",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/qrcodes/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/qrcodes"] });
      toast({
        title: "QR code deleted",
        description: "Your QR code has been deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Failed to delete QR code",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      return await apiRequest("PATCH", `/api/qrcodes/${id}`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/qrcodes"] });
    },
  });

  const handleSaveQRCode = (data: any) => {
    if (editingQRCode) {
      updateMutation.mutate({ id: editingQRCode.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEditQRCode = (qrCode: QRCode) => {
    setEditingQRCode(qrCode);
    setDialogOpen(true);
  };

  const handleCreateNew = () => {
    setEditingQRCode(null);
    setDialogOpen(true);
  };

  const totalScans = qrCodes?.reduce((sum, qr) => sum + qr.scanCount, 0) || 0;
  const activeQRCodes = qrCodes?.filter((qr) => qr.isActive).length || 0;
  const totalQRCodes = qrCodes?.length || 0;

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-semibold">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Manage your dynamic QR codes
            </p>
          </div>
          <Button onClick={handleCreateNew} data-testid="button-create-qr">
            <Plus className="h-4 w-4 mr-2" />
            Create QR Code
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total QR Codes"
            value={totalQRCodes}
            icon={QrCodeIcon}
            description="All created codes"
          />
          <StatsCard
            title="Total Scans"
            value={totalScans}
            icon={BarChart3}
            description="Across all codes"
          />
          <StatsCard
            title="Active Codes"
            value={activeQRCodes}
            icon={Eye}
            description="Currently active"
          />
          <StatsCard
            title="Avg. Scans"
            value={totalQRCodes > 0 ? Math.round(totalScans / totalQRCodes) : 0}
            icon={TrendingUp}
            description="Per QR code"
          />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Your QR Codes</h2>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardHeader className="p-4">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-full mt-2" />
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <Skeleton className="aspect-square w-full rounded-md" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : qrCodes && qrCodes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {qrCodes.map((qrCode) => (
                <QRCodeCard
                  key={qrCode.id}
                  qrCode={qrCode}
                  onEdit={handleEditQRCode}
                  onDelete={(id) => deleteMutation.mutate(id)}
                  onToggleActive={(id, isActive) =>
                    toggleActiveMutation.mutate({ id, isActive })
                  }
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-card rounded-md border border-border">
              <QrCodeIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No QR codes yet</h3>
              <p className="text-muted-foreground mb-4 max-w-sm mx-auto">
                Get started by creating your first dynamic QR code
              </p>
              <Button onClick={handleCreateNew} data-testid="button-create-first-qr">
                <Plus className="h-4 w-4 mr-2" />
                Create your first QR code
              </Button>
            </div>
          )}
        </div>
      </div>

      <QRCodeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSaveQRCode}
        editingQRCode={editingQRCode}
        isPending={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}
