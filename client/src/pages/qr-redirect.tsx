import { useEffect } from "react";
import { useRoute } from "wouter";
import { Loader2 } from "lucide-react";

export default function QRRedirectPage() {
  const [match, params] = useRoute("/qr/:shortCode");

  useEffect(() => {
    if (match && params?.shortCode) {
      window.location.href = `/api/qr/${params.shortCode}`;
    }
  }, [match, params]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <p className="text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  );
}
