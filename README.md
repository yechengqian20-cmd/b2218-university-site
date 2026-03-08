# B2218大学 - 免费个人官网发布指南

## 1. 新建 GitHub 仓库
- 仓库名建议：`b2218-university-site`
- 设为 Public

## 2. 在本地推送代码
在 `D:\CODEX\b2218-university-site` 目录执行：

```bash
git init
git add .
git commit -m "init site"
git branch -M main
git remote add origin https://github.com/<你的GitHub用户名>/b2218-university-site.git
git push -u origin main
```

## 3. 开启 GitHub Pages
- 打开仓库 -> Settings -> Pages
- Source 选择 `Deploy from a branch`
- Branch 选择 `main` / `(root)`
- 保存后等待 1-3 分钟

## 4. 免费网址
默认会得到：
`https://<你的GitHub用户名>.github.io/b2218-university-site/`

如果你希望更短的网址，也可以把仓库名改成：
`<你的GitHub用户名>.github.io`
这样地址就是：
`https://<你的GitHub用户名>.github.io/`
