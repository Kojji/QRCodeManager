import { useEffect } from "react";
import { useRoute } from "wouter";
import { Loader2 } from "lucide-react";
import { RetrieveQRCodeRedirect } from "@/routes";

export default function QRRedirectPage() {
  const [match, params] = useRoute("/qr/:userId/:shortCode");

  useEffect(() => {
    if(match && params?.shortCode && params?.userId) {
      RetrieveQRCodeRedirect(params.userId, params.shortCode).then((redirectURL)=>{
        window.location.href = redirectURL;
      }).catch(()=>{
        throw new Error("QR Code data not found");
      })
    } else {
      throw new Error("Error reading QR Code");
    }
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <p className="text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  );
}
