"use client";


export function DevOpsAdminDashboard() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">System Wide Monitoring</h1>
        <p className="text-muted-foreground italic">Route: /devops/admin-dashboard</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Placeholder Metric</h3>
          </div>
          <div className="text-2xl font-bold">--</div>
        </div>
      </div>
    </div>
  );
}
