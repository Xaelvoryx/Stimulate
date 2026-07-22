import { Suspense } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Explorer } from "@/components/explorer/Explorer";
import { getCleanedDataset } from "@/lib/data/cleanedData";

export default function ExplorePage() {
  const pageData = getCleanedDataset();

  const explorerItems = pageData.items.map((item) => ({
    id: item.id,
    name: item.name,
    type: item.type,
    url: item.url,
    description: item.description,
    originalDescription: item.originalDescription,
    needsTranslation: item.needsTranslation,
    section: item.section,
    publisher: item.publisher,
  }));

  return (
    <div className="page-wrap">
      <TopBar dataset={pageData} />
      <main style={{ padding: "2rem 0" }}>
        <Suspense fallback={<div className="container"><p className="empty">Loading explorer...</p></div>}>
          <Explorer items={explorerItems} publishers={pageData.publishers} />
        </Suspense>
      </main>
      <SiteFooter />
    </div>
  );
}
