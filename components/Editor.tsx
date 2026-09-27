import React from 'react';
import { Hash, Sparkles, FileText, Loader2, WrapText } from 'lucide-react';
import { AIStyleType } from '../services/geminiService';
import { AVAILABLE_MODELS } from '../constants';
import { ModelOption } from '../types';

interface EditorProps {
  content: string;
  onChange: (value: string) => void;
  onOptimize: (style: AIStyleType) => void;
  isOptimizing: boolean;
  selectedModel?: string;
  models?: ModelOption[];
}

export const Editor: React.FC<EditorProps> = ({ content, onChange, onOptimize, isOptimizing, selectedModel, models }) => {
  const modelList = models && models.length > 0 ? models : AVAILABLE_MODELS;
  const activeModel = modelList.find(m => m.id === selectedModel);
  const modelDisplayName = activeModel ? activeModel.name : (selectedModel || 'Gemini Flash (Latest)');

  const handleFormatUrls = () => {
    const newContent = content.replace(/([^\n])\s+(https?:\/\/[^\s]+)/g, "$1\n$2");
    onChange(newContent);
  };

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Premium Toolbar */}
      <div className="flex items-center justify-between px-6 h-16 border-b border-slate-100 flex-shrink-0 bg-white/80 backdrop-blur-md z-20">
         
         {/* Left Tools */}
         <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
               <FileText size={16} />
            </div>
            <span className="text-sm font-bold text-slate-700">编辑内容</span>
         </div>

         {/* Right Action: AI Optimize & Helpers */}
         <div className="flex items-center gap-3">
            <button
                type="button"
                onClick={handleFormatUrls}
                className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all active:scale-90"
                title="链接自动换行"
            >
                <WrapText size={18} />
            </button>
            <button
                type="button"
                onClick={() => onOptimize('standard')}
                disabled={isOptimizing}
                title={`当前模型: ${modelDisplayName} (点击执行 AI 智能排版)`}
                className={`
                    flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm select-none
                    ${isOptimizing 
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-transparent' 
                        : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-200 active:scale-95 border-indigo-600'
                    }
                `}
            >
                {isOptimizing ? (
                    <Loader2 size={14} className="animate-spin" />
                ) : (
                    <Sparkles size={14} className="text-indigo-200" />
                )}
                <span>{isOptimizing ? '优化中...' : 'AI 智能排版'}</span>
            </button>
         </div>
      </div>

      {/* Text Area */}
      <div className="flex-1 relative overflow-hidden">
        <textarea
          className="absolute inset-0 w-full h-full p-8 resize-none outline-none text-slate-700 font-mono text-sm leading-relaxed placeholder:text-slate-300 bg-transparent selection:bg-indigo-100 selection:text-indigo-900 scroll-p-8 custom-scrollbar"
          placeholder="在此输入内容...&#10;&#10;支持 Markdown 语法。&#10;点击右上角 AI 按钮可自动美化排版。"
          value={content}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
        />
      </div>
      
      {/* Minimal Footer */}
      <div className="px-6 py-3 bg-slate-50/50 text-[11px] font-bold text-slate-400 border-t border-slate-100 flex justify-between items-center flex-shrink-0 select-none">
        <div className="flex items-center gap-2 opacity-60 uppercase tracking-widest">
            <Hash size={12} />
            <span>Markdown Mode</span>
        </div>
        <div className="flex items-center gap-4">
            <span className="font-mono">{content.split(/\s+/).filter(x => x).length} 词</span>
            <span className="font-mono">{content.length} 字符</span>
        </div>
      </div>
    </div>
  );
};