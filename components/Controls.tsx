import React, { useRef } from 'react';
import { ThemeConfig, WatermarkSettings } from '../types';
import { THEMES } from '../constants';
import { Smartphone, Monitor, Loader2, Check, ImagePlus, X, Settings2, Palette, ShieldCheck, MonitorDown, Dices, Sparkles } from 'lucide-react';

interface ControlsProps {
  currentTheme: ThemeConfig;
  setTheme: (theme: ThemeConfig) => void;
  customThemes: ThemeConfig[];
  scale: number;
  setScale: (scale: number) => void;
  width: number;
  setWidth: (width: number) => void;
  lineHeight: number;
  setLineHeight: (lineHeight: number) => void;
  footerText: string;
  setFooterText: (text: string) => void;
  watermarkSettings: WatermarkSettings;
  setWatermarkSettings: (settings: WatermarkSettings) => void;
  avatarImage: string | null;
  setAvatarImage: (img: string | null) => void;
  onDownload: () => void;
  onLuckyClick: () => void;
  isDownloading: boolean;
  downloadButtonText?: string;
}

export const Controls: React.FC<ControlsProps> = ({ 
  currentTheme, 
  setTheme, 
  customThemes,
  scale, 
  setScale,
  width,
  setWidth,
  lineHeight,
  setLineHeight,
  footerText,
  setFooterText,
  watermarkSettings,
  setWatermarkSettings,
  avatarImage,
  setAvatarImage,
  onDownload,
  onLuckyClick,
  isDownloading,
  downloadButtonText = '导出高清卡片'
}) => {
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const SectionHeader = ({ icon: Icon, title, action }: { icon: any, title: string, action?: React.ReactNode }) => (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 text-indigo-500">
          <Icon size={18} strokeWidth={2.5} />
        </div>
        <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-[0.15em]">{title}</h3>
      </div>
      {action}
    </div>
  );

  const Label = ({ children, value }: { children: React.ReactNode, value?: string | number }) => (
    <div className="flex justify-between items-center mb-2">
      <span className="text-xs font-bold text-slate-500">{children}</span>
      {value !== undefined && <span className="text-[10px] font-mono font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">{value}</span>}
    </div>
  );

  const allThemes = [...THEMES, ...customThemes];

  return (
    <div className="flex flex-col h-full bg-white border-l border-slate-100">
      
      <div className="px-6 h-16 flex items-center border-b border-slate-100 bg-slate-50/50">
        <Settings2 size={16} className="text-slate-400 mr-2" />
        <span className="text-sm font-bold text-slate-700">卡片设置</span>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-10 custom-scrollbar">
            
            <section>
              <SectionHeader 
                icon={Palette} 
                title="视觉主题" 
                action={
                  <button 
                    onClick={onLuckyClick}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black hover:bg-indigo-100 transition-colors border border-indigo-100"
                  >
                    <Dices size={12} />
                    手气不错
                  </button>
                }
              />
              <div className="grid grid-cols-2 gap-3">
                {allThemes.map((t) => {
                    const isActive = currentTheme.id === t.id;
                    return (
                        <button
                            key={t.id}
                            onClick={() => setTheme(t)}
                            className={`
                            relative h-20 rounded-xl transition-all overflow-hidden text-left flex flex-col justify-end
                            ring-offset-2 outline-none
                            ${isActive 
                                ? 'ring-2 ring-indigo-600 shadow-soft scale-[1.02]' 
                                : 'ring-1 ring-slate-100 hover:ring-slate-300 hover:scale-[1.01]'
                            }
                            `}
                        >
                            <div className={`absolute inset-0 ${t.bgClass}`}></div>
                            <div className="absolute inset-x-0 bottom-0 p-2.5 bg-white/95 backdrop-blur-sm border-t border-slate-100/50">
                                <span className="text-[10px] font-black truncate block text-slate-800 uppercase tracking-tighter">
                                {t.name}
                                </span>
                            </div>
                            {isActive && (
                                <div className="absolute top-2 right-2 bg-indigo-600 text-white rounded-full p-1 shadow-lg">
                                    <Check size={10} strokeWidth={4} />
                                </div>
                            )}
                            {t.isCustom && !isActive && (
                                <div className="absolute top-2 right-2 bg-amber-400 text-white rounded-full p-0.5 shadow-sm">
                                    <span className="text-[8px] px-1 font-bold">AI</span>
                                </div>
                            )}
                        </button>
                    )
                })}
              </div>
            </section>

            <section className="space-y-6">
                <SectionHeader icon={Smartphone} title="布局尺寸" />
                
                <div className="flex bg-slate-100 p-1 rounded-2xl mb-6">
                  <button
                    onClick={() => { setWidth(390); setScale(1.15); }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${width === 390 ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    <Smartphone size={14} strokeWidth={2.5} /> 适配手机
                  </button>
                  <button
                    onClick={() => { setWidth(600); setScale(1.0); }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${width === 600 ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    <Monitor size={14} strokeWidth={2.5} /> 宽屏展示
                  </button>
                </div>
                
                <div className="space-y-5">
                    <div>
                        <Label value={`${width}px`}>卡片宽度</Label>
                        <input 
                            type="range" min="350" max="800" step="10" value={width}
                            onChange={(e) => setWidth(parseInt(e.target.value))}
                            className="w-full h-1.5 bg-slate-100 rounded-full appearance-none cursor-pointer accent-indigo-600"
                        />
                    </div>

                    <div>
                        <Label value={`${Math.round(scale * 100)}%`}>字号缩放</Label>
                        <input 
                            type="range" min="0.8" max="1.4" step="0.05" value={scale}
                            onChange={(e) => setScale(parseFloat(e.target.value))}
                            className="w-full h-1.5 bg-slate-100 rounded-full appearance-none cursor-pointer accent-indigo-600"
                        />
                    </div>

                    <div>
                        <Label value={`${lineHeight.toFixed(2)}x`}>文本行高 (行间距)</Label>
                        <input 
                            type="range" min="1.2" max="2.2" step="0.05" value={lineHeight}
                            onChange={(e) => setLineHeight(parseFloat(e.target.value))}
                            className="w-full h-1.5 bg-slate-100 rounded-full appearance-none cursor-pointer accent-indigo-600"
                        />
                        <div className="flex justify-between text-[9px] font-bold text-slate-300 uppercase mt-1">
                            <span>紧凑 (1.20)</span>
                            <span>标准 (1.60)</span>
                            <span>宽松 (2.10)</span>
                        </div>
                    </div>
                </div>
            </section>

            <section className="space-y-6">
                <SectionHeader icon={ShieldCheck} title="版权水印" />
                
                <div className="flex gap-4 items-start">
                    <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                    <div className="relative group">
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="w-16 h-16 rounded-2xl border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-slate-50 flex items-center justify-center text-slate-400 hover:text-indigo-500 transition-all overflow-hidden shadow-sm"
                        >
                            {avatarImage ? (
                                <img src={avatarImage} className="w-full h-full object-cover" alt="Avatar" />
                            ) : (
                                <ImagePlus size={24} strokeWidth={1.5} />
                            )}
                        </button>
                        {avatarImage && (
                            <button 
                            onClick={(e) => { e.stopPropagation(); setAvatarImage(null); }}
                            className="absolute -top-2 -right-2 bg-white text-slate-500 rounded-full p-1 border border-slate-200 shadow-premium hover:text-red-500 transition-colors"
                            >
                            <X size={12} strokeWidth={3} />
                            </button>
                        )}
                    </div>
                    
                    <div className="flex-1">
                        <Label>署名文字</Label>
                        <input 
                            type="text" 
                            value={footerText}
                            onChange={(e) => setFooterText(e.target.value)}
                            className="w-full h-11 px-4 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 placeholder:text-slate-300 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all bg-white"
                            placeholder="署名"
                        />
                    </div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 space-y-4 border border-slate-100">
                    <div className="flex items-center justify-between">
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">全局水印</span>
                         <button 
                           onClick={() => setWatermarkSettings({...watermarkSettings, show: !watermarkSettings.show})}
                           className={`
                            relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
                            ${watermarkSettings.show ? 'bg-indigo-600' : 'bg-slate-200'}
                           `}
                         >
                            <span className="sr-only">Toggle Watermark</span>
                            <span
                              className={`
                                pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
                                ${watermarkSettings.show ? 'translate-x-5' : 'translate-x-0'}
                              `}
                            />
                         </button>
                    </div>

                    {watermarkSettings.show && (
                        <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-1">
                            <div>
                                <Label value={`${Math.round(watermarkSettings.opacity * 100)}%`}>透明度</Label>
                                <input 
                                    type="range" min="0.02" max="0.5" step="0.01" value={watermarkSettings.opacity}
                                    onChange={(e) => setWatermarkSettings({...watermarkSettings, opacity: parseFloat(e.target.value)})}
                                    className="w-full h-1 bg-slate-200 rounded-full appearance-none cursor-pointer accent-slate-400"
                                />
                            </div>
                            <div>
                                <Label value={`${watermarkSettings.gap}px`}>间距 (密集度)</Label>
                                <input 
                                    type="range" min="20" max="300" step="10" value={watermarkSettings.gap}
                                    onChange={(e) => setWatermarkSettings({...watermarkSettings, gap: parseInt(e.target.value)})}
                                    className="w-full h-1 bg-slate-200 rounded-full appearance-none cursor-pointer accent-slate-400"
                                    style={{ direction: 'rtl' }}
                                />
                                <div className="flex justify-between text-[9px] font-bold text-slate-300 uppercase mt-1">
                                   <span>稀疏</span>
                                   <span>密集</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>
      </div>

       <div className="p-6 border-t border-slate-100 bg-white">
         <button
            onClick={onDownload}
            disabled={isDownloading}
            className={`
                w-full h-14 rounded-2xl flex items-center justify-center gap-3 font-black text-sm text-white transition-all transform active:scale-[0.97] shadow-soft
                ${isDownloading 
                    ? 'bg-slate-800 cursor-wait' 
                    : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-premium'}
            `}
         >
            {isDownloading ? <Loader2 className="animate-spin" size={20} /> : <MonitorDown size={20} />}
            <span>{downloadButtonText}</span>
         </button>
       </div>
    </div>
  );
};