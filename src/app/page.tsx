import { Hero } from "@/components/dashboard/Hero";
import { StatsGrid } from "@/components/dashboard/StatsGrid";
import { TopRepositories } from "@/components/dashboard/TopRepositories";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Explorer } from "@/components/explorer/Explorer";
import { loadDataset } from "@/lib/data/loadData";

export default function Home() {
  const data = loadDataset();

  return (
    <div className="page-wrap">
      <Hero dataset={data} />

      <main className="container stack">
        <StatsGrid totals={data.totals} />
        <TopRepositories repositories={data.topRepositories} />
        <Explorer dataset={data} />
      </main>

      <SiteFooter />
    </div>
  );
}
