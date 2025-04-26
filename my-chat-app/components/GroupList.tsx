"use client";

import { useEffect, useState } from "react";
import { Group } from "@/types/group";
import { groupService } from "@/services/group.service";
import { useAuth } from "@/contexts/AuthContext";
import { Users, Plus, X, Search, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { toast } from "sonner";
import { userService } from "@/services/user.service";
import { User } from "@/types/user";

export default function GroupList() {
  const { token } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const fetchGroups = async () => {
      if (!token) return;

      try {
        setIsLoading(true);
        setError("");
        const myGroups = await groupService.getMyGroups(token);
        setGroups(myGroups);
      } catch (err) {
        console.error("Error fetching groups:", err);
        setError("Failed to load groups");
      } finally {
        setIsLoading(false);
      }
    };

    fetchGroups();
  }, [token]);

  const handleSearch = async (value: string) => {
    if (!token || !value.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setIsSearching(true);
      const results = await userService.searchUsers(token, { username: value });
      setSearchResults(results);
    } catch (err) {
      console.error("Error searching users:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleCreateGroup = async () => {
    if (!token || !groupName.trim() || selectedMembers.length === 0) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setIsCreating(true);
      await groupService.createGroup(token, {
        name: groupName.trim(),
        members: selectedMembers,
      });

      // Refresh groups list
      const updatedGroups = await groupService.getMyGroups(token);
      setGroups(updatedGroups);

      // Reset form
      setGroupName("");
      setSelectedMembers([]);
      setSearchTerm("");
      setSearchResults([]);
      setIsCreateDialogOpen(false);

      toast.success("Group created successfully!");
    } catch (err) {
      console.error("Error creating group:", err);
      toast.error("Failed to create group");
    } finally {
      setIsCreating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 py-4">{error}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end items-center">
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Group
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Group</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Group Name</label>
                <Input
                  placeholder="Enter group name"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Add Members</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      handleSearch(e.target.value);
                    }}
                    startIcon={Search}
                  />
                </div>
                {/* Selected Members */}
                {selectedMembers.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedMembers.map((username) => (
                      <div
                        key={username}
                        className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-md text-sm flex items-center gap-1"
                      >
                        {username}
                        <button
                          onClick={() =>
                            setSelectedMembers((prev) =>
                              prev.filter((u) => u !== username)
                            )
                          }
                          className="text-indigo-600 hover:text-indigo-800"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {/* Search Results */}
                {isSearching ? (
                  <div className="flex justify-center py-2">
                    <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
                  </div>
                ) : (
                  searchResults.length > 0 && (
                    <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
                      {searchResults.map((user) => (
                        <button
                          key={user.username}
                          onClick={() => {
                            if (!selectedMembers.includes(user.username)) {
                              setSelectedMembers((prev) => [
                                ...prev,
                                user.username,
                              ]);
                            }
                            setSearchTerm("");
                            setSearchResults([]);
                          }}
                          className="w-full text-left px-2 py-1 hover:bg-gray-100 rounded-md text-sm"
                          disabled={selectedMembers.includes(user.username)}
                        >
                          {user.firstName} {user.lastName} (@{user.username})
                        </button>
                      ))}
                    </div>
                  )
                )}
              </div>
              <Button
                className="w-full bg-indigo-600 hover:bg-indigo-700"
                onClick={handleCreateGroup}
                disabled={
                  isCreating ||
                  !groupName.trim() ||
                  selectedMembers.length === 0
                }
              >
                {isCreating ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                Create Group
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {groups.length === 0 ? (
          <div className="text-center py-8">
            <div className="flex flex-col items-center gap-2">
              <Users className="w-12 h-12 text-gray-400" />
              <p className="text-gray-500">No groups found</p>
            </div>
          </div>
        ) : (
          groups.map((group) => (
            <div
              key={group.id}
              className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold">
                  {group.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-medium text-gray-900">{group.name}</div>
                  <div className="text-sm text-gray-500">
                    {group.members.length} members
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
