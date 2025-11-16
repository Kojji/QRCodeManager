import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { QRCodeInstance } from "@/routes/schema";
import { MoreVertical, Download, Edit2, Trash2, Eye, EyeOff, Copy, ExternalLink, BarChart3 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import QRCodeLib from "qrcode";
import { useToast } from "@/hooks/use-toast";

interface QRCodeCardProps {
  qrCode: QRCodeInstance;
  onEdit: (qrCode: QRCodeInstance) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, isActive: boolean) => void;
}

export function QRCodeCard({ qrCode, onEdit, onDelete, onToggleActive }: QRCodeCardProps) {
  const { toast } = useToast();
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  const redirectUrl = `${window.location.origin}/qr/${qrCode.userId}/${qrCode.shortCode}`;

  useEffect(() => {
    QRCodeLib.toDataURL(redirectUrl, {
      width: 200,
      margin: 1,
      color: {
        dark: qrCode.foregroundColor,
        light: qrCode.backgroundColor,
      },
    }).then(setQrDataUrl);
  }, [redirectUrl, qrCode.foregroundColor, qrCode.backgroundColor]);

  const handleDownload = async () => {
    try {
      const dataUrl = await QRCodeLib.toDataURL(redirectUrl, {
        width: qrCode.size,
        margin: 2,
        color: {
          dark: qrCode.foregroundColor,
          light: qrCode.backgroundColor,
        },
      });

      const link = document.createElement("a");
      link.download = `${qrCode.title.replace(/[^a-z0-9]/gi, "_")}_qrcode.png`;
      link.href = dataUrl;
      link.click();

      toast({
        title: "QR code downloaded",
        description: "Your QR code has been saved successfully",
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Failed to download QR code",
        variant: "destructive",
      });
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(redirectUrl);
    toast({
      title: "Link copied",
      description: "QR code link copied to clipboard",
    });
  };

  return (
    <Card className="overflow-hidden hover-elevate" data-testid={`card-qrcode-${qrCode.id}`}>
      <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0 p-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium truncate" data-testid="text-qr-title">
            {qrCode.title}
          </h3>
          <p className="text-xs text-muted-foreground truncate mt-1">
            {qrCode.destinationUrl}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              data-testid="button-qr-menu"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(qrCode)} data-testid="button-edit-qr">
              <Edit2 className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDownload} data-testid="button-download-qr">
              <Download className="h-4 w-4 mr-2" />
              Download
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleCopyLink} data-testid="button-copy-link">
              <Copy className="h-4 w-4 mr-2" />
              Copy link
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => window.open(redirectUrl, "_blank")}
              data-testid="button-open-qr"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open link
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onToggleActive(qrCode.id, !qrCode.isActive)}
              data-testid="button-toggle-active"
            >
              {qrCode.isActive ? (
                <>
                  <EyeOff className="h-4 w-4 mr-2" />
                  Deactivate
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  Activate
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(qrCode.id)}
              className="text-destructive"
              data-testid="button-delete-qr"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardContent className="p-4 pt-0">
        <div className="bg-white dark:bg-card p-4 rounded-md border border-border flex items-center justify-center">
          {qrDataUrl && (
            <img
              src={qrDataUrl}
              alt={qrCode.title}
              className="w-full max-w-[160px] h-auto"
            />
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Badge variant={qrCode.isActive ? "default" : "secondary"} data-testid="badge-qr-status">
            {qrCode.isActive ? "Active" : "Inactive"}
          </Badge>
          <span className="text-xs text-muted-foreground" data-testid="text-scan-count">
            {qrCode.scanCount} scans
          </span>
        </div>
        <span className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(qrCode.createdAt), { addSuffix: true })}
        </span>
      </CardFooter>

    </Card>
  );
}
