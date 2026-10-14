import { Suspense } from "react";
import LeadDetails from "@/components/leads/LeadDetails";

async function LeadDetailsRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return   <LeadDetails id={id} key={id} />;
}

export default function LeadDetailsPage({
  params,
}: PageProps<"/leads/[id]">) {
  return (
    <Suspense
      fallback={
        <div aria-live="polite" className="records-page">
          <p className="lead-loading-state">Loading lead details...</p>
        </div>
      }
    >
      <LeadDetailsRoute params={params} />
    </Suspense>
  );
}
