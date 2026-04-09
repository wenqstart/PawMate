---
name: git-commit-tool
description: Git 提交辅助工具，支持选择提交类型、输入提交信息、自动生成规范的 commit message 并 push 到远程仓库
---

## Git Commit Skill

当用户说"提交代码"、"commit"或类似意图时，执行以下流程：

### 1. 询问提交类型

使用 AskUserQuestion 工具一次性展示所有类型供选择：

- `feat` - ✨ 新功能
- `fix` - 🐛 修复问题
- `refactor` - ♻️ 重构
- `docs` - 📝 文档更新
- `style` - 💄 代码格式调整
- `perf` - ⚡️ 性能优化
- `test` - ✅ 测试相关
- `chore` - 🔧 构建/工具相关

### 2. 询问提交信息

选择类型后，提供两个选项供用户选择：

选项 1: **使用默认模版** - 直接使用该类型对应的默认提交信息
选项 2: **自定义输入** - 用户自行输入提交信息

### 3. 模板格式

各类型对应的默认模板：

- **feat**: `feat: ✨ 新功能`
- **fix**: `fix: 🐛 修复问题`
- **refactor**: `refactor: ♻️ 重构`
- **docs**: `docs: 📝 文档更新`
- **style**: `style: 💄 代码格式调整`
- **perf**: `perf: ⚡️ 性能优化`
- **test**: `test: ✅ 测试相关`
- **chore**: `chore: 🔧 构建/工具相关`

### 4. 执行提交

用户确认信息后，执行以下 git 命令：

```bash
git add -A
git commit -m "<type>: <emoji> <message>"
```

### 5. 推送到远程

提交成功后，自动执行 push：

```bash
git push
```

### 示例对话流程

1. 用户："提交代码"
2. 一次性展示 8 种提交类型，用户选择 "fix"
3. 询问：选择"使用默认模版"或"自定义输入"
   - 选择"使用默认模版" → 直接使用 `fix: 🐛 修复问题`
   - 选择"自定义输入" → 询问用户输入自定义内容
4. 执行 git commit 并自动 git push
