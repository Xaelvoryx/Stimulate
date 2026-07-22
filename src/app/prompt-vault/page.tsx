import { TopBar } from "@/components/layout/TopBar";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { loadPromptVaultData } from "@/lib/data/loadPromptVault";
import type { PromptVaultItem } from "@/types";
import { useState, useMemo } from "react";

export default function PromptVaultPage() {
  const data = loadPromptVaultData();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedPrompt, setSelectedPrompt] = useState<PromptVaultItem | null>(null);

  const filteredPrompts = useMemo(() => {
    return data.items.filter((prompt) => {
      const matchesCategory = selectedCategory === "all" || prompt.category === selectedCategory;
      const matchesDifficulty = selectedDifficulty === "all" || prompt.difficulty === selectedDifficulty;
      const matchesTag = selectedTag === "all" || prompt.tags.includes(selectedTag);
      const matchesSearch = searchQuery === "" || 
        prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prompt.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prompt.prompt.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesCategory && matchesDifficulty && matchesTag && matchesSearch;
    });
  }, [data.items, selectedCategory, selectedDifficulty, selectedTag, searchQuery]);

  const categories = Object.keys(data.categories);
  const difficulties = Object.keys(data.difficulties);
  const allTags = Object.keys(data.tags);

  return (
    <div className="page-wrap" id="top">
      <TopBar dataset={data} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Prompt Vault</h1>
          <p className="text-gray-600">
            Browse {data.items.length} curated prompts from the AI ecosystem
          </p>
        </div>

        <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Search</label>
            <input
              type="text"
              placeholder="Search prompts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat} ({data.categories[cat]})
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Difficulty</label>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="all">All Difficulties</option>
              {difficulties.map((diff) => (
                <option key={diff} value={diff}>
                  {diff} ({data.difficulties[diff]})
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Tag</label>
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="all">All Tags</option>
              {allTags.slice(0, 50).map((tag) => (
                <option key={tag} value={tag}>
                  {tag} ({data.tags[tag]})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-4 text-sm text-gray-600">
          Showing {filteredPrompts.length} of {data.items.length} prompts
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPrompts.map((prompt) => (
            <div
              key={prompt.id}
              className="border rounded-lg p-4 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedPrompt(prompt)}
            >
              <h3 className="font-semibold text-lg mb-2">{prompt.title}</h3>
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {prompt.description}
              </p>
              
              <div className="flex flex-wrap gap-1 mb-2">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                  {prompt.category}
                </span>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                  {prompt.difficulty}
                </span>
              </div>
              
              <div className="flex flex-wrap gap-1">
                {prompt.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                    {tag}
                  </span>
                ))}
                {prompt.tags.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                    +{prompt.tags.length - 3}
                  </span>
                )}
              </div>
              
              <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                <span>Quality: {prompt.qualityScore}/100</span>
                <span>Stars: {prompt.repositoryStars}</span>
              </div>
            </div>
          ))}
        </div>

        {selectedPrompt && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedPrompt(null)}
          >
            <div
              className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold">{selectedPrompt.title}</h2>
                <button
                  onClick={() => setSelectedPrompt(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Close
                </button>
              </div>
              
              <p className="text-gray-600 mb-4">{selectedPrompt.description}</p>
              
              <div className="mb-4 flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded">
                  {selectedPrompt.category}
                </span>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded">
                  {selectedPrompt.difficulty}
                </span>
                <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded">
                  Quality: {selectedPrompt.qualityScore}/100
                </span>
              </div>
              
              <div className="mb-4 flex flex-wrap gap-2">
                {selectedPrompt.tags.map((tag) => (
                  <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                    {tag}
                  </span>
                ))}
              </div>
              
              <div className="mb-4">
                <h3 className="font-semibold mb-2">Prompt</h3>
                <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto whitespace-pre-wrap">
                  {selectedPrompt.prompt}
                </pre>
              </div>
              
              <div className="mb-4 text-sm text-gray-600">
                <p><strong>Repository:</strong> {selectedPrompt.repository}</p>
                <p><strong>Author:</strong> {selectedPrompt.author}</p>
                <p><strong>Models:</strong> {selectedPrompt.models.join(", ")}</p>
                <p><strong>Languages:</strong> {selectedPrompt.languages.join(", ")}</p>
              </div>
              
              {selectedPrompt.repositoryUrl && (
                <a
                  href={selectedPrompt.repositoryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  View Repository
                </a>
              )}
            </div>
          </div>
        )}
      </div>

      <SiteFooter />
    </div>
  );
}
