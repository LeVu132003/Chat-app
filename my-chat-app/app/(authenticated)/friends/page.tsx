"use client";

import UserList from "@/components/UserList";
import FriendsList from "@/components/FriendsList";
import FriendRequests from "@/components/FriendRequests";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, UserPlus, UserCheck } from "lucide-react";

export default function FriendsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Friends</h1>
      </div>

      <Tabs defaultValue="friends" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="friends" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            My Friends
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex items-center gap-2">
            <UserCheck className="w-4 h-4" />
            Friend Requests
          </TabsTrigger>
          <TabsTrigger value="find" className="flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            Find Users
          </TabsTrigger>
        </TabsList>

        <TabsContent value="friends">
          <div className="bg-white rounded-lg shadow p-6">
            <FriendsList />
          </div>
        </TabsContent>

        <TabsContent value="requests">
          <div className="bg-white rounded-lg shadow p-6">
            <FriendRequests />
          </div>
        </TabsContent>

        <TabsContent value="find">
          <div className="bg-white rounded-lg shadow p-6">
            <UserList />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
