import { TopBar } from "@/components/layout/TopBar";
import { Hero } from "@/components/dashboard/Hero";
import { FeaturedSkills } from "@/components/dashboard/FeaturedSkills";
import { CategoryGrid } from "@/components/dashboard/CategoryGrid";
import { PublisherStrip } from "@/components/dashboard/PublisherStrip";
import { HowItWorks } from "@/components/dashboard/HowItWorks";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { DirectTakeaways } from "@/components/directTakeaways/DirectTakeaways";
import { getCleanedDataset } from "@/lib/data/cleanedData";
import { loadPromptDataset } from "@/lib/data/loadData";

export default function Home() {
  const pageData = getCleanedDataset();
  const promptsData = loadPromptDataset();
  const promptList = promptsData.items ?? [];

  return (
    <div className="page-wrap" id="top">
      <TopBar dataset={pageData} />
      <Hero dataset={pageData} prompts={promptList} />

      <main>
        <DirectTakeaways />
        <FeaturedSkills dataset={pageData} />
        <CategoryGrid dataset={pageData} />
        <PublisherStrip dataset={pageData} />
        <HowItWorks />
      </main>

      <SiteFooter />
    </div>
  );
}
