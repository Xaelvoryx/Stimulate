import { TopBar } from "@/components/layout/TopBar";
import { Hero } from "@/components/dashboard/Hero";
import { FeaturedSkills } from "@/components/dashboard/FeaturedSkills";
import { CategoryGrid } from "@/components/dashboard/CategoryGrid";
import { PublisherStrip } from "@/components/dashboard/PublisherStrip";
import { HowItWorks } from "@/components/dashboard/HowItWorks";
import { TopRepositories } from "@/components/dashboard/TopRepositories";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Explorer } from "@/components/explorer/Explorer";
import { loadDataset } from "@/lib/data/loadData";

export default function Home() {
  const data = loadDataset();

  // Slim projection keeps the client Explorer payload small (full dataset is ~5 MB).
  const explorerItems = data.items.map((item) => ({
    id: item.id,
    name: item.name,
    type: item.type,
    url: item.url,
    description: item.description,
    section: item.section,
    publisher: item.publisher,
  }));

  return (
    <div className="page-wrap" id="top">
      <TopBar dataset={data} />
      <Hero dataset={data} />

      <main>
        <FeaturedSkills dataset={data} />
        <CategoryGrid dataset={data} />
        <PublisherStrip dataset={data} />
        <Explorer items={explorerItems} publishers={data.publishers} />
        <HowItWorks />
        <TopRepositories repositories={data.topRepositories} />
      </main>

      <SiteFooter />
    </div>
  );
}
