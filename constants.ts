import { ThemeConfig, ModelOption } from './types';

export const DEFAULT_MODEL_ID = import.meta.env.VITE_OPENAI_MODEL?.trim() || 'gpt-4o-mini';

export const FALLBACK_MODELS: ModelOption[] = [
  {
    id: DEFAULT_MODEL_ID,
    name: DEFAULT_MODEL_ID,
    badge: '默认模型',
    description: '在 .env 的 VITE_OPENAI_MODEL 中配置',
    type: 'flash'
  },
];

export const AVAILABLE_MODELS = FALLBACK_MODELS;

export const DEFAULT_AVATAR = null;

export const INITIAL_TEXT = `【一周AI大事12月14日】

1、Google推出顶级语音模型Gemini 2.5 TTS https://aistudio.google.com/
2、Google上线实时语音互译Gemini 2.5 Audio Google Translate App
3、Google深度研究接入Gemini 3 Pro https://gemini.google.com/
4、Google UI设计工具stich接入Gemini 3 https://stitch.withgoogle.com/
5、Google 画布Mixboard接入小香蕉 https://labs.google.com/mixboard/welcome
6、智谱推出最强开源手机智能体AutoGLM-Phone-9B https://huggingface.co/zai-org/AutoGLM-Phone-9B
7、智谱开源数字人直播模型RealVideo https://z.ai/blog/realvideo
8、Meta推出短剧视频模型OneStory https://zhaochongan.github.io/projects/OneStory/
9、Meta推出最强开源版客串Saber https://franciszzj.github.io/Saber/
10、字节发布最强自动驾驶视觉模型UniUGP https://huggingface.co/papers/2512.09864
11、运动控制视频模型WanMove https://wan-move.github.io/
12、3D重建视频模型StereoWorld https://ke-xing.github.io/StereoWorld/
13、AR视频编辑模型EgoEdit https://snap-research.github.io/EgoEdit/
14、动作捕捉模型MoCapAnything https://animotionlab.github.io/MoCapAnything/
15、动作复刻模型One to All Animation https://ssj9596.github.io/one-to-all-animation-project/
16、换脸视频模型LivingSwap https://aim-uofa.github.io/LivingSwap
17、去反光图像模型WindowSeat https://huggingface.co/spaces/huawei-bayerlab/windowseat-reflection-removal-web
18、超真实图像模型RealGen https://yejy53.github.io/RealGen/
19、一步生成图像模型TwinFlow https://zhenglin-cheng.com/twinflow/
20、Lora模型Qwen Image i2L https://huggingface.co/DiffSynth-Studio/Qwen-Image-i2L
21、组装式3D生成模型MoCA https://lizhiqi49.github.io/MoCA/
22、可控3D生成模型SpaceControl https://spacecontrol3d.github.io/
23、首个AGI模型 https://www.integral.ai/agi`;

export const THEMES: ThemeConfig[] = [
  {
    id: 'clean-white',
    name: '极简白',
    bgClass: 'bg-[#F2F4F6]', // Soft neutral background
    containerClass: 'bg-white shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border border-slate-100', // Modern soft shadow
    titleClass: 'text-slate-900 border-b border-slate-200 pb-5 mb-8',
    itemClass: 'text-slate-600 font-normal',
    linkClass: 'text-slate-400 font-mono text-xs no-underline hover:text-slate-600',
    footerClass: 'border-slate-100 text-slate-400',
    fontFamily: 'font-sans',
    accentColor: '#0F172A', // Slate 900
    showWatermark: true,
  },
  {
    id: 'caramel-pop',
    name: '产品君主题色',
    bgClass: 'bg-[#FFDE59]', // Bright Buttercup Yellow matched from image
    containerClass: 'bg-[#FFF8E7] border-4 border-[#5D4037] shadow-[8px_8px_0_0_rgba(93,64,55,1)] rounded-xl',
    titleClass: 'text-[#3E2723] border-b-4 border-[#5D4037]/10 pb-5 mb-8 font-black tracking-tight',
    itemClass: 'text-[#5D4037] font-bold',
    linkClass: 'text-[#E65100] font-mono text-xs no-underline hover:text-[#BF360C] bg-transparent', // Added bg-transparent explicitly
    footerClass: 'border-[#5D4037]/20 text-[#5D4037]',
    fontFamily: 'font-sans',
    accentColor: '#5D4037', // Dark Brown
    showWatermark: true,
  },
  {
    id: 'dark-neon',
    name: '赛博黑',
    bgClass: 'bg-[#0B1120]', // Very dark blue/black
    containerClass: 'bg-[#151e32] border border-slate-700/50 shadow-2xl',
    titleClass: 'text-white border-b border-slate-700 pb-5 mb-8 tracking-wide',
    itemClass: 'text-slate-300 font-light tracking-wide',
    linkClass: 'text-indigo-400 font-mono text-xs no-underline opacity-70',
    footerClass: 'border-slate-700 text-slate-400', // Specifically lighter text for dark background
    fontFamily: 'font-sans',
    accentColor: '#818CF8', // Indigo 400
    showWatermark: true,
  },
  {
    id: 'elegant-paper',
    name: '雅致纸',
    bgClass: 'bg-[#EAE5DA]', // Warm beige
    containerClass: 'bg-[#FDFBF7] border border-[#D6D3C9] shadow-[10px_10px_0_0_rgba(214,211,201,0.5)]',
    titleClass: 'text-[#4A4238] border-b border-[#D6D3C9] pb-5 mb-8 italic font-serif',
    itemClass: 'text-[#5C554B]',
    linkClass: 'text-[#9C9283] font-sans text-xs underline decoration-dotted',
    footerClass: 'border-[#D6D3C9] text-[#9C9283]',
    fontFamily: 'font-serif',
    accentColor: '#8C7E6A',
    showWatermark: true,
  },
  {
    id: 'gradient-blue',
    name: '商务蓝',
    bgClass: 'bg-gradient-to-br from-[#E0E7FF] to-[#F0F5FF]',
    containerClass: 'bg-white/90 backdrop-blur-sm border border-white/60 shadow-xl ring-1 ring-black/5',
    titleClass: 'text-[#1E3A8A] bg-blue-50/80 p-6 -mx-6 mb-8 rounded-lg',
    itemClass: 'text-[#334155] border-b border-slate-100/50 last:border-0 font-medium pb-2 mb-2',
    linkClass: 'text-[#64748B] font-mono text-xs',
    footerClass: 'border-slate-200 text-slate-400',
    fontFamily: 'font-sans',
    accentColor: '#2563EB',
    showWatermark: true,
  },
  {
    id: 'soft-gradient',
    name: '雅致渐变',
    bgClass: 'bg-gradient-to-br from-[#E5F1EB] via-[#FAF9F5] to-[#FCE9E6]', // Soft green to white to warm peach/pink
    containerClass: 'bg-white/80 backdrop-blur-xl rounded-[24px] shadow-[0_12px_40px_rgba(0,0,0,0.06)] border border-white',
    titleClass: 'text-[#1C2331] border-b border-black/5 pb-6 mb-8 font-black tracking-tight',
    itemClass: 'text-[#334155] font-medium',
    linkClass: 'text-[#94A3B8] font-mono text-[11px] no-underline hover:text-[#64748B] bg-slate-50/80 px-2 py-0.5 rounded',
    footerClass: 'border-slate-100/60 text-[#64748B]',
    fontFamily: 'font-sans',
    accentColor: '#0F766E', // A soft teal/green accent
    showWatermark: true,
  },
  {
    id: 'eco-gradient',
    name: '清新生态',
    bgClass: 'bg-gradient-to-br from-[#E1EFEA] via-[#F8F7F3] to-[#FBECE6]',
    containerClass: 'bg-white/85 backdrop-blur-2xl rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/70',
    titleClass: 'text-[#111827] border-b border-[#111827]/5 pb-6 mb-8 font-black tracking-tighter',
    itemClass: 'text-[#374151] font-medium',
    linkClass: 'text-[#059669] font-mono text-[11px] no-underline hover:text-[#047857] bg-[#E1EFEA]/50 px-2.5 py-1 rounded-full',
    footerClass: 'border-[#111827]/5 text-[#6B7280]',
    fontFamily: 'font-sans',
    accentColor: '#059669',
    showWatermark: true,
  },
  {
    id: 'fde-insight',
    name: '商业洞察',
    bgClass: 'bg-gradient-to-br from-[#FCF1E3] via-[#F7F8F3] to-[#DBE9E0]',
    containerClass: 'bg-white/90 backdrop-blur-2xl rounded-[32px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-white',
    titleClass: 'text-[#111827] border-b border-black/5 pb-6 mb-6 font-black tracking-tight',
    itemClass: 'text-[#374151] font-medium',
    linkClass: 'text-[#047857] font-mono text-[11px] no-underline hover:text-[#065F46] bg-[#DBE9E0]/50 px-3 py-1.5 rounded-full font-bold',
    footerClass: 'border-black/5 text-[#6B7280] font-medium',
    fontFamily: 'font-sans',
    accentColor: '#047857',
    showWatermark: true,
  }
];
