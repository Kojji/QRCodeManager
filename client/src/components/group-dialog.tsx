import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/lib/auth";
import { QRCodeGroupInstance } from "@/routes/schema";
import { SaveQRCodeGroup, EditQRCodeGroup } from "@/routes";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface GroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: QRCodeGroupInstance | null;
}

const formSchema = z.object({
  name: z.string().min(1, "Name is required").max(80, "Title too long"),
  baseUrl: z.string().optional(),
  description: z.string().max(250, "Description too long").default("")
});


export function GroupDialog({ open, onOpenChange, group }: GroupDialogProps) {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const isEditing = !!group;

  const form = useForm<Partial<QRCodeGroupInstance>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      baseUrl: "",
      description: "",
    },
  });

  useEffect(() => {
    if (group) {
      form.reset({
        name: group.name,
        baseUrl: group.baseUrl,
        description: group.description || "",
      });
    } else {
      form.reset({
        name: "",
        baseUrl: "",
        description: "",
      });
    }
  }, [group, form]);

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      if(user) {
        return await SaveQRCodeGroup(user.id, data);
      } else {
        logout();
        throw new Error("User data not found");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
      queryClient.invalidateQueries({ queryKey: ["/api/groups/all"] });
      toast({
        title: "Success",
        description: "Group created successfully",
      });
      form.reset();
      onOpenChange(false);
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create group",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<QRCodeGroupInstance>) => {
      if(group && user) {
        return await EditQRCodeGroup(user.id, group.id, data);
      } else if (!group) {
        throw new Error("Id missing for group data update!");
      } else {
        logout();
        throw new Error("User data not found");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
      queryClient.invalidateQueries({ queryKey: ["/api/groups", group?.id] });
      queryClient.invalidateQueries({ queryKey: ["/api/groups/all"] });
      toast({
        title: "Success",
        description: "Group updated successfully",
      });
      form.reset();
      onOpenChange(false);
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update group",
      });
    },
  });

  const onSubmit = (data: Partial<QRCodeGroupInstance>) => {
    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const handleBaseUrlBlur = () => {
    const currentUrl = form.getValues("baseUrl");
    if (currentUrl && !currentUrl.startsWith("http://") && !currentUrl.startsWith("https://")) {
      form.setValue("baseUrl", `https://${currentUrl}`, {
        shouldValidate: true,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Group" : "Create New Group"}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Update the details for your QR code group."
              : "Create a group to organize QR codes with URL variations."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Group Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g., Campaign Tracking, Store Locations"
                      data-testid="input-group-name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="baseUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Base URL</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="example.com"
                      type="url"
                      onBlur={handleBaseUrlBlur}
                      data-testid="input-group-base-url"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      value={field.value || ""}
                      placeholder="Describe the purpose of this group..."
                      rows={3}
                      data-testid="input-group-description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                data-testid="button-cancel-group"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                data-testid="button-save-group"
              >
                {createMutation.isPending || updateMutation.isPending
                  ? "Saving..."
                  : isEditing
                  ? "Update"
                  : "Create"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
