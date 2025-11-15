import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { QrCode, ArrowRight } from "lucide-react";

export default function ChangePasswordPage() {
  const [, setLocation] = useLocation();
  const { changePassword } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Missing fields",
        description: "Please fill in the email address",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await changePassword(email);
      toast({
        title: "Recovery link sent",
        description: "Check the email address provided",
      });
      setLocation("/login");
    } catch (error) {
      toast({
        title: "Request failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary rounded-md">
              <QrCode className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-semibold tracking-tight">QRFlow</h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Start creating dynamic QR codes today
          </p>
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-semibold">Change Password</CardTitle>
            <CardDescription>
              Enter your email address to receive a recovery link.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  data-testid="input-email"
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
                data-testid="button-signup"
              >
                {isLoading ? "Processing..." : "Submit"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
            <div className="text-sm text-center text-muted-foreground">
                <button
                  type="button"
                  onClick={() => setLocation("/login")}
                  className="text-primary hover:underline font-medium"
                  data-testid="link-change-password"
                >
                  Return to the login page
                </button>
              </div>
          </form>
        </Card>

        <p className="text-xs text-center text-muted-foreground px-8">
          This is an invite-only application, not open for public sign in.
        </p>
      </div>
    </div>
  );
}
