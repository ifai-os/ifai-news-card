import { GoogleGenAI, Type } from "@google/genai";
import { ThemeConfig, ModelOption } from "../types";
import { FALLBACK_MODELS } from "../constants";

export type AIStyleType = 'standard';

// Vite only exposes variables prefixed with VITE_ to browser code. Keep the
// configuration lookup in one place so all Gemini requests use the same key.
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY?.trim();

const requireGeminiApiKey = (): string => {
  if (!GEMINI_API_KEY) {
    throw new Error("未检测到 Gemini API Key。请复制 .env.example 为 .env，并填写 VITE_GEMINI_API_KEY 后重启服务。");
  }
  return GEMINI_API_KEY;
};

export const fetchAvailableModels = async (): Promise<ModelOption[]> => {
  if (!GEMINI_API_KEY) {
    return FALLBACK_MODELS;
  }

  try {
    const ai = new GoogleGenAI({ 
      apiKey: GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const pager = await ai.models.list();
    const rawList: Array<{
      id: string;
      displayName?: string;
      description?: string;
      supportedMethods?: string[];
    }> = [];

    for await (const m of pager) {
      if (!m) continue;
      const cleanId = (m.name || '').replace(/^models\//, '');
      const methods = (m as any).supportedGenerationMethods || [];
      // Keep models suitable for content generation
      if (methods.length === 0 || methods.includes('generateContent')) {
        rawList.push({
          id: cleanId,
          displayName: (m as any).displayName || cleanId,
          description: (m as any).description || '',
          supportedMethods: methods,
        });
      }
    }

    // Filter to Gemini models
    const geminiModels = rawList.filter(m => m.id.toLowerCase().includes('gemini'));
    if (geminiModels.length === 0) {
      return FALLBACK_MODELS;
    }

    const mapped: ModelOption[] = geminiModels.map(m => {
      const lower = m.id.toLowerCase();
      let badge = '可用';
      let type: 'flash' | 'pro' | 'lite' = 'flash';

      if (lower.includes('latest')) {
        badge = '最新推荐';
      } else if (lower.includes('pro')) {
        badge = '深度推理';
        type = 'pro';
      } else if (lower.includes('lite')) {
        badge = '轻量高效';
        type = 'lite';
      } else if (lower.includes('flash')) {
        badge = '闪电极速';
        type = 'flash';
      }

      return {
        id: m.id,
        name: m.displayName || m.id,
        badge,
        description: m.description || `Gemini 模型: ${m.id}`,
        type,
      };
    });

    // Ensure gemini-flash-latest is included as the primary default
    const hasLatest = mapped.some(m => m.id === 'gemini-flash-latest');
    const result: ModelOption[] = [];

    if (!hasLatest) {
      result.push({
        id: 'gemini-flash-latest',
        name: 'Gemini Flash (Latest)',
        badge: '最新默认',
        description: 'Google 官方动态最新版 Flash 极速端点',
        type: 'flash',
      });
    }

    // Sort: 'latest' models first, then flash, then pro
    mapped.sort((a, b) => {
      const aIsLatest = a.id.includes('latest') ? 1 : 0;
      const bIsLatest = b.id.includes('latest') ? 1 : 0;
      if (aIsLatest !== bIsLatest) return bIsLatest - aIsLatest;

      const aIsFlash = a.id.includes('flash') ? 1 : 0;
      const bIsFlash = b.id.includes('flash') ? 1 : 0;
      if (aIsFlash !== bIsFlash) return bIsFlash - aIsFlash;

      return a.id.localeCompare(b.id);
    });

    result.push(...mapped);

    // Deduplicate by ID
    const unique = result.filter((item, index, self) => 
      index === self.findIndex((t) => t.id === item.id)
    );

    return unique.length > 0 ? unique : FALLBACK_MODELS;
  } catch (error) {
    console.warn("Dynamic model fetching failed, using fallback models:", error);
    return FALLBACK_MODELS;
  }
};

const PROMPT = `
You are a specialized content formatter for social media cards.
Your ONLY job is to format the text into clean Markdown.

CRITICAL INSTRUCTIONS:
1. **URL PRESERVATION IS PARAMOUNT**: 
   - You MUST identify every single URL in the input text.
   - You MUST include every single URL in the output.
   - Do NOT shorten, remove, or alter URLs.
   - If a line has a URL, it must appear in the output.

2. **LAYOUT RULES**:
   - The Main Title (usually inside 【 】 or at the top) should be H1 (# Title).
   - Each item should be a bullet point (* Item).
   - **Important**: Put the text description on one line, and the URL on the NEXT line.
   - Use a soft break or newline between the text and the URL.
   - **BOLD** the entity name at the start of the item (e.g. **Google**, **OpenAI**).

3. **CONTENT FIDELITY**:
   - Do not summarize.
   - Do not change the meaning.
   - Fix typos only if obvious, otherwise keep text as is.

Example Input:
1. Google released Gemini https://google.com

Example Output:
* **Google** released Gemini
  https://google.com
`;

export const optimizeContentWithGeminiStream = async (
  rawText: string, 
  onChunk: (chunk: string) => void,
  style: AIStyleType = 'standard',
  modelName: string = 'gemini-flash-latest'
): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ 
      apiKey: requireGeminiApiKey(),
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    const responseStream = await ai.models.generateContentStream({
      model: modelName,
      contents: rawText,
      config: {
        systemInstruction: PROMPT,
        temperature: 0.1,
      },
    });

    let accumulatedText = "";
    for await (const chunk of responseStream) {
      const text = chunk.text;
      if (text) {
        accumulatedText += text;
        onChunk(text);
      }
    }
    return accumulatedText;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const getTrendingTopics = async (modelName: string = 'gemini-flash-latest'): Promise<{ topics: string[], sources: { uri: string, title: string }[] }> => {
  const ai = new GoogleGenAI({ 
    apiKey: requireGeminiApiKey(),
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
  const today = new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
  
  const response = await ai.models.generateContent({
    model: modelName,
    contents: `Today is ${today}. List 5 current hot news topics, upcoming major festivals (like Winter Solstice or Christmas if near), or trending pop culture events (movies, tech releases) for a UI design theme. Keep each title under 10 chars. Return as a JSON object with a 'topics' array of strings.`,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          topics: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ['topics']
      }
    }
  });

  const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
    ?.filter(chunk => chunk.web)
    ?.map(chunk => ({ uri: chunk.web!.uri, title: chunk.web!.title || 'Source' })) || [];

  try {
    const parsed = JSON.parse(response.text || '{"topics":[]}');
    return { topics: parsed.topics, sources };
  } catch (e) {
    return { topics: [], sources };
  }
};

export interface ThemeGenerationResult {
  theme: ThemeConfig;
  decorations: string[];
}

export const generateThemeFromTopic = async (topic: string, modelName: string = 'gemini-flash-latest'): Promise<ThemeGenerationResult> => {
  const ai = new GoogleGenAI({ 
    apiKey: requireGeminiApiKey(),
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
  const systemInstruction = `You are a Senior UI/UX Designer. Generate a Tailwind CSS based theme object for a professional information card based on the topic: "${topic}".

DESIGN PRINCIPLES:
1. READABILITY: Ensure high contrast between text colors and container background.
2. AESTHETICS: Use sophisticated colors, soft shadows, and subtle gradients. Avoid "noisy" or vibrating color combinations.
3. HIERARCHY: The title should be prominent but not overwhelming. Links should be distinct but subtle.
4. SPACE: Ensure classes include adequate padding/margins for a "breathable" design.

FIELDS TO GENERATE:
- name: A 2-4 char name.
- bgClass: Background of the whole card area (use soft gradients or dark slate).
- containerClass: The main content card styles (bg, rounded-2xl, border, shadow-premium).
- titleClass: Typography for the H1 title. Use elegant colors.
- itemClass: Styles for list items (text color, line-height).
- linkClass: Subtle but clear link styles.
- accentColor: A hex code used for watermarks and bold text.
- decorations: An array of 5 distinct Emojis or small symbols related to "${topic}".
- fontFamily: One of 'font-sans', 'font-serif', 'font-mono'.`;

  const response = await ai.models.generateContent({
    model: modelName,
    contents: `Generate a theme and 5 decorations for: ${topic}`,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          bgClass: { type: Type.STRING },
          containerClass: { type: Type.STRING },
          titleClass: { type: Type.STRING },
          itemClass: { type: Type.STRING },
          linkClass: { type: Type.STRING },
          footerClass: { type: Type.STRING },
          accentColor: { type: Type.STRING },
          decorations: { 
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          fontFamily: { type: Type.STRING, enum: ['font-sans', 'font-serif', 'font-mono'] }
        },
        required: ['name', 'bgClass', 'containerClass', 'titleClass', 'itemClass', 'linkClass', 'accentColor', 'fontFamily', 'decorations']
      }
    }
  });

  const raw = JSON.parse(response.text || "{}");
  const theme: ThemeConfig = {
    id: `custom-${Date.now()}`,
    name: raw.name,
    bgClass: raw.bgClass,
    containerClass: raw.containerClass,
    titleClass: raw.titleClass,
    itemClass: raw.itemClass,
    linkClass: raw.linkClass,
    footerClass: raw.footerClass || 'border-slate-200 text-slate-400',
    accentColor: raw.accentColor,
    fontFamily: raw.fontFamily,
    showWatermark: true,
    isCustom: true,
    avatarDecoration: raw.decorations[0] // default to first
  };

  return {
    theme,
    decorations: raw.decorations
  };
};
