"use client";

import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Spinner } from "@/components/ui/spinner";
import { ROLE_LABELS } from "@/lib/auth/roles";
import { Doc } from "@/convex/betterAuth/_generated/dataModel";
import { useDebounce } from "@/hooks/use-debounce";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface UserSelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  roles?: string[];
  placeholder?: string;
  disabled?: boolean;
  limit?: number;
  initialUser?: { _id: string; name: string; role?: string } | null;
}

export function UserSelect({
  value,
  onValueChange,
  roles,
  placeholder = "Select a user...",
  disabled = false,
  limit = 5,
  initialUser,
}: UserSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);

  // 1. Fetch search results (debounced) exactly as intended
  const searchResults = useQuery(api.users.searchUsers, {
    search: debouncedSearch || undefined,
    roles: roles && roles.length > 0 ? roles : undefined,
    limit, // Keep the 5 limit logic exactly as requested
  });

  // 2. Fetch the specifically selected user (independent of search)
  const selectedUser = useQuery(api.users.getUser, { id: value });

  const isLoading = searchResults === undefined;

  // 3. Combine results to ensure selected user is always in the list
  const combinedUsers = useMemo(() => {
    const results = [...(searchResults || [])];
    
    // Use either the fetched selected user OR the initial user passed via props
    const currentUser = selectedUser || (initialUser?._id === value ? initialUser : null);

    // If we have a selected user and they aren't in the search results, add them
    if (currentUser && !results.some(u => u._id === currentUser._id)) {
      results.unshift(currentUser as Doc<"user">);
    }
    
    return results;
  }, [searchResults, selectedUser, initialUser, value]);

  const selectedUserName = combinedUsers.find((u) => u._id === value)?.name || 
                           (value === "" || !value ? "Unassigned" : placeholder);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-full justify-between font-normal text-left px-3 shadow-sm h-9"
        >
          <span className="truncate">{selectedUserName}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      {/* Set align="start" and custom width so the dropdown aligns perfectly with the button */}
      <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
        {/* shouldFilter={false} is critical because Convex handles the text filtering */}
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder="Search by name..." 
            value={searchTerm}
            onValueChange={setSearchTerm}
            className="border-none focus-visible:ring-0 shadow-none h-10"
          />
          <CommandList>
            {isLoading && (
               <div className="py-6 text-center text-sm flex items-center justify-center">
                 <Spinner className="h-4 w-4 text-muted-foreground" />
               </div>
            )}
            {!isLoading && combinedUsers.length === 0 && (
              <CommandEmpty>No users found.</CommandEmpty>
            )}
            
            <CommandGroup 
              heading={
                roles && roles.length > 0
                  ? roles.map((r) => ROLE_LABELS[r] ?? r).join(", ")
                  : "All Users"
              }
            >
              <CommandItem
                value="unassigned"
                onSelect={() => {
                  onValueChange("");
                  setOpen(false);
                }}
                className="font-bold text-muted-foreground cursor-pointer"
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    !value ? "opacity-100" : "opacity-0"
                  )}
                />
                Unassigned
              </CommandItem>
              {combinedUsers.map((user: Doc<"user">) => (
                <CommandItem
                  key={user._id}
                  value={user._id}
                  onSelect={(currentValue) => {
                    onValueChange(currentValue);
                    setOpen(false);
                  }}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === user._id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className="font-medium">{user.name}</span>
                  {user.role && (
                    <span className="text-xs text-muted-foreground ml-1">
                      - {ROLE_LABELS[user.role] ?? user.role}
                    </span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}



