import { TopBar } from "@/components/layout/TopBar";
import { Hero } from "@/components/dashboard/Hero";
import { FeaturedSkills } from "@/components/dashboard/FeaturedSkills";
import { CategoryGrid } from "@/components/dashboard/CategoryGrid";
import { HowItWorks } from "@/components/dashboard/HowItWorks";
import { TopRepositories } from "@/components/dashboard/TopRepositories";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Explorer } from "@/components/explorer/Explorer";
import { loadDataset } from "@/lib/data/loadData";

export default function Home() {
  const data = loadDataset();

  return (
    <div className="page-wrap" id="top">
      <TopBar dataset={data} />
      <Hero dataset={data} />

      <main>
        <FeaturedSkills dataset={data} />
        <CategoryGrid dataset={data} />
        <Explorer dataset={data} />
        <HowItWorks />
        <TopRepositories repositories={data.topRepositories} />
      </main>

      <SiteFooter />
    </div>
  );
}
