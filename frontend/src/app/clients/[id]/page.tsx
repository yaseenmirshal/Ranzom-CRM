import { Suspense } from "react";
import { ClientDetailsPage } from "@/components/relationships/DirectoryPage";

async function ClientDetailsRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ClientDetailsPage id={id} />;
}

export default function ClientRoute({ params }: { params: Promise<{ id: string }> }) {
  return <Suspense fallback={<div className="records-page"><p className="lead-loading-state">Loading client details...</p></div>}><ClientDetailsRoute params={params} /></Suspense>;
}
