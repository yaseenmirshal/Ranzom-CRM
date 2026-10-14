import { Suspense } from "react";
import { SettingsDetailPage } from "@/components/settings/SettingsPage";

async function SettingsSectionRoute({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  return <SettingsDetailPage section={section} />;
}

export default function SettingsSectionPage({ params }: { params: Promise<{ section: string }> }) {
  return <Suspense fallback={<div className="records-page"><p className="lead-loading-state">Loading settings...</p></div>}><SettingsSectionRoute params={params} /></Suspense>;
}
