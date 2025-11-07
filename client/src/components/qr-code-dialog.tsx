import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { type QRCode, type QRCodeGroup } from "@shared/schema";
import QRCodeLib from "qrcode";

const formSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title too long"),
  destinationUrl: z.string().url("Must be a valid URL"),
  urlParameters: z.string().optional(),
  foregroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format"),
  backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format"),
  size: z.number().min(128).max(1024),
  groupId: z.string().nullable().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface QRCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: FormValues) => void;
  editingQRCode?: QRCode | null;
  isPending: boolean;
}

export function QRCodeDialog({ open, onOpenChange, onSave, editingQRCode, isPending }: QRCodeDialogProps) {
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const { data: groups = [] } = useQuery<QRCodeGroup[]>({
    queryKey: ["/api/groups"],
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      destinationUrl: "",
      urlParameters: "",
      foregroundColor: "#000000",
      backgroundColor: "#ffffff",
      size: 256,
      groupId: null,
    },
  });

  useEffect(() => {
    if (editingQRCode) {
      // Extract URL parameters from destination URL
      const url = new URL(editingQRCode.destinationUrl);
      const params = url.search.substring(1); // Remove the '?'
      const baseUrl = url.origin + url.pathname;
      
      form.reset({
        title: editingQRCode.title,
        destinationUrl: baseUrl,
        urlParameters: params || "",
        foregroundColor: editingQRCode.foregroundColor,
        backgroundColor: editingQRCode.backgroundColor,
        size: editingQRCode.size,
        groupId: editingQRCode.groupId || null,
      });
    } else {
      form.reset({
        title: "",
        destinationUrl: "",
        urlParameters: "",
        foregroundColor: "#000000",
        backgroundColor: "#ffffff",
        size: 256,
        groupId: null,
      });
    }
  }, [editingQRCode, form]);

  const watchedUrl = form.watch("destinationUrl");
  const watchedParams = form.watch("urlParameters");
  const watchedFg = form.watch("foregroundColor");
  const watchedBg = form.watch("backgroundColor");

  useEffect(() => {
    if (watchedUrl && watchedUrl.startsWith("http")) {
      // Combine base URL with parameters for preview
      const fullUrl = watchedParams 
        ? `${watchedUrl}?${watchedParams}`
        : watchedUrl;
        
      QRCodeLib.toDataURL(fullUrl, {
        width: 200,
        margin: 2,
        color: {
          dark: watchedFg,
          light: watchedBg,
        },
      }).then(setPreviewUrl).catch(() => {});
    }
  }, [watchedUrl, watchedParams, watchedFg, watchedBg]);

  const handleSubmit = (data: FormValues) => {
    // Combine base URL with parameters
    const finalUrl = data.urlParameters 
      ? `${data.destinationUrl}?${data.urlParameters}`
      : data.destinationUrl;
    
    // Remove urlParameters from the data and use combined URL
    const { urlParameters, ...submitData } = data;
    onSave({
      ...submitData,
      destinationUrl: finalUrl,
    });
  };

  const handleUrlBlur = () => {
    const currentUrl = form.getValues("destinationUrl");
    if (currentUrl && !currentUrl.startsWith("http://") && !currentUrl.startsWith("https://")) {
      form.setValue("destinationUrl", `https://${currentUrl}`, {
        shouldValidate: true,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingQRCode ? "Edit QR Code" : "Create New QR Code"}
          </DialogTitle>
          <DialogDescription>
            {editingQRCode
              ? "Update your QR code details. The QR code will be automatically regenerated."
              : "Enter the details for your new QR code. You can customize colors and size."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="My QR Code"
                        {...field}
                        data-testid="input-qr-title"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="destinationUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Destination URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="example.com"
                        {...field}
                        onBlur={handleUrlBlur}
                        data-testid="input-qr-url"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="urlParameters"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL Parameters (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="utm_source=email&utm_campaign=summer"
                        {...field}
                        data-testid="input-qr-params"
                      />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">
                      Add query parameters without the "?" (e.g., param1=value1&param2=value2)
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="groupId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Group (Optional)</FormLabel>
                    <Select
                      value={field.value || "none"}
                      onValueChange={(value) => field.onChange(value === "none" ? null : value)}
                    >
                      <FormControl>
                        <SelectTrigger data-testid="select-qr-group">
                          <SelectValue placeholder="No group" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">No group</SelectItem>
                        {groups.map((group) => (
                          <SelectItem key={group.id} value={group.id}>
                            {group.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="foregroundColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Foreground Color</FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            {...field}
                            className="h-10 w-16 p-1"
                            data-testid="input-qr-fg-color"
                          />
                          <Input
                            type="text"
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="#000000"
                            className="flex-1"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="backgroundColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Background Color</FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            {...field}
                            className="h-10 w-16 p-1"
                            data-testid="input-qr-bg-color"
                          />
                          <Input
                            type="text"
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="#ffffff"
                            className="flex-1"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Size (pixels)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={128}
                        max={1024}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                        data-testid="input-qr-size"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isPending}
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending} data-testid="button-save-qr">
                  {isPending ? "Saving..." : editingQRCode ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </Form>

          <div className="flex flex-col items-center justify-center">
            <div className="w-full max-w-sm">
              <p className="text-sm font-medium mb-4 text-center">Live Preview</p>
              <div className="bg-white dark:bg-card p-6 rounded-md border border-border aspect-square flex items-center justify-center">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="QR Code Preview"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-sm text-muted-foreground text-center">
                    Enter a valid URL to see preview
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
