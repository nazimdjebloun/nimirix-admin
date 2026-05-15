"use client";

import { useState } from "react";
import { usePaginatedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { UserFilters } from "./UserFilters";
import { UserTable } from "./UserTable";
import { UserPagination } from "./UserPagination";
import { CreateUserDialog } from "./create-user-dialog";

const USERS_PER_PAGE = 10;

export  function AdminUsers() {

  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [sortOrder, setSortOrder] = useState<"latest" | "oldest">("latest");

  const { results, status, loadMore } = usePaginatedQuery(
    api.users.getPaginatedUsers,
    { search, role, sortOrder },
    { initialNumItems: USERS_PER_PAGE }
  );

  const isLoading = status === "LoadingFirstPage";

  return (
    <div className="flex flex-col gap-6 max-w-300 mx-auto p-4 md:p-8">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">User Management</h1>
          <p className="text-muted-foreground text-sm">
            Manage and monitor all users in the system.
          </p>
        </div>
        <CreateUserDialog />
      </div>

      <div className="flex flex-col gap-6">
        <UserFilters
          search={search}
          setSearch={setSearch}
          role={role}
          setRole={setRole}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
        />

        <div className="flex flex-col gap-2">
          <UserTable users={results} isLoading={isLoading} />
          
          {results.length > 0 && (
            <UserPagination
              canPrevious={false} // Simple pagination for now as Convex loadMore only goes forward
              canNext={status === "CanLoadMore"}
              onPrevious={() => {}} // Not easily supported with standard loadMore
              onNext={() => loadMore(USERS_PER_PAGE)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
