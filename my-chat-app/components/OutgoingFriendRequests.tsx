import { useEffect, useState } from "react";
import { OutgoingRequestUser } from "@/types/user";
import { userService } from "@/services/user.service";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { Badge } from "./ui/badge";

export function OutgoingFriendRequests() {
  const [outgoingRequests, setOutgoingRequests] = useState<
    OutgoingRequestUser[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    const fetchOutgoingRequests = async () => {
      try {
        setIsLoading(true);
        setError(null);
        if (!token) return;

        const requests = await userService.getOutgoingFriendRequests(token);
        // Remove duplicates based on user ID
        const uniqueRequests = requests.filter(
          (request, index, self) =>
            index === self.findIndex((r) => r.id === request.id)
        );
        setOutgoingRequests(uniqueRequests);
      } catch (err) {
        setError("Failed to load outgoing friend requests");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOutgoingRequests();
  }, [token]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-4">
        <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500 p-4">{error}</div>;
  }

  if (outgoingRequests.length === 0) {
    return (
      <div className="text-center text-gray-500 p-4">
        No outgoing friend requests
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {outgoingRequests.map((request) => (
        <div
          key={request.id}
          className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold">
              {request.first_name[0]}
              {request.last_name[0]}
            </div>
            <div>
              <div className="font-medium text-gray-900">
                {request.first_name} {request.last_name}
              </div>
              <div className="text-sm text-gray-500">{request.email}</div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Badge variant="outline">Pending</Badge>
          </div>
        </div>
      ))}
    </div>
  );
}
