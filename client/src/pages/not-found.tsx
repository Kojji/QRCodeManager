import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { QrCode, Home } from "lucide-react";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="flex justify-center">
          <div className="p-4 bg-muted rounded-full">
            <QrCode className="h-16 w-16 text-muted-foreground" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-semibold">404</h1>
          <p className="text-xl font-medium">Page not found</p>
          <p className="text-muted-foreground">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        <Button onClick={() => setLocation("/dashboard")} data-testid="button-home">
          <Home className="h-4 w-4 mr-2" />
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
}
