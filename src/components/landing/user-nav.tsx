import UserNavDropdown from "@/components/landing/user-nav-dropdown";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getUserInitials } from "@/lib/utils";
import { User } from "@/types/user";

interface UserNavProps {
  user: User;
}

export function UserNav({ user }: UserNavProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar>
          <AvatarFallback className="bg-white text-black">
            {getUserInitials(user.name || user.email)}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <UserNavDropdown user={user} />
    </DropdownMenu>
  );
}
