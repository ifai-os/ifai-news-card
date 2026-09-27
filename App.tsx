import React, { useState, useRef, useCallback, useEffect } from 'react';
import { toPng } from 'html-to-image';
import { INITIAL_TEXT, THEMES, DEFAULT_AVATAR, FALLBACK_MODELS, DEFAULT_MODEL_ID } from './constants';
import { ThemeConfig, WatermarkSettings, ModelOption } from './types';
import { optimizeContentWithGeminiStream, AIStyleType, getTrendingTopics, generateThemeFromTopic, fetchAvailableModels } from './services/geminiService';
import { Editor } from './components/Editor';
import { PreviewCard } from './components/PreviewCard';
import { Controls } from './components/Controls';
import { Sparkles, AlertTriangle, User, Dices, Loader2, Check, RefreshCw, ExternalLink, Palette, Wand2 } from 'lucide-react';

type DownloadPhase = 'idle' | 'fonts' | 'rendering';

const App: React.FC = () => {
  const [content, setContent] = useState<string>(INITIAL_TEXT);
  const [theme, setTheme] = useState<ThemeConfig>(THEMES.find(t => t.id === 'soft-gradient') || THEMES[0]);
  const [customThemes, setCustomThemes] = useState<ThemeConfig[]>([]);
  const [scale, setScale] = useState<number>(1.15);
  const [lineHeight, setLineHeight] = useState<number>(1.6);
  const [width, setWidth] = useState<number>(390);
  const [footerText, setFooterText] = useState<string>("产品君");
  const [avatarImage, setAvatarImage] = useState<string | null>(DEFAULT_AVATAR);
  
  const [watermarkSettings, setWatermarkSettings] = useState<WatermarkSettings>({
    show: true,
    size: 20,
    gap: 80,
    opacity: 0.08
  });
  
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [downloadPhase, setDownloadPhase] = useState<DownloadPhase>('idle');
  const [hasOptimized, setHasOptimized] = useState(false);
  
  // Modal states
  const [showOptWarning, setShowOptWarning] = useState(false);
  const [showAvatarWarning, setShowAvatarWarning] = useState(false);
  const [showLuckyModal, setShowLuckyModal] = useState(false);
  
  // Lucky feature states
  const [luckyTopics, setLuckyTopics] = useState<string[]>([]);
  const [luckySources, setLuckySources] = useState<{ uri: string, title: string }[]>([]);
  const [isLoadingTopics, setIsLoadingTopics] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [isGeneratingTheme, setIsGeneratingTheme] = useState(false);
  const [previewTheme, setPreviewTheme] = useState<ThemeConfig | null>(null);
  const [previewDecorations, setPreviewDecorations] = useState<string[]>([]);
  
  // Models state - dynamically fetched from server, defaulting to 'gemini-flash-latest'
  const [models, setModels] = useState<ModelOption[]>(FALLBACK_MODELS);
  const [selectedModel, setSelectedModel] = useState<string>(DEFAULT_MODEL_ID);
  const [isLoadingModels, setIsLoadingModels] = useState(false);

  const loadServerModels = useCallback(async () => {
    setIsLoadingModels(true);
    try {
      const serverModels = await fetchAvailableModels();
      if (serverModels && serverModels.length > 0) {
        setModels(serverModels);
        setSelectedModel(prev => {
          const exists = serverModels.some(m => m.id === prev);
          if (exists) return prev;
          const defaultOpt = serverModels.find(m => m.id === DEFAULT_MODEL_ID);
          return defaultOpt ? defaultOpt.id : serverModels[0].id;
        });
      }
    } catch (err) {
      console.warn("Failed to dynamically load models:", err);
    } finally {
      setIsLoadingModels(false);
    }
  }, []);

  useEffect(() => {
    loadServerModels();
  }, [loadServerModels]);

  const previewRef = useRef<HTMLDivElement>(null);

  const handleEditorChange = (newContent: string) => {
    setContent(newContent);
    setHasOptimized(false);
  };

  const handleOptimize = async (style: AIStyleType) => {
    setShowOptWarning(false);
    setIsOptimizing(true);
    const sourceText = content || INITIAL_TEXT;
    let streamText = "";
    try {
      await optimizeContentWithGeminiStream(sourceText, (chunk) => {
        streamText += chunk;
        setContent(streamText);
      }, style, selectedModel);
      setHasOptimized(true);
    } catch (error: any) {
      console.error(error);
      alert(error?.message || "AI 优化失败，请检查 API Key 配置或稍后重试。");
    } finally {
      setIsOptimizing(false);
    }
  };

  const fetchTopics = async () => {
    setIsLoadingTopics(true);
    setSelectedTopic(null);
    setPreviewTheme(null);
    setPreviewDecorations([]);
    try {
      const data = await getTrendingTopics(selectedModel);
      setLuckyTopics(data.topics);
      setLuckySources(data.sources);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingTopics(false);
    }
  };

  const handleLuckyClick = () => {
    setShowLuckyModal(true);
    if (luckyTopics.length === 0) {
      fetchTopics();
    }
  };

  const handleTopicSelect = async (topic: string) => {
    setSelectedTopic(topic);
    setIsGeneratingTheme(true);
    try {
      const result = await generateThemeFromTopic(topic, selectedModel);
      setPreviewTheme(result.theme);
      setPreviewDecorations(result.decorations);
    } catch (e) {
      console.error(e);
      alert("生成主题失败，请重试。");
    } finally {
      setIsGeneratingTheme(false);
    }
  };

  const handleRegenerateTheme = () => {
    if (selectedTopic) handleTopicSelect(selectedTopic);
  };

  const applyLuckyTheme = () => {
    if (previewTheme) {
      setCustomThemes(prev => [previewTheme, ...prev]);
      setTheme(previewTheme);
      setShowLuckyModal(false);
      setPreviewTheme(null);
      setSelectedTopic(null);
      setPreviewDecorations([]);
    }
  };

  const performDownload = async () => {
    if (previewRef.current === null) return;
    setDownloadPhase('fonts');
    try {
      await document.fonts.ready;
      setDownloadPhase('rendering');
      const dataUrl = await toPng(previewRef.current, { 
        cacheBust: true,
        pixelRatio: 4, 
        backgroundColor: theme.bgClass.startsWith('bg-[') ? theme.bgClass.match(/\[(.*?)\]/)?.[1] : '#ffffff',
      });
      const link = document.createElement('a');
      link.download = `NoteSnap-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Download failed:', err);
      alert('生成图片失败，请重试。');
    } finally {
      setDownloadPhase('idle');
    }
  };

  const handleDownloadClick = useCallback(() => {
    if (!hasOptimized) {
      setShowOptWarning(true);
      return;
    } 
    if (!avatarImage) {
      setShowAvatarWarning(true);
      return;
    }
    performDownload();
  }, [hasOptimized, avatarImage, performDownload]);

  const Modal = ({ isOpen, title, desc, icon: Icon, actions, children }: any) => {
    if (!isOpen) return null;
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-6 animate-in fade-in duration-300">
        <div className="bg-white rounded-[2.5rem] shadow-premium max-w-lg w-full p-8 md:p-10 transform animate-in zoom-in-95 duration-200 border border-slate-100 flex flex-col items-center text-center max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-6 shadow-inner flex-shrink-0">
               <Icon size={28} strokeWidth={2.5} />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">{title}</h3>
            {desc && <p className="text-slate-400 mb-8 text-sm font-medium leading-relaxed">{desc}</p>}
            
            {children}

            <div className="flex flex-col gap-3 w-full mt-8">
                {actions}
            </div>
        </div>
      </div>
    );
  };

  const getDownloadButtonText = () => {
    switch (downloadPhase) {
      case 'fonts': return '准备资源...';
      case 'rendering': return '正在渲染...';
      default: return '导出高清卡片';
    }
  };

  return (
    <div className="h-screen bg-white text-slate-900 font-sans selection:bg-indigo-100 flex flex-col overflow-hidden">
      
      <header className="bg-white border-b border-slate-100 z-50 flex-shrink-0 relative h-16">
        <div className="px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-default">
            <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-soft group-hover:rotate-12 transition-transform duration-500">
              <Sparkles size={20} fill="currentColor" />
            </div>
            <div>
              <h1 className="text-base font-black tracking-tight text-slate-900">AI 大事件海报生成器</h1>
              <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] -mt-1">Creative Card Studio</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 rounded-xl px-2.5 py-1 shadow-sm hover:border-indigo-200 transition-colors">
                {isLoadingModels ? (
                  <Loader2 size={10} className="text-indigo-600 animate-spin" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="已连接"></span>
                )}
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider hidden sm:inline">模型:</span>
                <select 
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="text-xs font-bold text-slate-700 bg-transparent border-none outline-none cursor-pointer hover:text-indigo-600 transition-colors appearance-none pr-4 relative"
                  style={{ backgroundImage: 'url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' fill=\'none\' stroke=\'%236366F1\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpath d=\'m6 9 4-4H2z\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right center' }}
                  title="选择处理模型（动态从服务器获取）"
                >
                  {models.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} {m.badge ? `(${m.badge})` : ''}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => loadServerModels()}
                  disabled={isLoadingModels}
                  title="从服务器刷新模型列表"
                  className="p-0.5 text-slate-400 hover:text-indigo-600 disabled:opacity-40 transition-colors"
                >
                  <RefreshCw size={11} className={isLoadingModels ? 'animate-spin text-indigo-600' : ''} />
                </button>
             </div>
             <a href="https://github.com" target="_blank" className="text-slate-400 hover:text-slate-900 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
             </a>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-row overflow-hidden bg-slate-50">
        <div className="w-[480px] flex-shrink-0 border-r border-slate-100 shadow-soft z-10">
            <Editor 
              content={content} 
              onChange={handleEditorChange} 
              onOptimize={handleOptimize}
              isOptimizing={isOptimizing}
              selectedModel={selectedModel}
              models={models}
            />
        </div>

        <div className="flex-1 relative overflow-hidden flex flex-col">
           <div className="absolute inset-0 pattern-grid opacity-100 pointer-events-none"></div>
           <div className="w-full h-full overflow-auto flex p-12 items-start justify-center custom-scrollbar">
              <div className="flex-shrink-0 shadow-premium rounded-xl overflow-hidden bg-white ring-8 ring-white/10">
                  <PreviewCard 
                    ref={previewRef}
                    content={content}
                    theme={theme}
                    scale={scale}
                    width={width}
                    lineHeight={lineHeight}
                    footerText={footerText}
                    watermarkSettings={watermarkSettings}
                    avatarImage={avatarImage}
                  />
              </div>
           </div>
        </div>

        <div className="w-[340px] flex-shrink-0 z-10">
             <Controls 
                currentTheme={theme} 
                setTheme={setTheme}
                customThemes={customThemes}
                scale={scale}
                setScale={setScale}
                width={width}
                setWidth={setWidth}
                lineHeight={lineHeight}
                setLineHeight={setLineHeight}
                footerText={footerText}
                setFooterText={setFooterText}
                watermarkSettings={watermarkSettings}
                setWatermarkSettings={setWatermarkSettings}
                avatarImage={avatarImage}
                setAvatarImage={setAvatarImage}
                onDownload={handleDownloadClick}
                onLuckyClick={handleLuckyClick}
                isDownloading={downloadPhase !== 'idle'}
                downloadButtonText={getDownloadButtonText()}
              />
        </div>
      </main>
      
      {/* Modals */}
      <Modal 
        isOpen={showOptWarning}
        title="升级卡片美感"
        desc="检测到您尚未进行 AI 排版优化。AI 可以自动提取重点、优化段落结构并美化链接。"
        icon={AlertTriangle}
        actions={
          <>
            <button onClick={() => handleOptimize('standard')} className="w-full py-4 bg-indigo-600 text-white rounded-[1.25rem] font-black text-sm shadow-soft hover:bg-indigo-700 transition-all">一键 AI 智能排版</button>
            <button onClick={() => { setShowOptWarning(false); !avatarImage ? setShowAvatarWarning(true) : performDownload(); }} className="w-full py-3 text-slate-400 font-bold text-sm hover:text-slate-600">跳过，直接导出</button>
          </>
        }
      />

      <Modal 
        isOpen={showAvatarWarning}
        title="打造个人品牌"
        desc="尚未设置头像。添加头像可以显著增加卡片的辨识度和品牌感。"
        icon={User}
        actions={
          <>
            <button onClick={() => setShowAvatarWarning(false)} className="w-full py-4 bg-indigo-600 text-white rounded-[1.25rem] font-black text-sm shadow-soft hover:bg-indigo-700 transition-all">去上传头像</button>
            <button onClick={() => { setShowAvatarWarning(false); performDownload(); }} className="w-full py-3 text-slate-400 font-bold text-sm hover:text-slate-600">暂不添加，导出图片</button>
          </>
        }
      />

      {/* Lucky Feature Modal */}
      <Modal
        isOpen={showLuckyModal}
        title="AI 实时灵感实验室"
        icon={Dices}
        actions={
          <div className="flex gap-3">
             <button onClick={() => setShowLuckyModal(false)} className="flex-1 py-3 text-slate-400 font-bold text-sm hover:bg-slate-50 rounded-xl transition-colors">取消</button>
             <button 
                onClick={applyLuckyTheme} 
                disabled={!previewTheme}
                className={`flex-1 py-4 rounded-xl font-black text-sm shadow-soft transition-all ${previewTheme ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}
             >
                确认应用设计方案
             </button>
          </div>
        }
      >
        <div className="w-full text-left space-y-6">
           <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">灵感源泉 (最新热点)</span>
                <span className="text-[9px] font-bold text-slate-300 italic">基于实时搜索：{new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })}</span>
              </div>
              <button onClick={fetchTopics} disabled={isLoadingTopics} className="text-indigo-600 hover:text-indigo-700 transition-colors p-2 rounded-full hover:bg-indigo-50">
                <RefreshCw size={14} className={isLoadingTopics ? 'animate-spin' : ''} />
              </button>
           </div>
           
           <div className="flex flex-wrap gap-2">
              {isLoadingTopics ? (
                Array.from({length: 4}).map((_, i) => <div key={i} className="h-9 w-24 bg-slate-100 animate-pulse rounded-xl"></div>)
              ) : (
                luckyTopics.map(topic => (
                  <button
                    key={topic}
                    onClick={() => handleTopicSelect(topic)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${selectedTopic === topic ? 'bg-indigo-600 border-indigo-600 text-white scale-105 shadow-md shadow-indigo-100' : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600'}`}
                  >
                    {topic}
                  </button>
                ))
              )}
           </div>

           {previewTheme && (
             <div className="space-y-4 pt-2 border-t border-slate-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between">
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">配色不满意？</span>
                   <button 
                    onClick={handleRegenerateTheme}
                    disabled={isGeneratingTheme}
                    className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black hover:bg-slate-200 transition-all"
                   >
                     <Wand2 size={12} />
                     再次刷新配色
                   </button>
                </div>

                <div className="space-y-3">
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">挂件选择 (Avatar & Title)</span>
                   <div className="flex gap-3">
                      {previewDecorations.map((dec, i) => (
                        <button 
                          key={i} 
                          onClick={() => setPreviewTheme({...previewTheme, avatarDecoration: dec})}
                          className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-all border-2 ${previewTheme.avatarDecoration === dec ? 'bg-indigo-50 border-indigo-500 scale-110 shadow-sm' : 'bg-white border-slate-100 hover:border-slate-300'}`}
                        >
                          {dec}
                        </button>
                      ))}
                   </div>
                </div>
             </div>
           )}

           <div className="space-y-3">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">最终方案预览 (UI 模式)</span>
              <div className="w-full aspect-[16/10] rounded-2xl border border-slate-100 overflow-hidden relative shadow-inner bg-slate-50 flex items-center justify-center group">
                 {isGeneratingTheme ? (
                   <div className="flex flex-col items-center gap-3">
                      <Loader2 size={24} className="animate-spin text-indigo-400" />
                      <span className="text-xs font-bold text-slate-400 animate-pulse tracking-tight">AI 正在进行 UI 设计...</span>
                   </div>
                 ) : previewTheme ? (
                   <div className={`absolute inset-0 p-6 ${previewTheme.bgClass} animate-in fade-in zoom-in-95 duration-500 flex items-center justify-center`}>
                      <div className={`w-full max-w-[90%] p-6 rounded-2xl shadow-xl ${previewTheme.containerClass} ${previewTheme.fontFamily} border border-white/10`}>
                         <div className={`flex items-center gap-2 mb-4 ${previewTheme.titleClass}`}>
                            {previewTheme.avatarDecoration && <span className="text-lg">{previewTheme.avatarDecoration}</span>}
                            <div className={`h-3 w-1/2 rounded bg-current opacity-30`}></div>
                            {previewTheme.avatarDecoration && <span className="text-lg transform scale-x-[-1]">{previewTheme.avatarDecoration}</span>}
                         </div>
                         <div className="space-y-3">
                            <div className="flex items-center gap-2">
                               <div className="w-1.5 h-1.5 rounded-full bg-slate-400/30"></div>
                               <div className="h-2 w-full bg-slate-400/10 rounded"></div>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                               <div className="h-1.5 w-3/4 bg-slate-400/5 rounded"></div>
                            </div>
                            <div className="flex items-center gap-2">
                               <div className="w-1.5 h-1.5 rounded-full bg-slate-400/30"></div>
                               <div className="h-2 w-2/3 bg-slate-400/10 rounded"></div>
                            </div>
                         </div>
                         <div className="mt-6 pt-4 border-t border-slate-200/20 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                               <div className="relative w-6 h-6">
                                 <div className="w-full h-full rounded-full bg-slate-300/30 border border-current opacity-20"></div>
                                 <div className="absolute -top-1 -right-1 text-[10px]">{previewTheme.avatarDecoration}</div>
                               </div>
                               <div className="h-1.5 w-12 bg-slate-300/30 rounded"></div>
                            </div>
                            <div className="text-[9px] font-black opacity-30 tracking-widest">{previewTheme.name}</div>
                         </div>
                      </div>
                   </div>
                 ) : (
                   <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-300">
                        <Palette size={24} strokeWidth={1.5} />
                      </div>
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest text-center px-10">请从上方灵感源泉中选择一个话题，AI 将为您定制专属 UI 设计</span>
                   </div>
                 )}
              </div>
           </div>
        </div>
      </Modal>

      <style>{`
        .pattern-grid {
          background-color: #f8fafc;
          background-image: 
            linear-gradient(45deg, #f1f5f9 25%, transparent 25%),
            linear-gradient(-45deg, #f1f5f9 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, #f1f5f9 75%),
            linear-gradient(-45deg, transparent 75%, #f1f5f9 75%);
          background-size: 20px 20px;
          background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
        }
      `}</style>
    </div>
  );
};

export default App;