# 枫之谷 (blog.realduang.com)

Author: Duang | VuePress 2 + vuepress-theme-reco | 2016-present

## Project Structure

```
blogs/
  architecture/              → 架构设计
  frontend-basics/           → 前端基础
  frontend-tech-institute/   → 前端技术研究院
  ai/                        → AI和机器学习
  financial-analysis/        → 金融分析
  others/                    → 其他
  vscode-for-web/            → VSCode For Web 深入浅出
draft/                       → Draft articles (not published)
scripts/
  diagrams/                  → Blog diagram generation toolkit
  sync/                      → Blog sync tool (cross-platform publishing)
  video/                     → Blog-to-video rendering pipeline
```

New categories (create directory when first used):
- `ai-frontier/` → AI前沿

## Image Hosting

- **CDN**: `https://zakum-1252497671.cos.ap-guangzhou.myqcloud.com/`
- **Upload**: `picgo upload <file>` (Tencent COS, `tcyun` uploader)
- **Upload path**: `images/coding-agent-2026/` prefix
- **Markdown**: `![alt](https://zakum-1252497671.cos.ap-guangzhou.myqcloud.com/images/coding-agent-2026/<filename>.png)`

## Skills

- `/write-blog` — Write a blog post following Duang's style and workflow
- `/make-video` — Blog-to-video rendering pipeline (scenes → TTS → Remotion → MP4)
