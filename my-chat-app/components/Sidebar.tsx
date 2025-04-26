"use client";
/* eslint-disable @next/next/no-img-element */

import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, UserCircle, LogOut, UsersRound } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const navigation = [
    { name: "Friends", href: "/friends", icon: Users },
    { name: "Groups", href: "/groups", icon: UsersRound },
    { name: "Profile", href: "/profile", icon: UserCircle },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <div className="flex flex-col h-screen w-64 bg-white border-r border-gray-200">
      <div
        className="flex justify-center p-2 items-center gap-x-2 cursor-pointer"
        onClick={() => router.push("/")}
      >
        <img
          src="chatchick.png"
          alt="logo"
          className="w-10 h-10 object-contain"
        />
        <h1 className="text-4xl font-matemasie font-normal">
          <span className="text-blue-500">Chat</span>
          <span className="text-yellow-400">Chick</span>
        </h1>
      </div>
      {/* User Profile Section */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold">
            {user?.firstName?.[0]?.toUpperCase() || "U"}
          </div>
          <div>
            <p className="font-medium text-gray-800">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-sm text-gray-500">@{user?.username}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors ${
                    isActive(item.href)
                      ? "bg-indigo-50 text-indigo-600"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="w-6 h-6" />
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={logout}
          className="flex items-center space-x-3 text-gray-700 hover:text-red-600 w-full px-3 py-2 rounded-md transition-colors hover:bg-red-50"
        >
          <LogOut className="w-6 h-6" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
