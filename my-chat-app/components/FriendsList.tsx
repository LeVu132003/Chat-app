"use client";

import { useEffect, useState } from "react";
import { User } from "@/types/user";
import { userService } from "@/services/user.service";
import { useAuth } from "@/contexts/AuthContext";
import { MessageSquare, X } from "lucide-react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import Chat from "./Chat";

export default function FriendsList() {
  const { token } = useAuth();
  const [friends, setFriends] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedFriend, setSelectedFriend] = useState<User | null>(null);

  useEffect(() => {
    const fetchFriends = async () => {
      if (!token) return;

      try {
        setIsLoading(true);
        setError("");
        const friendsList = await userService.getFriends(token);
        setFriends(friendsList);
      } catch (err) {
        console.error("Error fetching friends:", err);
        setError("Failed to load friends list");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFriends();
  }, [token]);

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

  if (friends.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">You havent added any friends yet.</p>
        <p className="text-gray-500 mt-2">
          Use the Find Users tab to search and add friends!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {friends.map((friend) => (
        <div
          key={friend.id}
          className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold">
              {userService.getUserInitials(friend)}
            </div>
            <div>
              <div className="font-medium text-gray-900">
                {userService.formatUserDisplayName(friend)}
              </div>
              <div className="text-sm text-gray-500">@{friend.username}</div>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="text-gray-600 hover:text-indigo-600 hover:bg-indigo-50"
            onClick={() => setSelectedFriend(friend)}
          >
            <MessageSquare className="h-5 w-5" />
          </Button>
        </div>
      ))}

      <Dialog
        open={!!selectedFriend}
        onOpenChange={(open) => !open && setSelectedFriend(null)}
      >
        <DialogContent className="sm:max-w-[800px] h-[80vh] flex flex-col p-0">
          <DialogHeader className="p-4 border-b">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-3">
                {selectedFriend && (
                  <>
                    <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold">
                      {userService.getUserInitials(selectedFriend)}
                    </div>
                    <div>
                      <div className="font-medium">
                        {userService.formatUserDisplayName(selectedFriend)}
                      </div>
                      <div className="text-sm text-gray-500">
                        @{selectedFriend.username}
                      </div>
                    </div>
                  </>
                )}
              </DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setSelectedFriend(null)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">
            {selectedFriend && (
              <Chat
                targetID={selectedFriend.id.toString()}
                toUsername={selectedFriend.username}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
