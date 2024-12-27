import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth, useUser } from "@clerk/clerk-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import useUserCredits from "@/hooks/useCredits";

const Header = () => {
  const { credits, isLoading } = useUserCredits();
  const { user } = useUser();
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-center">
        <div className="flex w-full max-w-[800px] items-center justify-between px-4">
          <Link to="/dashboard" className="mr-6 flex items-center space-x-2">
            <img
              src="/logo.webp"
              alt="Logo"
              className="h-8 w-8 sm:h-10 sm:w-10"
            />
          </Link>

          <div className="flex items-center space-x-4">
            <div className="text-sm text-muted-foreground">
              {isLoading ? "Loading..." : `${credits} credits remaining`}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="h-8 w-8 cursor-pointer transition-opacity hover:opacity-80">
                  <AvatarImage src={user?.imageUrl} />
                  <AvatarFallback>
                    {user?.firstName?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={handleLogout}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
