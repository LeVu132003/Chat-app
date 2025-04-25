"use client";

import GroupList from "@/components/GroupList";

export default function GroupsPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Groups</h1>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <GroupList />
        </div>
      </div>
    </div>
  );
}
