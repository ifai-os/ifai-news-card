
export interface ThemeConfig {
  id: string;
  name: string;
  bgClass: string;
  containerClass: string;
  titleClass: string;
  itemClass: string;
  linkClass: string;
  footerClass: string;
  fontFamily: 'font-sans' | 'font-serif' | 'font-mono';
  accentColor: string;
  showWatermark: boolean;
  isCustom?: boolean;
  avatarDecoration?: string; // e.g., an emoji or a specific icon name
}

export type TextAlignment = 'left' | 'center';

export interface GeneratedContent {
  title: string;
  items: Array<{
    id: string;
    text: string;
    link?: string;
  }>;
  markdown: string;
}

export interface WatermarkSettings {
  show: boolean;
  size: number;
  gap: number;
  opacity: number;
}

export interface ModelOption {
  id: string;
  name: string;
  badge: string;
  description: string;
  type: 'flash' | 'pro' | 'lite';
}