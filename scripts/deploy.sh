#!/usr/bin/env sh
# 确保脚本抛出遇到的错误
set -e

npm ci
npm run build # 生成静态文件

# deploy to github
if [ -z "$GITHUB_ACTIONS_TOKEN" ]; then
  msg='deploy'
  githubUrl=git@github.com:realDuang/blog.git
else
  msg='来自github action的自动部署'
  githubUrl=https://realDuang:${GITHUB_ACTIONS_TOKEN}@github.com/realDuang/blog.git
fi

cd public # 进入生成的文件夹
git config --global user.name "realDuang"
git config --global user.email "250407778@qq.com"
git config --global init.defaultBranch main
git init
git add -A
git commit -m "${msg}"
git push -f $githubUrl main:gh-pages # 推送到github
