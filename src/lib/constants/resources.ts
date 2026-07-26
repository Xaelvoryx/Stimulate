export interface Resource {
  name: string;
  url: string;
}

export interface Category {
  id: string;
  title: string;
  description: string;
  resources: Resource[];
}

export const RESOURCES_CONFIG: Category[] = [
  {
    id: 'mcp',
    title: 'MCP',
    description: 'Model Context Protocol servers, registries, and tools',
    resources: [
      { name: 'Official MCP Registry', url: 'https://registry.modelcontextprotocol.io' },
      { name: 'Smithery', url: 'https://smithery.ai' },
      { name: 'PulseMCP', url: 'https://www.pulsemcp.com' },
      { name: 'Glama MCP', url: 'https://glama.ai/mcp/servers' },
      { name: 'mcp.so', url: 'https://mcp.so' },
      { name: 'MCP Atlas', url: 'https://www.mcp-atlas.com' },
      { name: 'MCP Toplist', url: 'https://mcptoplist.com' },
      { name: 'Awesome MCP', url: 'https://awesomemcp.io' },
      { name: 'Awesome MCP Tools', url: 'https://awesome-mcp.tools' },
      { name: 'Official MCP Servers', url: 'https://github.com/modelcontextprotocol/servers' },
    ],
  },
  {
    id: 'ai-agents',
    title: 'AI Agents',
    description: 'AI agent directories, marketplaces, and discovery platforms',
    resources: [
      { name: 'AI Agents Directory', url: 'https://aiagentsdirectory.com' },
      { name: 'AI Agent Store', url: 'https://aiagentstore.ai' },
      { name: 'AgentKart', url: 'https://www.agentkart.ai' },
      { name: 'AI Top Tools', url: 'https://aitoptools.com' },
      { name: 'Futurepedia', url: 'https://www.futurepedia.io' },
      { name: "There's An AI For That", url: 'https://theresanaiforthat.com' },
      { name: 'TopAI.tools', url: 'https://topai.tools' },
      { name: 'FutureTools', url: 'https://www.futuretools.io' },
      { name: 'Toolify AI', url: 'https://www.toolify.ai' },
      { name: 'OpenTools AI', url: 'https://opentools.ai' },
    ],
  },
  {
    id: 'agentic-skills',
    title: 'Agentic Skills',
    description: 'Agent skills, workflows, and integration platforms',
    resources: [
      { name: 'Composio', url: 'https://composio.dev' },
      { name: 'LangChain Hub', url: 'https://smith.langchain.com/hub' },
      { name: 'CrewAI', url: 'https://crewai.com' },
      { name: 'Agno', url: 'https://agno.com' },
      { name: 'Dify Marketplace', url: 'https://dify.ai' },
      { name: 'Flowise', url: 'https://flowiseai.com' },
      { name: 'n8n Templates', url: 'https://n8n.io/workflows' },
      { name: 'Hugging Face Spaces', url: 'https://huggingface.co/spaces' },
      { name: 'OpenAI Cookbook', url: 'https://cookbook.openai.com' },
      { name: 'Langflow', url: 'https://langflow.org' },
    ],
  },
  {
    id: 'mcp-skills',
    title: 'MCP Skills',
    description: 'MCP-specific skills and agent capabilities',
    resources: [
      { name: 'Awesome Skills', url: 'https://awesomeskills.net' },
      { name: 'Awesome Agent Skills', url: 'https://awesomeagentskills.dev' },
      { name: 'Browse All Agent Skills', url: 'https://awesomeagentskills.dev/skills' },
      { name: 'Microsoft Skills', url: 'https://github.com/microsoft/skills' },
      { name: 'Anthropic Skills', url: 'https://github.com/anthropics/skills' },
      { name: 'LangChain Hub', url: 'https://smith.langchain.com/hub' },
      { name: 'n8n Workflow Templates', url: 'https://n8n.io/workflows' },
      { name: 'Flowise Templates', url: 'https://github.com/FlowiseAI/Flowise' },
      { name: 'Hugging Face Spaces', url: 'https://huggingface.co/spaces' },
      { name: 'Awesome Claude Skills', url: 'https://github.com/BehiSec/awesome-claude-skills' },
    ],
  },
  {
    id: 'prompt-libraries',
    title: 'Prompt Libraries',
    description: 'Prompt collections, libraries, and engineering resources',
    resources: [
      { name: 'PromptHero', url: 'https://prompthero.com' },
      { name: 'FlowGPT', url: 'https://flowgpt.com' },
      { name: 'LangChain Hub', url: 'https://smith.langchain.com/hub' },
      { name: 'OpenAI Cookbook', url: 'https://cookbook.openai.com' },
      { name: 'Anthropic Prompt Library', url: 'https://docs.anthropic.com/en/prompt-library' },
      { name: 'Google AI Prompt Gallery', url: 'https://ai.google.dev/examples' },
      { name: 'Hugging Face Spaces', url: 'https://huggingface.co/spaces' },
      { name: 'Awesome ChatGPT Prompts', url: 'https://github.com/f/awesome-chatgpt-prompts' },
      { name: 'Awesome Prompt Engineering', url: 'https://github.com/promptslab/Awesome-Prompt-Engineering' },
      { name: 'Prompt Engineering Guide', url: 'https://www.promptingguide.ai' },
    ],
  },
  {
    id: 'learning-platforms',
    title: 'Learning Platforms',
    description: 'Developer education, documentation, and learning resources',
    resources: [
      { name: 'freeCodeCamp', url: 'https://www.freecodecamp.org' },
      { name: 'MDN Web Docs', url: 'https://developer.mozilla.org' },
      { name: 'Microsoft Learn', url: 'https://learn.microsoft.com' },
      { name: 'Google for Developers', url: 'https://developers.google.com' },
      { name: 'AWS Skill Builder', url: 'https://skillbuilder.aws' },
      { name: 'Kubernetes Documentation', url: 'https://kubernetes.io/docs' },
      { name: 'Docker Documentation', url: 'https://docs.docker.com' },
      { name: 'Hugging Face Learn', url: 'https://huggingface.co/learn' },
      { name: 'TensorFlow Tutorials', url: 'https://www.tensorflow.org/tutorials' },
      { name: 'PyTorch Tutorials', url: 'https://pytorch.org/tutorials' },
      { name: 'FastAPI Documentation', url: 'https://fastapi.tiangolo.com' },
      { name: 'React Documentation', url: 'https://react.dev' },
      { name: 'Next.js Documentation', url: 'https://nextjs.org/docs' },
      { name: 'Node.js Documentation', url: 'https://nodejs.org/docs' },
      { name: 'Python Documentation', url: 'https://docs.python.org/3' },
      { name: 'PostgreSQL Documentation', url: 'https://www.postgresql.org/docs' },
      { name: 'MongoDB Documentation', url: 'https://www.mongodb.com/docs' },
      { name: 'Linux Journey', url: 'https://linuxjourney.com' },
      { name: 'Roadmap.sh', url: 'https://roadmap.sh' },
      { name: 'The Odin Project', url: 'https://www.theodinproject.com' },
    ],
  },
];

export const TOTAL_CATEGORIES = RESOURCES_CONFIG.length;
export const TOTAL_RESOURCES = RESOURCES_CONFIG.reduce((acc, cat) => acc + cat.resources.length, 0);

export const FILTER_OPTIONS = [
  { id: 'all', label: 'All' },
  { id: 'mcp', label: 'MCP' },
  { id: 'ai-agents', label: 'Agents' },
  { id: 'agentic-skills', label: 'Skills' },
  { id: 'mcp-skills', label: 'MCP Skills' },
  { id: 'prompt-libraries', label: 'Prompts' },
  { id: 'learning-platforms', label: 'Learning' },
];
