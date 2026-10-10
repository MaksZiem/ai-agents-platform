import Link from "next/link";
import { Button, buttonClasses } from "@/components/button";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { EXECUTION_STATUSES } from "@/lib/types";

export default function DashboardPage() {
  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Overview of your agents and executions."
        actions={
          <>
            <Link href="/executions" className={buttonClasses("secondary")}>
              View executions
            </Link>
            <Link href="/agents/new" className={buttonClasses("primary")}>
              New agent
            </Link>
          </>
        }
      />

      <div className="flex flex-col gap-4 p-6">
        <div className="flex flex-wrap gap-2">
          {EXECUTION_STATUSES.map((status) => (
            <StatusBadge key={status} status={status} />
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="danger">Delete</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="primary" disabled>
            Disabled
          </Button>
        </div>
      </div>
    </div>
  );
}
