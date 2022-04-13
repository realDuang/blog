(window.webpackJsonp=window.webpackJsonp||[]).push([[40],{586:function(s,e,t){"use strict";t.r(e);var a=t(11),n=Object(a.a)({},(function(){var s=this,e=s.$createElement,t=s._self._c||e;return t("ContentSlotsDistributor",{attrs:{"slot-key":s.$parent.slotKey}},[t("div",{staticClass:"custom-block tip"},[t("p",{staticClass:"title"}),t("p",[s._v("这段时间在开发一个腾讯文档全品类通用的 HTML 动态服务，为了方便各品类接入的生成与部署，也顺应上云的趋势，考虑使用 Docker 的方式来固定服务内容，统一进行制品版本的管理。本篇文章就将我在服务 Docker 化的过程中积累起来的优化经验分享出来，供大家参考。")])]),s._v(" "),t("p",[s._v("以一个例子开头，大部分刚接触 Docker 的同学应该都会这样编写项目的 Dockerfile，如下所示：")]),s._v(" "),t("div",{staticClass:"language-dockerfile line-numbers-mode"},[t("pre",{pre:!0,attrs:{class:"language-dockerfile"}},[t("code",[t("span",{pre:!0,attrs:{class:"token instruction"}},[t("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("FROM")]),s._v(" node:14")]),s._v("\n"),t("span",{pre:!0,attrs:{class:"token instruction"}},[t("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("WORKDIR")]),s._v(" /app")]),s._v("\n\n"),t("span",{pre:!0,attrs:{class:"token instruction"}},[t("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("COPY")]),s._v(" . .")]),s._v("\n"),t("span",{pre:!0,attrs:{class:"token comment"}},[s._v("# 安装 npm 依赖")]),s._v("\n"),t("span",{pre:!0,attrs:{class:"token instruction"}},[t("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("RUN")]),s._v(" npm install")]),s._v("\n\n"),t("span",{pre:!0,attrs:{class:"token comment"}},[s._v("# 暴露端口")]),s._v("\n"),t("span",{pre:!0,attrs:{class:"token instruction"}},[t("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("EXPOSE")]),s._v(" 8000")]),s._v("\n\n"),t("span",{pre:!0,attrs:{class:"token instruction"}},[t("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("CMD")]),s._v(" ["),t("span",{pre:!0,attrs:{class:"token string"}},[s._v('"npm"')]),s._v(", "),t("span",{pre:!0,attrs:{class:"token string"}},[s._v('"start"')]),s._v("]")]),s._v("\n")])]),s._v(" "),t("div",{staticClass:"line-numbers-wrapper"},[t("span",{staticClass:"line-number"},[s._v("1")]),t("br"),t("span",{staticClass:"line-number"},[s._v("2")]),t("br"),t("span",{staticClass:"line-number"},[s._v("3")]),t("br"),t("span",{staticClass:"line-number"},[s._v("4")]),t("br"),t("span",{staticClass:"line-number"},[s._v("5")]),t("br"),t("span",{staticClass:"line-number"},[s._v("6")]),t("br"),t("span",{staticClass:"line-number"},[s._v("7")]),t("br"),t("span",{staticClass:"line-number"},[s._v("8")]),t("br"),t("span",{staticClass:"line-number"},[s._v("9")]),t("br"),t("span",{staticClass:"line-number"},[s._v("10")]),t("br"),t("span",{staticClass:"line-number"},[s._v("11")]),t("br")])]),t("p",[s._v("构建，打包，上传，一气呵成。然后看下镜像状态，卧槽，一个简单的 node web 服务体积居然达到了惊人的 1.3 个 G，并且镜像传输与构建速度也很慢：")]),s._v(" "),t("p",[t("img",{attrs:{src:"https://zakum-1252497671.cos.ap-guangzhou.myqcloud.com/20210709165348.png",alt:"docker 镜像优化前"}})]),s._v(" "),t("p",[s._v("要是这个镜像只需要部署一个实例也就算了，但是这个服务得提供给所有开发同学进行高频集成并部署环境的（实现高频集成的方案可参见我的 "),t("a",{attrs:{href:"https://km.woa.com/group/46654/articles/show/472403",target:"_blank",rel:"noopener noreferrer"}},[s._v("上一篇文章"),t("OutboundLink")],1),s._v("）。首先，镜像体积过大必然会对镜像的拉取和更新速度造成影响，集成体验会变差。其次，项目上线后，同时在线的测试环境实例可能成千上万，这样的容器内存占用成本对于任何一个项目都是无法接受的。必须找到优化的办法解决。")]),s._v(" "),t("p",[s._v("发现问题后，我就开始研究 Docker 的优化方案，准备给我的镜像动手术了。")]),s._v(" "),t("h2",{attrs:{id:"node-项目生产环境优化"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#node-项目生产环境优化"}},[s._v("#")]),s._v(" node 项目生产环境优化")]),s._v(" "),t("p",[s._v("首先开刀的是当然是前端最为熟悉的领域，对代码本身体积进行优化。之前开发项目时使用了 Typescript，为了图省事，项目直接使用 tsc 打包生成 es5 后就直接运行起来了。这里的体积问题主要有两个，一个是开发环境 ts 源码并未处理，并且用于生产环境的 js 代码也未经压缩。")]),s._v(" "),t("p",[t("img",{attrs:{src:"https://zakum-1252497671.cos.ap-guangzhou.myqcloud.com/20210709170819.png",alt:"tsc 打包"}})]),s._v(" "),t("p",[s._v("另一个是引用的 node_modules 过于臃肿。仍然包含了许多开发调试环境中的 npm 包，如 ts-node，typescript 等等。既然打包成 js 了，这些依赖自然就该去除。")]),s._v(" "),t("p",[s._v("一般来说，由于服务端代码不会像前端代码一样暴露出去，运行在物理机上的服务更多考虑的是稳定性，也不在乎多一些体积，因此这些地方一般也不会做处理。但是 Docker 化后，由于部署规模变大，这些问题就非常明显了，在生产环境下需要优化的。")]),s._v(" "),t("p",[s._v("对于这两点的优化的方式其实我们前端非常熟悉了，不是本文的重点就粗略带过了。对于第一点，使用 Webpack + babel 降级并压缩 Typescript 源码，如果担心错误排查可以加上 sourcemap，不过对于 docker 镜像来说有点多余，一会儿会说到。对于第二点，梳理 npm 包的 dependencies 与 devDependencies 依赖，去除不是必要存在于运行时的依赖，方便生产环境使用 "),t("code",[s._v("npm install --production")]),s._v(" 安装依赖。")]),s._v(" "),t("h2",{attrs:{id:"优化项目镜像体积"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#优化项目镜像体积"}},[s._v("#")]),s._v(" 优化项目镜像体积")]),s._v(" "),t("h3",{attrs:{id:"使用尽量精简的基础镜像"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#使用尽量精简的基础镜像"}},[s._v("#")]),s._v(" 使用尽量精简的基础镜像")]),s._v(" "),t("p",[s._v("我们知道，容器技术提供的是操作系统级别的进程隔离，Docker 容器本身是一个运行在独立操作系统下的进程，也就是说，Docker 镜像需要打包的是一个能够独立运行的操作系统级环境。因此，决定镜像体积的一个重要因素就显而易见了：打包进镜像的 Linux 操作系统的体积。")]),s._v(" "),t("p",[s._v("一般来说，减小依赖的操作系统的大小主要需要考虑从两个方面下手，第一个是尽可能去除 Linux 下不需要的各类工具库，如 python，cmake, telnet 等。第二个是选取更轻量级的 Linux 发行版系统。正规的官方镜像应该会依据上述两个因素对每个发行版提供阉割版本。")]),s._v(" "),t("p",[s._v("以 node 官方提供的版本 node:14 为例，默认版本中，它的运行基础环境是 Ubuntu，是一个大而全的 Linux 发行版，以保证最大的兼容性。去除了无用工具库的依赖版本称为 node:14-slim 版本。而最小的镜像发行版称为 node:14-alpine。Linux alpine 是一个高度精简，仅包含基本工具的轻量级 Linux 发行版，本身的 Docker 镜像只有 4～5M 大小，因此非常适合制作最小版本的 Docker 镜像。")]),s._v(" "),t("p",[s._v("在我们的服务中，由于运行该服务的依赖是确定的，因此为了尽可能的缩减基础镜像的体积，我们选择 alpine 版本作为生产环境的基础镜像。")]),s._v(" "),t("h3",{attrs:{id:"分级构建"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#分级构建"}},[s._v("#")]),s._v(" 分级构建")]),s._v(" "),t("p",[s._v("这时候，我们遇到了新的问题。由于 alpine 的基本工具库过于简陋，而像 webpack 这样的打包工具背后可能使用的插件库极多，构建项目时对环境的依赖较大。并且这些工具库只有编译时需要用到，在运行时是可以去除的。对于这种情况，我们可以利用 Docker 的"),t("code",[s._v("分级构建")]),s._v("的特性来解决这一问题。")]),s._v(" "),t("p",[s._v("首先，我们可以在完整版镜像下进行依赖安装，并给该任务设立一个别名（此处为"),t("code",[s._v("build")]),s._v(")。")]),s._v(" "),t("div",{staticClass:"language-dockerfile line-numbers-mode"},[t("pre",{pre:!0,attrs:{class:"language-dockerfile"}},[t("code",[t("span",{pre:!0,attrs:{class:"token comment"}},[s._v("# 安装完整依赖并构建产物")]),s._v("\n"),t("span",{pre:!0,attrs:{class:"token instruction"}},[t("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("FROM")]),s._v(" node:14 "),t("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("AS")]),s._v(" build")]),s._v("\n"),t("span",{pre:!0,attrs:{class:"token instruction"}},[t("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("WORKDIR")]),s._v(" /app")]),s._v("\n\n"),t("span",{pre:!0,attrs:{class:"token instruction"}},[t("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("COPY")]),s._v(" package*.json /app/")]),s._v("\n"),t("span",{pre:!0,attrs:{class:"token instruction"}},[t("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("RUN")]),s._v(" ["),t("span",{pre:!0,attrs:{class:"token string"}},[s._v('"npm"')]),s._v(", "),t("span",{pre:!0,attrs:{class:"token string"}},[s._v('"install"')]),s._v("]")]),s._v("\n"),t("span",{pre:!0,attrs:{class:"token instruction"}},[t("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("COPY")]),s._v(" . /app/")]),s._v("\n\n"),t("span",{pre:!0,attrs:{class:"token instruction"}},[t("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("RUN")]),s._v(" npm run build")]),s._v("\n")])]),s._v(" "),t("div",{staticClass:"line-numbers-wrapper"},[t("span",{staticClass:"line-number"},[s._v("1")]),t("br"),t("span",{staticClass:"line-number"},[s._v("2")]),t("br"),t("span",{staticClass:"line-number"},[s._v("3")]),t("br"),t("span",{staticClass:"line-number"},[s._v("4")]),t("br"),t("span",{staticClass:"line-number"},[s._v("5")]),t("br"),t("span",{staticClass:"line-number"},[s._v("6")]),t("br"),t("span",{staticClass:"line-number"},[s._v("7")]),t("br"),t("span",{staticClass:"line-number"},[s._v("8")]),t("br"),t("span",{staticClass:"line-number"},[s._v("9")]),t("br")])]),t("p",[s._v("之后我们可以启用另一个镜像任务来运行生产环境，生产的基础镜像就可以换成 alpine 版本了。其中编译完成后的源码可以通过"),t("code",[s._v("--from")]),s._v("参数获取到处于"),t("code",[s._v("build")]),s._v("任务中的文件，移动到此任务内。")]),s._v(" "),t("div",{staticClass:"language-dockerfile line-numbers-mode"},[t("pre",{pre:!0,attrs:{class:"language-dockerfile"}},[t("code",[t("span",{pre:!0,attrs:{class:"token instruction"}},[t("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("FROM")]),s._v(" node:14-alpine "),t("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("AS")]),s._v(" release")]),s._v("\n"),t("span",{pre:!0,attrs:{class:"token instruction"}},[t("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("WORKDIR")]),s._v(" /release")]),s._v("\n\n"),t("span",{pre:!0,attrs:{class:"token instruction"}},[t("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("COPY")]),s._v(" package*.json /")]),s._v("\n"),t("span",{pre:!0,attrs:{class:"token instruction"}},[t("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("RUN")]),s._v(" ["),t("span",{pre:!0,attrs:{class:"token string"}},[s._v('"npm"')]),s._v(", "),t("span",{pre:!0,attrs:{class:"token string"}},[s._v('"install"')]),s._v(", "),t("span",{pre:!0,attrs:{class:"token string"}},[s._v('"--registry=http://r.tnpm.oa.com"')]),s._v(", "),t("span",{pre:!0,attrs:{class:"token string"}},[s._v('"--production"')]),s._v("]")]),s._v("\n\n"),t("span",{pre:!0,attrs:{class:"token comment"}},[s._v("# 移入依赖与源码")]),s._v("\n"),t("span",{pre:!0,attrs:{class:"token instruction"}},[t("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("COPY")]),s._v(" public /release/public")]),s._v("\n"),t("span",{pre:!0,attrs:{class:"token instruction"}},[t("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("COPY")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token options"}},[t("span",{pre:!0,attrs:{class:"token property"}},[s._v("--from")]),t("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v("=")]),t("span",{pre:!0,attrs:{class:"token string"}},[s._v("build")])]),s._v(" /app/dist /release/dist")]),s._v("\n\n"),t("span",{pre:!0,attrs:{class:"token comment"}},[s._v("# 启动服务")]),s._v("\n"),t("span",{pre:!0,attrs:{class:"token instruction"}},[t("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("EXPOSE")]),s._v(" 8000")]),s._v("\n\n"),t("span",{pre:!0,attrs:{class:"token instruction"}},[t("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("CMD")]),s._v(" ["),t("span",{pre:!0,attrs:{class:"token string"}},[s._v('"node"')]),s._v(", "),t("span",{pre:!0,attrs:{class:"token string"}},[s._v('"./dist/index.js"')]),s._v("]")]),s._v("\n")])]),s._v(" "),t("div",{staticClass:"line-numbers-wrapper"},[t("span",{staticClass:"line-number"},[s._v("1")]),t("br"),t("span",{staticClass:"line-number"},[s._v("2")]),t("br"),t("span",{staticClass:"line-number"},[s._v("3")]),t("br"),t("span",{staticClass:"line-number"},[s._v("4")]),t("br"),t("span",{staticClass:"line-number"},[s._v("5")]),t("br"),t("span",{staticClass:"line-number"},[s._v("6")]),t("br"),t("span",{staticClass:"line-number"},[s._v("7")]),t("br"),t("span",{staticClass:"line-number"},[s._v("8")]),t("br"),t("span",{staticClass:"line-number"},[s._v("9")]),t("br"),t("span",{staticClass:"line-number"},[s._v("10")]),t("br"),t("span",{staticClass:"line-number"},[s._v("11")]),t("br"),t("span",{staticClass:"line-number"},[s._v("12")]),t("br"),t("span",{staticClass:"line-number"},[s._v("13")]),t("br"),t("span",{staticClass:"line-number"},[s._v("14")]),t("br")])]),t("p",[s._v("Docker 镜像的生成规则是，生成镜像的结果仅以最后一个镜像任务为准。因此前面的任务并不会占用最终镜像的体积，从而完美解决这一问题。")]),s._v(" "),t("p",[s._v("当然，随着项目越来越复杂，在运行时仍可能会遇到工具库报错，如果曝出问题的工具库所需依赖不多，我们可以自行补充所需的依赖，这样的镜像体积仍然能保持较小的水平。")]),s._v(" "),t("p",[s._v("其中最常见的问题就是对"),t("code",[s._v("node-gyp")]),s._v("与"),t("code",[s._v("node-sass")]),s._v("库的引用。由于这个库是用来将其他语言编写的模块转译为 node 模块，因此，我们需要手动增加"),t("code",[s._v("g++ make python")]),s._v("这三个依赖。")]),s._v(" "),t("div",{staticClass:"language-dockerfile line-numbers-mode"},[t("pre",{pre:!0,attrs:{class:"language-dockerfile"}},[t("code",[t("span",{pre:!0,attrs:{class:"token comment"}},[s._v("# 安装生产环境依赖（为兼容 node-gyp 所需环境需要对 alpine 进行改造）")]),s._v("\n"),t("span",{pre:!0,attrs:{class:"token instruction"}},[t("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("FROM")]),s._v(" node:14-alpine "),t("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("AS")]),s._v(" dependencies")]),s._v("\n\n"),t("span",{pre:!0,attrs:{class:"token instruction"}},[t("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("RUN")]),s._v(" apk add --no-cache python make g++")]),s._v("\n"),t("span",{pre:!0,attrs:{class:"token instruction"}},[t("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("COPY")]),s._v(" package*.json /")]),s._v("\n"),t("span",{pre:!0,attrs:{class:"token instruction"}},[t("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("RUN")]),s._v(" ["),t("span",{pre:!0,attrs:{class:"token string"}},[s._v('"npm"')]),s._v(", "),t("span",{pre:!0,attrs:{class:"token string"}},[s._v('"install"')]),s._v(", "),t("span",{pre:!0,attrs:{class:"token string"}},[s._v('"--registry=http://r.tnpm.oa.com"')]),s._v(", "),t("span",{pre:!0,attrs:{class:"token string"}},[s._v('"--production"')]),s._v("]")]),s._v("\n"),t("span",{pre:!0,attrs:{class:"token instruction"}},[t("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("RUN")]),s._v(" apk del .gyp")]),s._v("\n")])]),s._v(" "),t("div",{staticClass:"line-numbers-wrapper"},[t("span",{staticClass:"line-number"},[s._v("1")]),t("br"),t("span",{staticClass:"line-number"},[s._v("2")]),t("br"),t("span",{staticClass:"line-number"},[s._v("3")]),t("br"),t("span",{staticClass:"line-number"},[s._v("4")]),t("br"),t("span",{staticClass:"line-number"},[s._v("5")]),t("br"),t("span",{staticClass:"line-number"},[s._v("6")]),t("br"),t("span",{staticClass:"line-number"},[s._v("7")]),t("br")])]),t("blockquote",[t("p",[s._v("详情可见："),t("a",{attrs:{href:"https://github.com/nodejs/docker-node/issues/282",target:"_blank",rel:"noopener noreferrer"}},[s._v("https://github.com/nodejs/docker-node/issues/282"),t("OutboundLink")],1)])]),s._v(" "),t("h2",{attrs:{id:"合理规划-docker-layer"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#合理规划-docker-layer"}},[s._v("#")]),s._v(" 合理规划 Docker Layer")]),s._v(" "),t("h3",{attrs:{id:"构建速度优化"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#构建速度优化"}},[s._v("#")]),s._v(" 构建速度优化")]),s._v(" "),t("p",[s._v("我们知道，Docker 使用 Layer 概念来创建与组织镜像，Dockerfile 的每条指令都会产生一个新的文件层，每层都包含执行命令前后的状态之间镜像的文件系统更改，文件层越多，镜像体积就越大。而 Docker 使用缓存方式实现了构建速度的提升。"),t("strong",[s._v("若 Dockerfile 中某层的语句及依赖未更改，则该层重建时可以直接复用本地缓存")]),s._v("。")]),s._v(" "),t("p",[s._v("如下所示，如果 log 中出现"),t("code",[s._v("Using cache")]),s._v("字样时，说明缓存生效了，该层将不会执行运算，直接拿原缓存作为该层的输出结果。")]),s._v(" "),t("div",{staticClass:"language-shell line-numbers-mode"},[t("pre",{pre:!0,attrs:{class:"language-shell"}},[t("code",[s._v("Step "),t("span",{pre:!0,attrs:{class:"token number"}},[s._v("2")]),s._v("/3 "),t("span",{pre:!0,attrs:{class:"token builtin class-name"}},[s._v(":")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token function"}},[s._v("npm")]),s._v(" "),t("span",{pre:!0,attrs:{class:"token function"}},[s._v("install")]),s._v("\n ---"),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v(">")]),s._v(" Using cache\n ---"),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v(">")]),s._v(" efvbf79sd1eb\n")])]),s._v(" "),t("div",{staticClass:"line-numbers-wrapper"},[t("span",{staticClass:"line-number"},[s._v("1")]),t("br"),t("span",{staticClass:"line-number"},[s._v("2")]),t("br"),t("span",{staticClass:"line-number"},[s._v("3")]),t("br")])]),t("p",[s._v("通过研究 Docker 缓存算法，发现在 Docker 构建过程中，"),t("strong",[s._v("如果某层无法应用缓存，则依赖此步的后续层都不能从缓存加载")]),s._v("。例如下面这个例子：")]),s._v(" "),t("div",{staticClass:"language-dockerfile line-numbers-mode"},[t("pre",{pre:!0,attrs:{class:"language-dockerfile"}},[t("code",[t("span",{pre:!0,attrs:{class:"token instruction"}},[t("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("COPY")]),s._v(" . .")]),s._v("\n"),t("span",{pre:!0,attrs:{class:"token instruction"}},[t("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("RUN")]),s._v(" npm install")]),s._v("\n")])]),s._v(" "),t("div",{staticClass:"line-numbers-wrapper"},[t("span",{staticClass:"line-number"},[s._v("1")]),t("br"),t("span",{staticClass:"line-number"},[s._v("2")]),t("br")])]),t("p",[s._v("此时如果我们更改了仓库的任意一个文件，此时因为"),t("code",[s._v("npm install")]),s._v("层的上层依赖变更了，哪怕依赖没有进行任何变动，缓存也不会被复用。")]),s._v(" "),t("p",[s._v("因此，若想尽可能的利用上"),t("code",[s._v("npm install")]),s._v("层缓存，我们可以把 Dockerfile 改成这样：")]),s._v(" "),t("div",{staticClass:"language-dockerfile line-numbers-mode"},[t("pre",{pre:!0,attrs:{class:"language-dockerfile"}},[t("code",[t("span",{pre:!0,attrs:{class:"token instruction"}},[t("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("COPY")]),s._v(" package*.json .")]),s._v("\n"),t("span",{pre:!0,attrs:{class:"token instruction"}},[t("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("RUN")]),s._v(" npm install")]),s._v("\n"),t("span",{pre:!0,attrs:{class:"token instruction"}},[t("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("COPY")]),s._v(" src .")]),s._v("\n")])]),s._v(" "),t("div",{staticClass:"line-numbers-wrapper"},[t("span",{staticClass:"line-number"},[s._v("1")]),t("br"),t("span",{staticClass:"line-number"},[s._v("2")]),t("br"),t("span",{staticClass:"line-number"},[s._v("3")]),t("br")])]),t("p",[s._v("这样在仅变更源码时，"),t("code",[s._v("node_modules")]),s._v("的依赖缓存仍然能被利用上了。")]),s._v(" "),t("p",[s._v("由此，我们得到了优化原则：")]),s._v(" "),t("ol",[t("li",[t("p",[s._v("最小化处理变更文件，仅变更下一步所需的文件，以尽可能减少构建过程中的缓存失效。")])]),s._v(" "),t("li",[t("p",[s._v("对于处理文件变更的 ADD 命令、COPY 命令，尽量延迟执行。")])])]),s._v(" "),t("h3",{attrs:{id:"构建体积优化"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#构建体积优化"}},[s._v("#")]),s._v(" 构建体积优化")]),s._v(" "),t("p",[s._v("在保证速度的前提下，体积优化也是我们需要去考虑的。这里我们需要考虑的有三点：")]),s._v(" "),t("ol",[t("li",[t("p",[s._v("Docker 是以层为单位上传镜像仓库的，这样也能最大化的利用缓存的能力。因此，"),t("strong",[s._v("执行结果很少变化的命令需要抽出来单独成层")]),s._v("，如上面提到的"),t("code",[s._v("npm install")]),s._v("的例子里，也用到了这方面的思想。")])]),s._v(" "),t("li",[t("p",[s._v("如果镜像层数越少，总上传体积就越小。因此，"),t("strong",[s._v("在命令处于执行链尾部，即不会对其他层缓存产生影响的情况下，尽量合并命令")]),s._v("，从而减少缓存体积。例如，设置环境变量和清理无用文件的指令，它们的输出都是不会被使用的，因此可以将这些命令合并为一行 RUN 命令。")])])]),s._v(" "),t("div",{staticClass:"language-dockerfile line-numbers-mode"},[t("pre",{pre:!0,attrs:{class:"language-dockerfile"}},[t("code",[t("span",{pre:!0,attrs:{class:"token instruction"}},[t("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("RUN")]),s._v(" set ENV=prod && rm -rf ./trash")]),s._v("\n")])]),s._v(" "),t("div",{staticClass:"line-numbers-wrapper"},[t("span",{staticClass:"line-number"},[s._v("1")]),t("br")])]),t("ol",{attrs:{start:"3"}},[t("li",[s._v("Docker cache 的下载也是通过层缓存的方式，因此为了减少镜像的传输下载时间，我们最好使用"),t("strong",[s._v("固定的物理机器")]),s._v("来进行构建。例如在流水线中指定专用宿主机，能是的镜像的准备时间大大减少。")])]),s._v(" "),t("p",[s._v("当然，时间和空间的优化从来就没有两全其美的办法，这一点需要我们在设计 Dockerfile 时，对 Docker Layer 层数做出权衡。例如为了时间优化，需要我们拆分文件的复制等操作，而这一点会导致层数增多，略微增加空间。")]),s._v(" "),t("p",[s._v("这里我的建议是，优先保证构建时间，其次在不影响时间的情况下，尽可能的缩小构建缓存体积。")]),s._v(" "),t("h2",{attrs:{id:"以-docker-的思维管理服务"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#以-docker-的思维管理服务"}},[s._v("#")]),s._v(" 以 Docker 的思维管理服务")]),s._v(" "),t("h3",{attrs:{id:"避免使用进程守护"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#避免使用进程守护"}},[s._v("#")]),s._v(" 避免使用进程守护")]),s._v(" "),t("p",[s._v("我们编写传统的后台服务时，总是会使用例如 pm2、forever 等等进程守护程序，以保证服务在意外崩溃时能被监测到并自动重启。但这一点在 Docker 下非但没有益处，还带来了额外的不稳定因素。")]),s._v(" "),t("p",[s._v("首先，Docker 本身就是一个流程管理器，因此，进程守护程序提供的崩溃重启，日志记录等等工作 Docker 本身或是基于 Docker 的编排程序（如 kubernetes）就能提供了，无需使用额外应用实现。除此之外，由于守护进程的特性，将不可避免的对于以下的情况产生影响：")]),s._v(" "),t("ol",[t("li",[t("p",[s._v("增加进程守护程序会使得占用的内存增多，镜像体积也会相应增大。")])]),s._v(" "),t("li",[t("p",[s._v("由于守护进程一直能正常运行，服务发生故障时，Docker 自身的重启策略将不会生效，Docker 日志里将不会记录崩溃信息，排障溯源困难。")])]),s._v(" "),t("li",[t("p",[s._v("由于多了个进程的加入，Docker 提供的 CPU、内存等监控指标将变得不准确。")])])]),s._v(" "),t("p",[s._v("因此，尽管 pm2 这样的进程守护程序提供了能够适配 Docker 的版本："),t("code",[s._v("pm2-runtime")]),s._v("，但我仍然不推荐大家使用进程守护程序。")]),s._v(" "),t("p",[s._v("其实这一点其实是源自于我们的固有思想而犯下的错误。在服务上云的过程中，难点其实不仅仅在于写法与架构上的调整，开发思路的转变才是最重要的，我们会在上云的过程中更加深刻体会到这一点。")]),s._v(" "),t("h3",{attrs:{id:"日志的持久化存储"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#日志的持久化存储"}},[s._v("#")]),s._v(" 日志的持久化存储")]),s._v(" "),t("p",[s._v("无论是为了排障还是审计的需要，后台服务总是需要日志能力。按照以往的思路，我们将日志分好类后，统一写入某个目录下的日志文件即可。但是在 Docker 中，任何本地文件都不是持久化的，会随着容器的生命周期结束而销毁。因此，我们需要将日志的存储跳出容器之外。")]),s._v(" "),t("p",[s._v("最简单的做法是利用 "),t("code",[s._v("Docker Manager Volume")]),s._v("，这个特性能绕过容器自身的文件系统，直接将数据写到宿主物理机器上。具体用法如下：")]),s._v(" "),t("div",{staticClass:"language-shell line-numbers-mode"},[t("pre",{pre:!0,attrs:{class:"language-shell"}},[t("code",[t("span",{pre:!0,attrs:{class:"token function"}},[s._v("docker")]),s._v(" run -d -it --name"),t("span",{pre:!0,attrs:{class:"token operator"}},[s._v("=")]),s._v("app -v /app/log:/usr/share/log app\n")])]),s._v(" "),t("div",{staticClass:"line-numbers-wrapper"},[t("span",{staticClass:"line-number"},[s._v("1")]),t("br")])]),t("p",[s._v("运行 docker 时，通过-v 参数为容器绑定 volumes，将宿主机上的 "),t("code",[s._v("/app/log")]),s._v(" 目录（如果没有会自动创建）挂载到容器的 "),t("code",[s._v("/usr/share/log")]),s._v(" 中。这样服务在将日志写入该文件夹时，就能持久化存储在宿主机上，不随着 docker 的销毁而丢失了。")]),s._v(" "),t("p",[s._v("当然，当部署集群变多后，物理宿主机上的日志也会变得难以管理。此时就需要一个服务编排系统来统一管理了。从单纯管理日志的角度出发，我们可以进行网络上报，给到云日志服务（如腾讯云 CLS）托管。或者干脆将容器进行批量管理，例如"),t("code",[s._v("Kubernetes")]),s._v("这样的容器编排系统，这样日志作为其中的一个模块自然也能得到妥善保管了。这样的方法很多，就不多加赘述了。")]),s._v(" "),t("h3",{attrs:{id:"k8s-服务控制器的选择"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#k8s-服务控制器的选择"}},[s._v("#")]),s._v(" k8s 服务控制器的选择")]),s._v(" "),t("p",[s._v("镜像优化之外，服务编排以及控制部署的负载形式对性能的影响也很大。这里以最流行的"),t("code",[s._v("Kubernetes")]),s._v("的两种控制器（Controller）："),t("code",[s._v("Deployment")]),s._v(" 与 "),t("code",[s._v("StatefulSet")]),s._v(" 为例，简要比较一下这两类组织形式，帮助选择出最适合服务的 Controller。")]),s._v(" "),t("p",[t("code",[s._v("StatefulSet")]),s._v("是 K8S 在 1.5 版本后引入的 Controller，主要特点为：能够实现 pod 间的有序部署、更新和销毁。那么我们的制品是否需要使用 "),t("code",[s._v("StatefulSet")]),s._v(" 做 pod 管理呢？官方简要概括为一句话：")]),s._v(" "),t("blockquote",[t("p",[s._v("Deployment 用于部署无状态服务，StatefulSet 用来部署有状态服务。")])]),s._v(" "),t("p",[s._v("这句话十分精确，但不易于理解。那么，什么是无状态呢？在我看来，"),t("code",[s._v("StatefulSet")]),s._v("的特点可以从如下几个步骤进行理解：")]),s._v(" "),t("ol",[t("li",[t("p",[t("code",[s._v("StatefulSet")]),s._v("管理的多个 pod 之间进行部署，更新，删除操作时能够按照固定顺序依次进行。适用于多服务之间有依赖的情况，如先启动数据库服务再开启查询服务。")])]),s._v(" "),t("li",[t("p",[s._v("由于 pod 之间有依赖关系，因此每个 pod 提供的服务必定不同，所以 "),t("code",[s._v("StatefulSet")]),s._v(" 管理的 pod 之间没有负载均衡的能力。")])]),s._v(" "),t("li",[t("p",[s._v("又因为 pod 提供的服务不同，所以每个 pod 都会有自己独立的存储空间，pod 间不共享。")])]),s._v(" "),t("li",[t("p",[s._v("为了保证 pod 部署更新时顺序，必须固定 pod 的名称，因此不像 "),t("code",[s._v("Deployment")]),s._v(" 那样生成的 pod 名称后会带一串随机数。")])]),s._v(" "),t("li",[t("p",[s._v("而由于 pod 名称固定，因此跟 "),t("code",[s._v("StatefulSet")]),s._v(" 对接的 "),t("code",[s._v("Service")]),s._v(" 中可以直接以 pod 名称作为访问域名，而不需要提供"),t("code",[s._v("Cluster IP")]),s._v("，因此跟 "),t("code",[s._v("StatefulSet")]),s._v(" 对接的 "),t("code",[s._v("Service")]),s._v(" 被称为 "),t("code",[s._v("Headless Service")]),s._v("。")])])]),s._v(" "),t("p",[s._v("通过这里我们就应该明白，如果在 k8s 上部署的是单个服务，或是多服务间没有依赖关系，那么 "),t("code",[s._v("Deployment")]),s._v(" 一定是简单而又效果最佳的选择，自动调度，自动负载均衡。而如果服务的启停必须满足一定顺序，或者每一个 pod 所挂载的数据 volume 需要在销毁后依然存在，那么建议选择 "),t("code",[s._v("StatefulSet")]),s._v("。")]),s._v(" "),t("p",[s._v("本着如无必要，勿增实体的原则，强烈建议所有运行单个服务工作负载采用 "),t("code",[s._v("Deployment")]),s._v(" 作为 Controller。")]),s._v(" "),t("h2",{attrs:{id:"写在结尾"}},[t("a",{staticClass:"header-anchor",attrs:{href:"#写在结尾"}},[s._v("#")]),s._v(" 写在结尾")]),s._v(" "),t("p",[s._v("一通研究下来，差点把一开始的目标忘了，赶紧将 Docker 重新构建一遍，看看优化成果。")]),s._v(" "),t("p",[t("img",{attrs:{src:"https://zakum-1252497671.cos.ap-guangzhou.myqcloud.com/20210727180211.png",alt:"docker 镜像优化后"}})]),s._v(" "),t("p",[s._v("可以看到，对于镜像体积的优化效果还是不错的，达到了 10 倍左右。当然，如果项目中不需要如此高版本的 node 支持，还能进一步缩小大约一半的镜像体积。")]),s._v(" "),t("p",[s._v("之后镜像仓库会对存放的镜像文件做一次压缩，以 node14 打包的镜像版本最终被压缩到了 50M 以内。")]),s._v(" "),t("p",[t("img",{attrs:{src:"https://zakum-1252497671.cos.ap-guangzhou.myqcloud.com/20210727180435.png",alt:"镜像仓库优化前后"}})]),s._v(" "),t("p",[s._v("当然，除了看得到的体积数据之外，更重要的优化其实在于，从面向物理机的服务向容器化云服务在架构设计层面上的转变。")]),s._v(" "),t("p",[s._v("容器化已经是看得见的未来，作为一名开发人员，要时刻保持对前沿技术的敏感，积极实践，才能将技术转化为生产力，为项目的\b进化做出贡献。")]),s._v(" "),t("p",[s._v("参考资料：")]),s._v(" "),t("ol",[t("li",[s._v("《Kubernetes in action》--Marko Lukša")]),s._v(" "),t("li",[t("a",{attrs:{href:"https://linuxhint.com/optimizing-docker-images/",target:"_blank",rel:"noopener noreferrer"}},[s._v("Optimizing Docker Images"),t("OutboundLink")],1)])])])}),[],!1,null,null,null);e.default=n.exports}}]);