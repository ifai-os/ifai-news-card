import { ThemeConfig, ModelOption } from "../types";
import { FALLBACK_MODELS } from "../constants";

export type AIStyleType = 'standard';

const OPENAI_BASE_URL = import.meta.env.VITE_OPENAI_BASE_URL?.trim().replace(/\/+$/, '');
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY?.trim();
const DEFAULT_OPENAI_MODEL = import.meta.env.VITE_OPENAI_MODEL?.trim() || 'gpt-4o-mini';

const requireGatewayConfig = () => {
  if (!OPENAI_BASE_URL || !OPENAI_API_KEY) {
    throw new Error('未检测到 OpenAI 网关配置。请在 .env 中填写 VITE_OPENAI_BASE_URL 和 VITE_OPENAI_API_KEY 后重启服务。');
  }
  return { baseUrl: OPENAI_BASE_URL, apiKey: OPENAI_API_KEY };
};

const gatewayFetch = async (path: string, init: RequestInit = {}) => {
  const { baseUrl, apiKey } = requireGatewayConfig();
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json', ...init.headers },
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`网关请求失败 (${response.status})：${detail || response.statusText}`);
  }
  return response;
};

const getModelType = (model: string): ModelOption['type'] => {
  const lower = model.toLowerCase();
  if (lower.includes('mini') || lower.includes('nano') || lower.includes('lite')) return 'lite';
  if (lower.includes('pro') || lower.includes('o1') || lower.includes('o3') || lower.includes('reason')) return 'pro';
  return 'flash';
};

export const fetchAvailableModels = async (): Promise<ModelOption[]> => {
  if (!OPENAI_BASE_URL || !OPENAI_API_KEY) return FALLBACK_MODELS;
  try {
    const payload = await (await gatewayFetch('/models')).json() as { data?: Array<{ id?: string; owned_by?: string }> };
    const models = (payload.data || [])
      .filter((model): model is { id: string; owned_by?: string } => Boolean(model.id))
      .map((model) => ({
        id: model.id, name: model.id,
        badge: model.id === DEFAULT_OPENAI_MODEL ? '默认模型' : '可用',
        description: model.owned_by ? `提供方：${model.owned_by}` : 'OpenAI 兼容网关模型',
        type: getModelType(model.id),
      }));
    if (!models.some((model) => model.id === DEFAULT_OPENAI_MODEL)) {
      models.unshift({ id: DEFAULT_OPENAI_MODEL, name: DEFAULT_OPENAI_MODEL, badge: '默认模型', description: '在 .env 的 VITE_OPENAI_MODEL 中配置', type: getModelType(DEFAULT_OPENAI_MODEL) });
    }
    return models.length > 0 ? models : FALLBACK_MODELS;
  } catch (error) {
    console.warn('模型列表加载失败，使用 .env 默认模型：', error);
    return FALLBACK_MODELS;
  }
};

const PROMPT = `You are a specialized content formatter for social media cards. Your only job is to format text into clean Markdown. Preserve every URL exactly. Make the main title an H1 and each item a bullet point. Put each item's description on one line and its URL on the next. Bold entity names where appropriate. Do not summarize or change meaning.`;
type ChatMessage = { role: 'system' | 'user'; content: string };

const createChatCompletion = (model: string, messages: ChatMessage[], options: { stream?: boolean; temperature?: number } = {}) => gatewayFetch('/chat/completions', {
  method: 'POST',
  body: JSON.stringify({ model: model || DEFAULT_OPENAI_MODEL, messages, temperature: options.temperature ?? 0.2, stream: options.stream ?? false }),
});

const getCompletionText = async (model: string, messages: ChatMessage[]) => {
  const payload = await (await createChatCompletion(model, messages)).json() as { choices?: Array<{ message?: { content?: string } }> };
  const content = payload.choices?.[0]?.message?.content;
  if (!content) throw new Error('网关未返回模型文本内容。');
  return content;
};

const parseJson = <T>(content: string): T => JSON.parse(content.trim().replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/, '')) as T;

export const optimizeContentWithGeminiStream = async (rawText: string, onChunk: (chunk: string) => void, _style: AIStyleType = 'standard', modelName: string = DEFAULT_OPENAI_MODEL): Promise<string> => {
  const response = await createChatCompletion(modelName, [{ role: 'system', content: PROMPT }, { role: 'user', content: rawText }], { stream: true, temperature: 0.1 });
  if (!response.body) throw new Error('网关未返回流式响应。');
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let accumulatedText = '';
  const consumeEvent = (event: string) => {
    const data = event.split('\n').find((line) => line.startsWith('data:'))?.slice(5).trim();
    if (!data || data === '[DONE]') return;
    try {
      const payload = JSON.parse(data) as { choices?: Array<{ delta?: { content?: string } }> };
      const chunk = payload.choices?.[0]?.delta?.content;
      if (chunk) { accumulatedText += chunk; onChunk(chunk); }
    } catch { /* Ignore keep-alive events sent by compatible gateways. */ }
  };
  while (true) {
    const { done, value } = await reader.read();
    buffer += decoder.decode(value || new Uint8Array(), { stream: !done });
    const events = buffer.split('\n\n');
    buffer = events.pop() || '';
    events.forEach(consumeEvent);
    if (done) break;
  }
  if (buffer) consumeEvent(buffer);
  if (!accumulatedText) throw new Error('网关未返回流式文本内容。');
  return accumulatedText;
};

export const getTrendingTopics = async (modelName: string = DEFAULT_OPENAI_MODEL): Promise<{ topics: string[], sources: { uri: string, title: string }[] }> => {
  const today = new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
  const content = await getCompletionText(modelName, [
    { role: 'system', content: 'Return only valid JSON, without Markdown fences.' },
    { role: 'user', content: `Today is ${today}. List 5 current hot-news, upcoming festival, or pop-culture topics suitable for a UI theme. Each title must be under 10 Chinese characters. Return {"topics":["..."]}.` },
  ]);
  const parsed = parseJson<{ topics?: string[] }>(content);
  return { topics: Array.isArray(parsed.topics) ? parsed.topics : [], sources: [] };
};

export interface ThemeGenerationResult { theme: ThemeConfig; decorations: string[]; }

export const generateThemeFromTopic = async (topic: string, modelName: string = DEFAULT_OPENAI_MODEL): Promise<ThemeGenerationResult> => {
  const content = await getCompletionText(modelName, [
    { role: 'system', content: 'You are a Senior UI/UX Designer. Return only valid JSON without Markdown fences. Create a readable Tailwind CSS information-card theme. Required keys: name, bgClass, containerClass, titleClass, itemClass, linkClass, footerClass, accentColor, fontFamily, decorations. fontFamily must be font-sans, font-serif, or font-mono. decorations must be 5 emojis.' },
    { role: 'user', content: `Generate a theme and 5 decorations for: ${topic}` },
  ]);
  const raw = parseJson<Partial<ThemeConfig> & { decorations?: string[] }>(content);
  const decorations = raw.decorations || [];
  const theme: ThemeConfig = {
    id: `custom-${Date.now()}`, name: raw.name || '自定义主题', bgClass: raw.bgClass || 'bg-slate-100', containerClass: raw.containerClass || 'bg-white border border-slate-200 shadow-lg', titleClass: raw.titleClass || 'text-slate-900', itemClass: raw.itemClass || 'text-slate-600', linkClass: raw.linkClass || 'text-blue-600', footerClass: raw.footerClass || 'border-slate-200 text-slate-400', accentColor: raw.accentColor || '#0F172A', fontFamily: raw.fontFamily === 'font-serif' || raw.fontFamily === 'font-mono' ? raw.fontFamily : 'font-sans', showWatermark: true, isCustom: true, avatarDecoration: decorations[0],
  };
  return { theme, decorations };
};
