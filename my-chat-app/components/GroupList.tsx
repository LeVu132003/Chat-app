import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Users } from "lucide-react";

interface Group {
  id: number;
  name: string;
  description?: string;
  memberCount: number;
}

export default function GroupList() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [groups, setGroups] = useState<Group[]>([
    // Temporary mock data
    {
      id: 1,
      name: "Gaming Group",
      description: "For gaming discussions",
      memberCount: 5,
    },
    {
      id: 2,
      name: "Study Group",
      description: "For study sessions",
      memberCount: 3,
    },
  ]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Groups</h2>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              New Group
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Group</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Group Name</label>
                <Input placeholder="Enter group name" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Input placeholder="Enter group description" />
              </div>
              <Button
                className="w-full"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Create Group
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        {groups.map((group) => (
          <div
            key={group.id}
            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 cursor-pointer"
          >
            <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {group.name}
              </p>
              {group.description && (
                <p className="text-sm text-gray-500 truncate">
                  {group.description}
                </p>
              )}
            </div>
            <div className="flex-shrink-0">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                {group.memberCount} members
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
