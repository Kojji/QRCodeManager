import { type QRCode } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Calendar, BarChart3, Activity } from "lucide-react";
import { differenceInMonths, startOfMonth, endOfMonth } from "date-fns";

interface QRAnalyticsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  qrCode: QRCode;
}

export function QRAnalyticsDialog({ open, onOpenChange, qrCode }: QRAnalyticsDialogProps) {
  const scanHistory = JSON.parse(qrCode.scanHistory || "[]") as string[];
  const createdDate = new Date(qrCode.createdAt);
  const now = new Date();
  
  // Calculate months since creation (minimum 1 to avoid division by zero)
  const monthsSinceCreation = Math.max(differenceInMonths(now, createdDate), 1);
  
  // Calculate scans for current month
  const currentMonthStart = startOfMonth(now);
  const currentMonthEnd = endOfMonth(now);
  const currentMonthScans = scanHistory.filter((timestamp) => {
    const date = new Date(timestamp);
    return date >= currentMonthStart && date <= currentMonthEnd;
  }).length;
  
  // Calculate average scans per month
  const avgScansPerMonth = qrCode.scanCount / monthsSinceCreation;
  
  // Calculate percentage change (current month vs average)
  const percentageChange = avgScansPerMonth > 0
    ? ((currentMonthScans - avgScansPerMonth) / avgScansPerMonth) * 100
    : 0;
  
  const isIncrease = percentageChange > 0;
  const isDecrease = percentageChange < 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" data-testid="dialog-analytics">
        <DialogHeader>
          <DialogTitle>QR Code Analytics</DialogTitle>
          <DialogDescription>
            Scan statistics for "{qrCode.title}"
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Scans
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-scans">
                {qrCode.scanCount}
              </div>
              <p className="text-xs text-muted-foreground">
                Since creation
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Current Month
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-current-month-scans">
                {currentMonthScans}
              </div>
              <p className="text-xs text-muted-foreground">
                Scans this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Average per Month
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-avg-scans">
                {avgScansPerMonth.toFixed(1)}
              </div>
              <p className="text-xs text-muted-foreground">
                Over {monthsSinceCreation} month{monthsSinceCreation !== 1 ? "s" : ""}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Trend
              </CardTitle>
              {isIncrease && <TrendingUp className="h-4 w-4 text-green-600" />}
              {isDecrease && <TrendingDown className="h-4 w-4 text-red-600" />}
              {!isIncrease && !isDecrease && <Activity className="h-4 w-4 text-muted-foreground" />}
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${
                  isIncrease
                    ? "text-green-600"
                    : isDecrease
                    ? "text-red-600"
                    : ""
                }`}
                data-testid="text-percentage-change"
              >
                {isIncrease && "+"}
                {percentageChange.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                vs. average
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created</span>
                <span className="font-medium">
                  {createdDate.toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Scanned</span>
                <span className="font-medium">
                  {qrCode.lastScanned
                    ? new Date(qrCode.lastScanned).toLocaleString()
                    : "Never"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className={`font-medium ${qrCode.isActive ? "text-green-600" : "text-muted-foreground"}`}>
                  {qrCode.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
