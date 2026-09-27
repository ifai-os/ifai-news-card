import React, { forwardRef, useMemo, useState, useEffect } from 'react';
import { ThemeConfig, WatermarkSettings } from '../types';
import ReactMarkdown from 'react-markdown';

interface PreviewCardProps {
  content: string;
  theme: ThemeConfig;
  scale: number;
  width: number;
  footerText: string;
  watermarkSettings: WatermarkSettings;
  avatarImage: string | null;
  lineHeight: number;
}

export const PreviewCard = forwardRef<HTMLDivElement, PreviewCardProps>(
  ({ content, theme, scale, width, footerText, watermarkSettings, avatarImage, lineHeight }, ref) => {
    const [imgError, setImgError] = useState(false);
    
    // Reset error state when avatar image changes
    useEffect(() => {
        setImgError(false);
    }, [avatarImage]);

    // Pre-process content to convert raw URLs into Markdown links.
    const processedContent = useMemo(() => {
        return content.replace(/(^|[\s\n])(https?:\/\/[^\s]+)/g, '$1[$2]($2)');
    }, [content]);

    // Create a robust repeated pattern using HTML elements
    const renderWatermark = () => {
        if (!watermarkSettings.show) return null;
        
        // Use footer text or default if empty
        const text = footerText ? `@${footerText}` : '@NoteSnap';
        
        // Generate enough items to cover the rotated area
        const items = Array.from({ length: 600 }).map((_, i) => (
            <span 
                key={i} 
                className="whitespace-nowrap font-bold select-none"
                style={{ 
                    fontSize: `${watermarkSettings.size}px`,
                    color: theme.accentColor 
                }}
            >
                {text}
            </span>
        ));

        return (
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
                <div 
                    className="absolute inset-[-150%] w-[400%] h-[400%] flex flex-wrap items-center justify-center"
                    style={{ 
                        transform: 'rotate(-25deg)',
                        gap: `${watermarkSettings.gap}px`,
                        opacity: watermarkSettings.opacity
                    }}
                >
                    {items}
                </div>
            </div>
        );
    };

    const hasAvatar = avatarImage && !imgError;

    return (
      <div 
        ref={ref}
        className={`mx-auto transition-all duration-300 ease-in-out relative flex flex-col`}
        style={{
           width: `${width}px`,
           minHeight: 'auto', 
           backgroundColor: theme.bgClass.startsWith('bg-') ? undefined : theme.bgClass
        }}
      >
        {/* Background container wrapper */}
        <div className={`absolute inset-0 z-0 ${theme.bgClass}`}></div>

        {/* Main Content Card Wrapper */}
        <div className="relative z-10 p-6 md:p-8 flex-1 flex flex-col">
            
            <div 
                className={`w-full p-8 md:p-10 rounded-xl ${theme.containerClass} ${theme.fontFamily} relative overflow-hidden`}
                style={{ fontSize: `${scale}rem`, lineHeight: lineHeight }}
            >
                {/* Watermark Layer */}
                {renderWatermark()}

                {/* Content Layer */}
                <div className="relative z-10">
                    <ReactMarkdown
                        components={{
                            h1: ({node, ...props}) => (
                                <h1 className={`text-2xl md:text-3xl font-black tracking-tight flex items-center gap-3 ${theme.titleClass}`} style={{ lineHeight: 1.25 }}>
                                  {theme.avatarDecoration && <span className="flex-shrink-0 opacity-90">{theme.avatarDecoration}</span>}
                                  <span {...props} />
                                  {theme.avatarDecoration && <span className="flex-shrink-0 opacity-90 transform scale-x-[-1]">{theme.avatarDecoration}</span>}
                                </h1>
                            ),
                            h2: ({node, ...props}) => (
                                <h2 className={`text-xl md:text-2xl font-bold tracking-tight mt-6 mb-3 ${theme.titleClass}`} style={{ lineHeight: 1.3 }} {...props} />
                            ),
                            h3: ({node, ...props}) => (
                                <h3 className={`text-lg md:text-xl font-bold tracking-tight mt-5 mb-2.5 ${theme.titleClass}`} style={{ lineHeight: 1.3 }} {...props} />
                            ),
                            p: ({node, ...props}) => (
                                <p className="mb-3.5 opacity-95 break-words" style={{ lineHeight }} {...props} />
                            ),
                            ul: ({node, ...props}) => (
                                <ul className="space-y-3.5 my-3" {...props} />
                            ),
                            ol: ({node, ...props}) => (
                                <ol className="space-y-3.5 my-3 list-decimal list-inside" {...props} />
                            ),
                            li: ({node, ...props}) => (
                                <li className={`leading-normal ${theme.itemClass}`} style={{ lineHeight }} {...props} />
                            ),
                            strong: ({node, ...props}) => (
                                <strong className="font-extrabold opacity-100 px-0.5 rounded-sm" style={{ color: theme.accentColor }} {...props} />
                            ),
                            a: ({node, ...props}) => (
                                 <a 
                                   className={`inline-flex items-center gap-1.5 max-w-full break-all opacity-80 text-[0.85em] my-0.5 font-mono ${theme.linkClass}`} 
                                   target="_blank"
                                   rel="noopener noreferrer"
                                   {...props} 
                                 />
                            ),
                            blockquote: ({node, ...props}) => (
                                <blockquote className="border-l-4 pl-4 italic opacity-85 my-4 bg-black/5 p-3 rounded-r text-[0.95em]" style={{ borderColor: theme.accentColor, lineHeight: 1.5 }} {...props} />
                            )
                        }}
                    >
                        {processedContent}
                    </ReactMarkdown>

                    {/* Footer Section */}
                    <div className={`mt-12 pt-6 border-t flex items-center justify-between text-sm font-semibold tracking-wide ${theme.footerClass}`}>
                        <div className="flex items-center gap-3">
                           <div className="relative">
                               {hasAvatar && (
                                   <img 
                                     src={avatarImage!} 
                                     alt="Avatar" 
                                     className="w-8 h-8 rounded-full object-cover border border-current shadow-sm"
                                     onError={() => setImgError(true)}
                                   />
                               )}
                               {/* Avatar Decoration / Seasonal Overlay */}
                               {theme.avatarDecoration && (
                                   <div className="absolute -top-1.5 -right-1.5 text-lg pointer-events-none select-none drop-shadow-sm">
                                       {theme.avatarDecoration}
                                   </div>
                               )}
                               {!hasAvatar && !theme.avatarDecoration && <span className="opacity-50">@</span>}
                           </div>
                           
                           <span>
                             {footerText || "NoteSnap AI"}
                           </span>
                        </div>
                        <span className="opacity-80 font-mono text-xs uppercase">{new Date().toLocaleDateString('zh-CN')}</span>
                    </div>
                </div>
            </div>
        </div>
      </div>
    );
  }
);

PreviewCard.displayName = 'PreviewCard';