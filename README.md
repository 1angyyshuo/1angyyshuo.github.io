# Lokaive Blog

这是一个基于 Hexo + Butterfly 的个人博客项目，适合部署到 GitHub Pages。

## 本地开发

```bash
npm install
npm run server
```

默认预览地址是 `http://localhost:4000`。

Windows 下也可以双击或运行：

```bat
start-local.cmd
```

## 新建文章

```bash
npm run new "文章标题"
```

文章会生成到 `source/_posts`。

## GitHub Pages 部署

1. 把 `_config.yml` 里的 `url` 改成你的 Pages 地址。
   - 当前已按主页站配置：仓库名 `1angyyshuo.github.io`，`url` 为 `https://1angyyshuo.github.io`，`root` 为 `/`。
   - 如果以后改成普通项目仓库，比如 `blog`：`url` 改成 `https://1angyyshuo.github.io/blog`，`root` 改成 `/blog/`。
2. 把 `_config.butterfly.yml` 里的 GitHub 用户名、邮箱和个人介绍改成你的信息。
3. 推送到 GitHub 仓库的 `main` 分支。
4. 在 GitHub 仓库设置里打开 `Settings -> Pages`，`Source` 选择 `GitHub Actions`。

之后每次 push，GitHub Actions 会自动构建并发布站点。
