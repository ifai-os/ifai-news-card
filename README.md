# NoteSnap - AI 大事件海报生成器 📸✨

> 基于 Google Gemini AI 的精美信息卡片与大事件海报生成工具。将杂乱的文字动态、要闻列表一键转化为极具设计感、适合社交媒体分享的高清长图。

[![React 19](https://img.shields.io/badge/React-19.2-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?logo=vite)](https://vitejs.dev/)
[![Gemini](https://img.shields.io/badge/Google%20GenAI-SDK%201.34-4285F4?logo=google)](https://ai.google.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

---

## ✨ 核心特性

- 🤖 **Gemini 智能排版**：输入杂乱的新闻要点、日报或事件更新，AI 自动提炼、排版为规范的 Markdown 结构，并完好保留所有链接与实体加粗。
- ⚡ **最新模型动态拉取**：默认采用 Google 官方推荐的 `Gemini Flash (Latest)` 极速端点，支持在顶部下拉框中动态拉取当前可用的全部 Gemini 模型。
- 🎨 **丰富预设与设计主题**：提供经典白、柔和渐变、暗黑极简、暖阳琥珀等多种现代设计卡片风格，支持多字体（黑体、衬线、等宽）与边距自由调整。
- 🔮 **AI 灵感热点与主题生成**：借助 Google Search Grounding 获取实时热点新闻与节日灵感，一键基于主题自动设计专属卡片配色与装饰 Emoji。
- 💧 **个性化防伪水印**：支持自定义底部昵称、个性头像上传以及防盗用水印平铺，支持调节透明度与间距。
- 📥 **高清长图一键导出**：基于 `html-to-image` 渲染引擎，多阶段保证字体渲染完整，导出适合小红书、朋友圈、即刻、Twitter 分享的高分辨率无损 PNG 图片。

---

## 🛠️ 技术栈

- **前端框架**：React 19 + TypeScript
- **构建工具**：Vite 6
- **样式系统**：Tailwind CSS
- **AI SDK**：Google Gen AI SDK (`@google/genai`)
- **图标库**：Lucide React
- **Markdown 渲染**：`react-markdown`
- **图片导出**：`html-to-image`

---

## 🚀 快速上手 (本地运行)

### 1. 克隆仓库

```bash
git clone https://github.com/your-username/notesnap-ai-card-generator.git
cd notesnap-ai-card-generator
```

### 2. 安装依赖

推荐使用 Node.js 18+ 环境：

```bash
npm install
# 或者使用 pnpm / yarn / bun
# pnpm install
# bun install
```

### 3. 配置环境变量

复制环境变量模版并填入你的 Google Gemini API Key：

```bash
cp .env.example .env
```

打开 `.env` 文件，填入从 [Google AI Studio](https://aistudio.google.com/app/apikey) 申请的 API Key：

```env
VITE_GEMINI_API_KEY=AIzaSy...你的Gemini密钥
```

配置项必须使用 `VITE_` 前缀；修改 `.env` 后需要重启 `npm run dev`。未配置 Key 时，海报编辑和导出仍可使用，AI 排版、热点与主题生成功能会提示配置方式。

### 4. 启动本地开发服务

```bash
npm run dev
```

在浏览器中打开 `http://localhost:3000` 即可开始使用。

### 5. 构建生产版本

```bash
npm run build
```

打包构建产物将输出在 `dist/` 目录下。

---

## 📂 项目目录结构

```text
├── components/          # UI 业务组件
│   ├── Controls.tsx     # 右侧控制面板（主题、排版、水印、底栏）
│   ├── Editor.tsx       # 左侧文本输入与 Markdown 编辑器
│   └── PreviewCard.tsx  # 中间卡片实时预览与海报渲染组件
├── services/
│   └── geminiService.ts # Gemini API 交互层（流式排版、动态模型列表、热点与主题生成）
├── assets/              # 静态资源文件与默认头像
├── App.tsx              # 应用主界面与全局状态编排
├── constants.ts         # 预设主题、兜底模型列表与初始文本
├── types.ts             # TypeScript 类型定义
├── .env.example         # 环境变量示例文件（防泄露模版）
├── .gitignore           # Git 忽略配置（已忽略所有密钥与构建产物）
├── index.html           # 页面 HTML 入口
├── package.json         # 项目依赖与运行脚本
└── vite.config.ts       # Vite 配置文件
```

---

## 🔒 开源发布与安全说明

1. **绝对不要将 `.env` 提交到公开仓库**：
   - 项目自带的 `.gitignore` 已配置过滤所有 `.env`、`.env.*` 文件和 `dist/` 构建目录。
   - 本项目是纯前端应用，`VITE_GEMINI_API_KEY` 会在构建后提供给浏览器。请仅在个人本地使用或受信任的内部环境使用该配置。

2. **生产环境部署建议**：
   - 不要将带有真实 Key 的纯静态构建产物公开部署。
   - 面向外部用户部署时，请将 Gemini 调用改为由服务端接口代理，并在服务端环境变量中保存 Key。

---

## 📄 开源协议

本项目基于 [MIT License](./LICENSE) 协议开源。欢迎自由 Fork、修改和分发。
