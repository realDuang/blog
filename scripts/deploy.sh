#!/usr/bin/env sh
# 确保脚本抛出遇到的错误
set -e
npm run build # 生成静态文件
cd public # 进入生成的文件夹

# deploy to github
if [ -z "$GITHUB_TOKEN" ]; then
  msg='deploy'
  githubUrl=git@github.com:realduang/blog.git
else
  msg='来自github action的自动部署'
  githubUrl=https://realduang:${GITHUB_TOKEN}@github.com/realduang/blog.git
  git config --global user.name "realduang"
  git config --global user.email "250407778@qq.com"
fi
git init
git add -A
git commit -m "${msg}"
git push -f $githubUrl master:gh-pages # 推送到github
