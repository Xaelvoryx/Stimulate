import { TopBar } from "@/components/layout/TopBar";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { loadPromptVaultData } from "@/lib/data/loadPromptVault";
import { PromptVaultClient } from "./PromptVaultClient";

export default function PromptVaultPage() {
  const data = loadPromptVaultData();
  
  return (
    <div className="page-wrap" id="top">
      <TopBar />
      <PromptVaultClient data={data} />
      <SiteFooter />
    </div>
  );
}
