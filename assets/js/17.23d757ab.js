(window.webpackJsonp=window.webpackJsonp||[]).push([[17],{514:function(s,t,n){"use strict";n.r(t);var a=n(7),e=Object(a.a)({},(function(){var s=this,t=s.$createElement,n=s._self._c||t;return n("ContentSlotsDistributor",{attrs:{"slot-key":s.$parent.slotKey}},[n("div",{staticClass:"custom-block tip"},[n("p",{staticClass:"title"}),n("p",[s._v("解决 github + Hexo 的博客多终端同步的思路是将博文内容相关文件放在 Github 项目中 master 中，将 Hexo 配置写博客用的相关文件放在 Github 项目的 hexo 分支上，这个是关键，多终端的同步只需要对分支 hexo 进行操作。")])]),s._v(" "),n("p",[s._v("下面是详细的步骤讲解：")]),s._v(" "),n("h2",{attrs:{id:"_1-准备条件"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#_1-准备条件"}},[s._v("#")]),s._v(" 1. 准备条件")]),s._v(" "),n("p",[s._v("安装了 Node.js,Git,Hexo 环境\n完成 Github 与本地 Hexo 的对接\n这部分大家可以参考史上 "),n("a",{attrs:{href:"https://xuanwo.org/2015/03/26/hexo-intor/",target:"_blank",rel:"noopener noreferrer"}},[s._v("最详细的 Hexo 博客搭建图文教程"),n("OutboundLink")],1)]),s._v(" "),n("p",[s._v("配置好这些，就可以捋起袖子大干一场了！")]),s._v(" "),n("h2",{attrs:{id:"_2-在其中一个终端操作-push-本地文件夹-hexo-中的必要文件到-yourname-github-io-的-hexo-分支上"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#_2-在其中一个终端操作-push-本地文件夹-hexo-中的必要文件到-yourname-github-io-的-hexo-分支上"}},[s._v("#")]),s._v(" 2. 在其中一个终端操作，push 本地文件夹 Hexo 中的必要文件到 yourname.github.io 的 hexo 分支上")]),s._v(" "),n("p",[s._v("在利用 Github+Hexo 搭建自己的博客时，新建了一个 Hexo 的文件夹，并进行相关的配置，这部分主要是将这些配置的文件托管到 Github 项目的分支上，其中只托管部分用于多终端的同步的文件，如完成的效果图所示：")]),s._v(" "),n("p",[s._v("git init  //初始化本地仓库\ngit add source //将必要的文件依次添加，有些文件夹如 npm install 产生的 node_modules 由于路径过长不好处理，所以这里没有用'git add .'命令了，而是依次添加必要文件，如下所示")]),s._v(" "),n("div",{staticClass:"language-bash line-numbers-mode"},[n("pre",{pre:!0,attrs:{class:"language-bash"}},[n("code",[n("span",{pre:!0,attrs:{class:"token function"}},[s._v("git")]),s._v(" commit -m "),n("span",{pre:!0,attrs:{class:"token string"}},[s._v('"Blog Source Hexo"')]),s._v("\n"),n("span",{pre:!0,attrs:{class:"token function"}},[s._v("git")]),s._v(" branch hexo  //新建 hexo 分支\n"),n("span",{pre:!0,attrs:{class:"token function"}},[s._v("git")]),s._v(" checkout hexo  //切换到 hexo 分支上\n"),n("span",{pre:!0,attrs:{class:"token function"}},[s._v("git")]),s._v(" remote "),n("span",{pre:!0,attrs:{class:"token function"}},[s._v("add")]),s._v(" origin git@github.com:yourname/yourname.github.io.git  //将本地与 Github 项目对接\n"),n("span",{pre:!0,attrs:{class:"token function"}},[s._v("git")]),s._v(" push origin hexo  //push 到 Github 项目的 hexo 分支上\n")])]),s._v(" "),n("div",{staticClass:"line-numbers-wrapper"},[n("span",{staticClass:"line-number"},[s._v("1")]),n("br"),n("span",{staticClass:"line-number"},[s._v("2")]),n("br"),n("span",{staticClass:"line-number"},[s._v("3")]),n("br"),n("span",{staticClass:"line-number"},[s._v("4")]),n("br"),n("span",{staticClass:"line-number"},[s._v("5")]),n("br")])]),n("p",[s._v("完成之后的效果图为：")]),s._v(" "),n("p",[n("img",{attrs:{src:"https://cdn.jsdelivr.net/gh/realDuang/blog-storage/images/sync-hexo-01.png",alt:"hexo 分支"}})]),s._v(" "),n("p",[s._v("这样你的 github 项目中就会多出一个 Hexo 分支，这个就是用于多终端同步关键的部分。")]),s._v(" "),n("h2",{attrs:{id:"_3-另一终端完成-clone-和-push-更新"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#_3-另一终端完成-clone-和-push-更新"}},[s._v("#")]),s._v(" 3. 另一终端完成 clone 和 push 更新")]),s._v(" "),n("p",[s._v("此时在另一终端更新博客，只需要将 Github 的 hexo 分支 clone 下来，进行初次的相关配置")]),s._v(" "),n("div",{staticClass:"language-bash line-numbers-mode"},[n("pre",{pre:!0,attrs:{class:"language-bash"}},[n("code",[n("span",{pre:!0,attrs:{class:"token function"}},[s._v("git")]),s._v(" clone -b hexo git@github.com:yourname/yourname.github.io.git  //将 Github 中 hexo 分支 clone 到本地\n"),n("span",{pre:!0,attrs:{class:"token builtin class-name"}},[s._v("cd")]),s._v("  yourname.github.io  //切换到刚刚 clone 的文件夹内\n"),n("span",{pre:!0,attrs:{class:"token function"}},[s._v("npm")]),s._v(" "),n("span",{pre:!0,attrs:{class:"token function"}},[s._v("install")]),s._v("    //注意，这里一定要切换到刚刚 clone 的文件夹内执行，安装必要的所需组件，不用再 init\nhexo new post "),n("span",{pre:!0,attrs:{class:"token string"}},[s._v('"new blog name"')]),s._v("   //新建一个。md 文件，并编辑完成自己的博客内容\n"),n("span",{pre:!0,attrs:{class:"token function"}},[s._v("git")]),s._v(" "),n("span",{pre:!0,attrs:{class:"token function"}},[s._v("add")]),s._v(" "),n("span",{pre:!0,attrs:{class:"token builtin class-name"}},[s._v("source")]),s._v("  //经测试每次只要更新 sorcerer 中的文件到 Github 中即可，因为只是新建了一篇新博客\n"),n("span",{pre:!0,attrs:{class:"token function"}},[s._v("git")]),s._v(" commit -m "),n("span",{pre:!0,attrs:{class:"token string"}},[s._v('"XX"')]),s._v("\n"),n("span",{pre:!0,attrs:{class:"token function"}},[s._v("git")]),s._v(" push origin hexo  //更新分支\nhexo d -g   //push 更新完分支之后将自己写的博客对接到自己搭的博客网站上，同时同步了 Github 中的 master\n")])]),s._v(" "),n("div",{staticClass:"line-numbers-wrapper"},[n("span",{staticClass:"line-number"},[s._v("1")]),n("br"),n("span",{staticClass:"line-number"},[s._v("2")]),n("br"),n("span",{staticClass:"line-number"},[s._v("3")]),n("br"),n("span",{staticClass:"line-number"},[s._v("4")]),n("br"),n("span",{staticClass:"line-number"},[s._v("5")]),n("br"),n("span",{staticClass:"line-number"},[s._v("6")]),n("br"),n("span",{staticClass:"line-number"},[s._v("7")]),n("br"),n("span",{staticClass:"line-number"},[s._v("8")]),n("br")])]),n("h2",{attrs:{id:"_4-不同终端间愉快地玩耍"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#_4-不同终端间愉快地玩耍"}},[s._v("#")]),s._v(" 4. 不同终端间愉快地玩耍")]),s._v(" "),n("p",[s._v("在不同的终端已经做完配置，就可以愉快的分享自己更新的博客")]),s._v(" "),n("p",[s._v("进入自己相应的文件夹")]),s._v(" "),n("div",{staticClass:"language-bash line-numbers-mode"},[n("pre",{pre:!0,attrs:{class:"language-bash"}},[n("code",[n("span",{pre:!0,attrs:{class:"token function"}},[s._v("git")]),s._v(" pull origin hexo  //先 pull 完成本地与远端的融合\nhexo new post "),n("span",{pre:!0,attrs:{class:"token string"}},[s._v('" new blog name"')]),s._v("\n"),n("span",{pre:!0,attrs:{class:"token function"}},[s._v("git")]),s._v(" "),n("span",{pre:!0,attrs:{class:"token function"}},[s._v("add")]),s._v(" "),n("span",{pre:!0,attrs:{class:"token builtin class-name"}},[s._v("source")]),s._v("\n"),n("span",{pre:!0,attrs:{class:"token function"}},[s._v("git")]),s._v(" commit -m "),n("span",{pre:!0,attrs:{class:"token string"}},[s._v('"XX"')]),s._v("\n"),n("span",{pre:!0,attrs:{class:"token function"}},[s._v("git")]),s._v(" push origin hexo\nhexo d -g\n")])]),s._v(" "),n("div",{staticClass:"line-numbers-wrapper"},[n("span",{staticClass:"line-number"},[s._v("1")]),n("br"),n("span",{staticClass:"line-number"},[s._v("2")]),n("br"),n("span",{staticClass:"line-number"},[s._v("3")]),n("br"),n("span",{staticClass:"line-number"},[s._v("4")]),n("br"),n("span",{staticClass:"line-number"},[s._v("5")]),n("br"),n("span",{staticClass:"line-number"},[s._v("6")]),n("br")])]),n("p",[s._v("本文转载自："),n("a",{attrs:{href:"http://blog.csdn.net/Monkey_LZL/article/details/60870891",target:"_blank",rel:"noopener noreferrer"}},[s._v("http://blog.csdn.net/Monkey_LZL/article/details/60870891"),n("OutboundLink")],1)])])}),[],!1,null,null,null);t.default=e.exports}}]);