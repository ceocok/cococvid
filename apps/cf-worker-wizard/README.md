# Cloudflare Worker 部署向导（Next.js）

一个基于 Next.js 14（App Router）+ TypeScript + Tailwind + shadcn/ui 的小工具，帮助你在 5 个步骤内完成：

1. 验证 API Token（不保存）
2. 解析访问域名所属 Zone
3. 部署 Worker（根据模板自动替换“访问域名/目标域名/备用”）
4. 创建/更新路由（将 `*{accessDomain}/*` 绑定到脚本）
5. 创建/更新 CNAME 记录（默认为 `cdns.doon.eu.org`）

注意：
- 所有 API 调用均在服务器端完成，不会持久化 Token。
- 内置基础速率限制（每 IP 每分钟约 60 次）。
- 若记录或路由已存在则进行更新，保持幂等。

## 本地运行

在项目根目录：

```bash
pnpm install
pnpm dev
# 或者
npm install
npm run dev
```

开发服务启动后，访问 http://localhost:3000 查看向导。

## 使用说明

准备：
- Cloudflare API Token（需要相应权限：Workers Scripts、Workers Routes、Zone DNS 等）
- Cloudflare Account ID（从仪表盘获取）

流程：
1. 在“凭证”步骤输入 Token 与 Account ID，点击“验证并继续”。
2. 在“域名”步骤输入访问域名（例如：mv.cococ.co）、目标域名（被代理的站点域名），可选填“备用域名”。点击“解析所属 Zone”，成功后自动进入下一步。
3. 在“部署 Worker”步骤可调整脚本名，确认自动生成的代码预览后点击“部署”。
4. 在“绑定路由”步骤会自动生成 `*{accessDomain}/*` 路由，点击“创建/更新”。
5. 在“DNS 配置”步骤可自定义 CNAME 指向，不填则使用 `cdns.doon.eu.org`，点击“创建/更新”。
6. 完成后在“总结”页面查看脚本名、路由模式与 DNS 指向。

## 端到端示例

访问域名：`mv.cococ.co`
- 路由：`*mv.cococ.co/*` 绑定到部署的 Worker
- DNS：`mv.cococ.co` CNAME -> `cdns.doon.eu.org`（代理开启）

## 目录结构

- apps/cf-worker-wizard
  - app/ 页面与 API 路由
  - components/ui/ 轻量 shadcn UI 组件
  - lib/ 工具与 Cloudflare API 封装

## 部署

此项目为 Next.js 应用，可部署到任意支持 Next.js 的平台（Vercel、Netlify、Cloudflare Pages Functions 等）。无需配置环境变量，Token 在会话内填写并通过服务端 API 使用，不会落盘。
