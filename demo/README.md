# hexo-bilibili-bangumi Demo

这个目录是 `hexo-bilibili-bangumi` 的可部署 Hexo 示例站，使用 Hexo 默认的 `landscape` 主题展示插件实际渲染效果。

## 本地预览

```bash
npm install
npm run build
npm run server
```

打开 `http://localhost:4000/bangumis/` 查看追番页面。

## Vercel 部署

在 Vercel 中导入本仓库后，将 Root Directory 设置为 `demo`。

- Build Command: `npm run build`
- Output Directory: `public`
- Install Command: `npm install`

`package.json` 通过 `file:..` 引用仓库根目录的插件代码，因此部署时会展示当前仓库中的插件效果。
