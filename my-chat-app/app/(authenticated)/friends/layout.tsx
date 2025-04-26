"use client";

import { Users, UserPlus, UserCheck, SendHorizontal } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function FriendsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const tabs = [
    {
      value: "friends",
      label: "My Friends",
      icon: Users,
      href: "/friends",
    },
    {
      value: "requests",
      label: "Incoming Requests",
      icon: UserCheck,
      href: "/friends/requests",
    },
    {
      value: "outgoing",
      label: "Sent Requests",
      icon: SendHorizontal,
      href: "/friends/outgoing",
    },
    {
      value: "find",
      label: "Find Users",
      icon: UserPlus,
      href: "/friends/find",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Friends</h1>
      </div>

      <div className="w-full">
        <nav className="flex space-x-2 mb-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = pathname === tab.href;

            return (
              <Link
                key={tab.value}
                href={tab.href}
                className={cn(
                  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                  isActive
                    ? "bg-indigo-600 text-white"
                    : "bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </Link>
            );
          })}
        </nav>

        <div className="bg-white rounded-lg shadow p-6">{children}</div>
      </div>
    </div>
  );
}
