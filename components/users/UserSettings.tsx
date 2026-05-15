"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfileTab from "./ProfileTab";
import PasswordResetTab from "./PasswordResetTab";
import SessionsTab from "./SessionTab";
import { UserSettingsSkeleton } from "./UserSettingsSkeleton";


// ─── Root Component ───────────────────────────────────────────────────────────

export function UserSettings() {
  const { data: session, isPending: isSessionPending } = authClient.useSession();

  // Used to force SessionsTab to re-mount (and re-fetch) after a password change
  const [sessionVersion, setSessionVersion] = useState(0);

  if (isSessionPending) {
    return <UserSettingsSkeleton />;
  }

  if (!session?.user) {
    return null;
  }

  const { user } = session;

  return (
    <Tabs defaultValue="profile" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
        <TabsTrigger value="sessions">Sessions</TabsTrigger>
      </TabsList>

      <TabsContent value="profile">
        <ProfileTab currentName={user.name ?? ""} />
      </TabsContent>

      <TabsContent value="security">
        <PasswordResetTab onPasswordChanged={() => setSessionVersion((v) => v + 1)} />
      </TabsContent>

      <TabsContent value="sessions">
        {/* key prop forces a full re-mount + re-fetch when password changes revoke sessions */}
        {session?.session?.token && (
          <SessionsTab
            key={sessionVersion}
            currentSessionToken={session.session.token}
          />
        )}
      </TabsContent>
    </Tabs>
  );
}