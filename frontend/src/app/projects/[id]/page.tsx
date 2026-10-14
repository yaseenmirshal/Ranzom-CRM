import { Suspense } from "react";
import { ProjectDetailsPage } from "@/components/work/ProjectsPage";

async function ProjectDetailsRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProjectDetailsPage id={id} />;
}

export default function ProjectRoute({ params }: { params: Promise<{ id: string }> }) {
  return <Suspense fallback={<div className="records-page"><p className="lead-loading-state">Loading project details...</p></div>}><ProjectDetailsRoute params={params} /></Suspense>;
}
