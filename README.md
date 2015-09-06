# GitHub bot automating project management tasks using GitHub issues.

## Features

### 通过commit message为issue打label
在commit message包含一定格式的指令，即可为issue打上各种label。

- `Labeling feature t:done #1` 将issue 1标记为`done` 
- `This commit t:done,task #1, #7` 将issue 1和7标记为`done`和`task`
- `t:done #1, #7, and t:demo,draft #10` 允许多指令
- 支持引用别的repo，如 `t:done user/repo#3`

## Get started

1. 访问[此网址][ghbot]，授权ghbot访问你的repo，需要写权限以便自动设置[`Webhook`][gh-doc-webhook]
2. 在列表中选择需要监听的repo
3. Done，关闭网页

> 网页暂时还做得很粗糙，见谅

[ghbot]: https://ghbot.avosapps.com
[gh-doc-webhook]: https://developer.github.com/webhooks/

## Todo

### 周报、下周计划
### 与[Todoist][]同步
### 自动监听org的新repo

[Todoist]: https://todoist.com/overview