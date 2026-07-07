# 我的菜谱 PWA

一个 mobile-first 的个人菜谱 PWA，用 React、TypeScript、Vite 和 IndexedDB 构建。数据默认保存在当前浏览器本地，不需要登录，不需要后端。

## 本地运行

推荐使用 pnpm：

```bash
pnpm install
pnpm dev
```

打开终端显示的本机地址：

```text
http://localhost:5173/
```

也可以用 npm：

```bash
npm install
npm run dev
```

## iPhone 局域网测试

1. 确认电脑和 iPhone 连接同一个 Wi-Fi。
2. 启动开发服务器：

```bash
pnpm dev
```

3. 终端会显示类似这样的地址：

```text
Network: http://172.20.10.9:5173/
```

4. 在 iPhone Safari 打开这个 `Network` 地址。

局域网测试依赖电脑开着，因为这是本地开发服务器。部署上线后就不依赖电脑。

## 构建检查

每次准备部署前先运行：

```bash
pnpm build
```

构建产物会生成到 `dist/`。

也可以本地预览生产构建：

```bash
pnpm preview
```

## 添加到 iPhone 主屏幕

部署上线后，用 iPhone Safari 打开线上网址：

1. 点 Safari 底部分享按钮。
2. 选择“添加到主屏幕”。
3. 确认名称后添加。

之后可以像 App 一样从主屏幕打开。PWA 数据仍保存在这个站点对应的 Safari 本地存储里。

## 部署到 Cloudflare Pages

推荐使用 Cloudflare Pages，免费、适合静态 PWA，不需要电脑一直在线。

1. 把项目推送到 GitHub 仓库。
2. 登录 Cloudflare Dashboard。
3. 进入 Workers & Pages。
4. 选择 Create application。
5. 选择 Pages，然后连接 GitHub 仓库。
6. 构建设置填写：

```text
Framework preset: Vite
Build command: pnpm build
Build output directory: dist
Root directory: /
```

7. 部署完成后，Cloudflare 会给一个 `*.pages.dev` 域名。

项目已包含：

```text
public/_redirects
```

这个文件用于让详情页、编辑页等前端路由在线上刷新时仍返回 `index.html`，避免 404。

## 部署到 GitHub Pages

GitHub Pages 也免费，但如果使用 `用户名.github.io/仓库名/` 这种子路径，Vite 需要额外配置 `base`，React Router 也需要额外处理刷新路由的问题。

更省心的方式：

- 优先用 Cloudflare Pages。
- 或者给 GitHub Pages 绑定自定义域名，并部署到域名根路径。

如果一定要部署到 GitHub Pages 的仓库子路径，需要再调整：

```ts
// vite.config.ts
export default defineConfig({
  base: "/你的仓库名/",
  plugins: [react()],
});
```

并额外处理前端路由刷新问题。

## 数据备份

菜谱数据保存在当前浏览器本地 IndexedDB。换手机、清除 Safari 数据、换浏览器之前，请先在“数据备份”页面导出 JSON。

恢复时进入“数据备份”页面，选择 JSON 文件后可以：

- 合并：保留现有菜谱，并导入备份。
- 覆盖：清空现有菜谱，再导入备份。

## 常用命令

```bash
pnpm dev       # 本地开发
pnpm build     # 生产构建
pnpm preview   # 本地预览生产构建
```
