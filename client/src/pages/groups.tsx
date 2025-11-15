import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { RetrieveQRCodeGroups, DeleteSingleQRCodeGroup } from "@/routes";
import { QRCodeGroupInstance } from "@/routes/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { GroupDialog } from "@/components/group-dialog";
import { Plus, FolderKanban, ExternalLink, MoreVertical, Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

export default function GroupsPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<QRCodeGroupInstance | null>(null);

  const { data: groups = [], isLoading } = useQuery<QRCodeGroupInstance[]>({
    queryKey: ["/api/groups"],
    queryFn: async () => {
      const QRCodeGroupList : QRCodeGroupInstance[] = await RetrieveQRCodeGroups();
      console.log('retrievedList', QRCodeGroupList)
      return QRCodeGroupList;
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await DeleteSingleQRCodeGroup(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
      toast({
        title: "Success",
        description: "Group deleted successfully",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete group",
      });
    },
  });

  const handleCreate = () => {
    setEditingGroup(null);
    setDialogOpen(true);
  };

  const handleEdit = (group: QRCodeGroupInstance) => {
    setEditingGroup(group);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this group? QR codes will not be deleted.")) {
      deleteMutation.mutate(id);
    }
  };

  const handleViewGroup = (id: string) => {
    setLocation(`/groups/${id}`);
  };

  if (isLoading) {
    return (
      <div className="h-full overflow-auto">
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          <div className="text-muted-foreground">Loading groups...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="h-full overflow-auto">
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">QR Code Groups</h1>
              <p className="text-muted-foreground mt-1">
                Organize QR codes with URL variations in groups
              </p>
            </div>
            <Button onClick={handleCreate} data-testid="button-create-group">
              <Plus className="h-4 w-4 mr-2" />
              Create Group
            </Button>
          </div>

          {groups.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FolderKanban className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No groups yet</h3>
                <p className="text-sm text-muted-foreground mb-6 text-center max-w-sm">
                  Create your first group to organize QR codes that share a base URL
                  but have different paths or parameters.
                </p>
                <Button onClick={handleCreate} data-testid="button-create-first-group">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Group
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {groups.map((group) => (
                <Card
                  key={group.id}
                  className="hover-elevate cursor-pointer"
                  onClick={() => handleViewGroup(group.id)}
                  data-testid={`card-group-${group.id}`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg truncate">
                          {group.name}
                        </CardTitle>
                        <CardDescription className="mt-1 flex items-center gap-1 text-xs truncate">
                          <ExternalLink className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{group.baseUrl}</span>
                        </CardDescription>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="icon"
                            data-testid={`button-group-menu-${group.id}`}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(group);
                            }}
                            data-testid={`button-edit-group-${group.id}`}
                          >
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(group.id);
                            }}
                            className="text-destructive"
                            data-testid={`button-delete-group-${group.id}`}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {group.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {group.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="secondary" data-testid={`badge-qr-count-${group.id}`}>
                        <FolderKanban className="h-3 w-3 mr-1" />
                        View QR Codes
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <GroupDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        group={editingGroup}
      />
    </>
  );
}
