---
title: github 建立 repository 并上传工程的方法
categories: git
tags: git
abbrlink: '3e41'
date: 2017-07-02 23:46:32
---

这不是什么新知识了，自从我用 github 以来一直就是这么用着的，但是最近有一段时间没上传过自己的 project 了，竟然手生了忘了怎么做了。想了想还是记录下来比较好，也给大家分享分享。

由于是给自己做的备忘，怎么注册 github 之类的新手问题我就不说了，不懂的朋友可以自行去百度相关问题，很多的。

<!-- more -->

## 先 clone 再写入的方法（适用于还未开发项目时）

通常最简单最无脑的办法就是现在 github 网站上创建一个 repository，可以自己任意设定名字和 readme.md。之后通过：

```bash
git clone git@github.com:username/respositoryname.git
```

克隆到本地，之后往里面写入文件文件夹就行了。

写完想要提交到 github 的话，就输入如下命令：

```bash
git pull
git add .
git commit -m "first commit"
git push origin master
```

这里最好先 git pull 一下，以免有冲突导致提交不成功。

## 对本地项目 git init 再提交（适用于项目已经成型，想要在此时进行版本控制）

如果你已经写好了工程但还没有进行过 git 版本控制，或者直接是从别的地方下载好的 github 上的工程还没有进入你自己的代码库的话，可以使用这种方法：

首先，如果你的工程完全没有经过 git 版本控制，那么在你的工程目录中输入命令：

```bash
    git init
    touch .gitignore
```

之后你的工程里会多出一个。git 的文件夹，之后你需要建立一个。gitignore 文件，来建立规则忽略你不想传上 github 进行版本控制的文件或文件夹（一般为依赖库、数据库或者一些隐私文件），配置规则请百度。

之后的操作跟方法一大体相同，指定要提交到的远程 repository，并注意同步冲突问题，之后提交即可。

```bash
git add .
git commit -m "first commit"
git remote add origin git@github.com:username/respositoryname.git
git pull origin master
git push -u origin master
```

其实 github 还提供了一个方法：import code from another repository，从别的版本库中导入工程，这个就不细说了，因为 git 是公认的目前最好的版本控制库，根本不需要再放在别的地方了。有历史原因的工程想导入的话完全可以先下载下来，再参照方法一二进行。
