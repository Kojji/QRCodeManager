import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import QRCode from "qrcode";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

const staticQRSchema = z.object({
  url: z.string().url("Please enter a valid URL"),
  fgColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format"),
  bgColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format"),
  size: z.number().min(128).max(1024),
});

type StaticQRFormData = z.infer<typeof staticQRSchema>;

interface StaticQRDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StaticQRDialog({ open, onOpenChange }: StaticQRDialogProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  const form = useForm<StaticQRFormData>({
    resolver: zodResolver(staticQRSchema),
    defaultValues: {
      url: "",
      fgColor: "#000000",
      bgColor: "#FFFFFF",
      size: 512,
    },
  });

  const formValues = form.watch();

  useEffect(() => {
    const generateQR = async () => {
      if (!canvasRef.current) return;
      
      const url = formValues.url;
      if (!url) {
        const ctx = canvasRef.current.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
        setQrDataUrl("");
        return;
      }

      try {
        const fullUrl = url.startsWith("http://") || url.startsWith("https://") 
          ? url 
          : `https://${url}`;

        await QRCode.toCanvas(canvasRef.current, fullUrl, {
          width: formValues.size,
          margin: 2,
          color: {
            dark: formValues.fgColor,
            light: formValues.bgColor,
          },
        });

        const dataUrl = canvasRef.current.toDataURL("image/png");
        setQrDataUrl(dataUrl);
      } catch (error) {
        console.error("Error generating QR code:", error);
      }
    };

    generateQR();
  }, [formValues]);

  useEffect(() => {
    if (!open) {
      form.reset();
      setQrDataUrl("");
    }
  }, [open, form]);

  const handleDownload = () => {
    if (!qrDataUrl) return;

    const link = document.createElement("a");
    const fileName = `qr-${formValues.url.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.png`;
    link.download = fileName;
    link.href = qrDataUrl;
    link.click();
  };

  const handleUrlBlur = () => {
    const currentUrl = form.getValues("url");
    if (currentUrl && !currentUrl.startsWith("http://") && !currentUrl.startsWith("https://")) {
      form.setValue("url", `https://${currentUrl}`, {
        shouldValidate: true,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Static QR Code</DialogTitle>
          <DialogDescription>
            Generate a QR code for any URL. This QR code is static and won't be saved to the database.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <div className="grid gap-4 py-4">
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="example.com"
                      type="url"
                      onBlur={handleUrlBlur}
                      data-testid="input-static-url"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="fgColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Foreground Color</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="color"
                        data-testid="input-static-fg-color"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bgColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Background Color</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="color"
                        data-testid="input-static-bg-color"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Size (px)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min={128}
                        max={1024}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                        data-testid="input-static-size"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-center p-6 bg-muted rounded-md">
              <canvas
                ref={canvasRef}
                className="max-w-full h-auto"
                data-testid="canvas-static-qr-preview"
              />
            </div>
          </div>
        </Form>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            data-testid="button-cancel"
          >
            Cancel
          </Button>
          <Button
            onClick={handleDownload}
            disabled={!qrDataUrl}
            data-testid="button-download-static"
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
