(window.webpackJsonp=window.webpackJsonp||[]).push([[19],{516:function(s,a,n){"use strict";n.r(a);var e=n(7),t=Object(e.a)({},(function(){var s=this,a=s.$createElement,n=s._self._c||a;return n("ContentSlotsDistributor",{attrs:{"slot-key":s.$parent.slotKey}},[n("div",{staticClass:"custom-block tip"},[n("p",{staticClass:"title"}),n("p",[s._v("这段时间为了上线测试很多 nodejs 代码的部署，开始鼓捣云服务器。由于不是很懂运维知识，首先在安装上就踩了很多大坑，于是决定记录下来做个备忘。")])]),s._v(" "),n("p",[s._v("首先，我们可以去 "),n("a",{attrs:{href:"https://nodejs.org/en/download/current/",target:"_blank",rel:"noopener noreferrer"}},[s._v("nodejs 官网"),n("OutboundLink")],1),s._v(" 下载代码。")]),s._v(" "),n("p",[s._v("页面大概长成这样，上面有不同系统的不同位版本的下载，也可以点击上面的连接直接下载源码。")]),s._v(" "),n("p",[n("img",{attrs:{src:"https://cdn.jsdelivr.net/gh/realDuang/blog-storage/images/node-install-linux-01.jpg",alt:"01.jpg"}})]),s._v(" "),n("hr"),s._v(" "),n("h3",{attrs:{id:"_1-第一种方法-直接使用编译好的版本"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#_1-第一种方法-直接使用编译好的版本"}},[s._v("#")]),s._v(" 1. 第一种方法，直接使用编译好的版本")]),s._v(" "),n("p",[s._v("这是我认为最简单最好用的方法，直接下载官网的可编译版本的压缩包，然后用 ftp 导入到服务器中。当然你也可以直接在服务器中输入下载链接下载下来。")]),s._v(" "),n("p",[s._v("之后将压缩包文件解压，解压方法根据压缩包类型的不同方法有很多，我随便给一个 tar.gz 的：")]),s._v(" "),n("div",{staticClass:"language-bash line-numbers-mode"},[n("pre",{pre:!0,attrs:{class:"language-bash"}},[n("code",[n("span",{pre:!0,attrs:{class:"token function"}},[s._v("tar")]),s._v(" xvf node-v8.1.0-linux-64.tar.gz\n")])]),s._v(" "),n("div",{staticClass:"line-numbers-wrapper"},[n("span",{staticClass:"line-number"},[s._v("1")]),n("br")])]),n("blockquote",[n("p",[s._v("其中，node-v8.1.0-linux-64 是你的下载文件名，文件名不同这里填写的内容就不同，下面的内容也是一样的，就不一一重复了。")])]),s._v(" "),n("p",[s._v("解压之后，我们 cd 到这个目录执行 node，发现已经能直接干了。")]),s._v(" "),n("div",{staticClass:"language-bash line-numbers-mode"},[n("pre",{pre:!0,attrs:{class:"language-bash"}},[n("code",[n("span",{pre:!0,attrs:{class:"token builtin class-name"}},[s._v("cd")]),s._v(" node-v8.1.0-linux-64/bin\n./node -v\n./npm -v\n")])]),s._v(" "),n("div",{staticClass:"line-numbers-wrapper"},[n("span",{staticClass:"line-number"},[s._v("1")]),n("br"),n("span",{staticClass:"line-number"},[s._v("2")]),n("br"),n("span",{staticClass:"line-number"},[s._v("3")]),n("br")])]),n("p",[s._v("但是这样比较麻烦，每次都要进入到这个目录才能执行 node 和 npm。那么怎样在 linux 里设置全局命令呢？答案是使用 ln 命令：")]),s._v(" "),n("div",{staticClass:"language-bash line-numbers-mode"},[n("pre",{pre:!0,attrs:{class:"language-bash"}},[n("code",[n("span",{pre:!0,attrs:{class:"token function"}},[s._v("ln")]),s._v(" -s /root/node-v8.1.0-linux-64/bin/node /usr/local/bin/node\n"),n("span",{pre:!0,attrs:{class:"token function"}},[s._v("ln")]),s._v(" -s /root/node-v8.1.0-linux-64/bin/npm /usr/local/bin/npm\n")])]),s._v(" "),n("div",{staticClass:"line-numbers-wrapper"},[n("span",{staticClass:"line-number"},[s._v("1")]),n("br"),n("span",{staticClass:"line-number"},[s._v("2")]),n("br")])]),n("p",[s._v("命令接收两个参数，第一个是你的 node 文件夹所在的位置，我图省事直接装在 root 下了，你改了文件位置的话这个地方就写 node 文件夹所在的位置的父目录即可，第二个是全局指令库位置。")]),s._v(" "),n("p",[s._v("接下来随便跳到一个目录，执行：")]),s._v(" "),n("div",{staticClass:"language-bash line-numbers-mode"},[n("pre",{pre:!0,attrs:{class:"language-bash"}},[n("code",[s._v("node -v\n"),n("span",{pre:!0,attrs:{class:"token function"}},[s._v("npm")]),s._v(" -v\n")])]),s._v(" "),n("div",{staticClass:"line-numbers-wrapper"},[n("span",{staticClass:"line-number"},[s._v("1")]),n("br"),n("span",{staticClass:"line-number"},[s._v("2")]),n("br")])]),n("p",[s._v("是不是就有反应啦。")]),s._v(" "),n("h3",{attrs:{id:"_2-第二种方式-通过源码编译"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#_2-第二种方式-通过源码编译"}},[s._v("#")]),s._v(" 2. 第二种方式，通过源码编译")]),s._v(" "),n("p",[s._v("还是在官网的那个下载页面下载，但是这次选择下载的是 Source Code 源码，还是原样 ftp 导入后解压，方法同上。")]),s._v(" "),n("p",[s._v("之后我们进入到源码目录中，进行编译三板斧：")]),s._v(" "),n("div",{staticClass:"language-bash line-numbers-mode"},[n("pre",{pre:!0,attrs:{class:"language-bash"}},[n("code",[s._v("./configure\n"),n("span",{pre:!0,attrs:{class:"token function"}},[s._v("make")]),s._v("\n"),n("span",{pre:!0,attrs:{class:"token function"}},[s._v("make")]),s._v(" "),n("span",{pre:!0,attrs:{class:"token function"}},[s._v("install")]),s._v("\n")])]),s._v(" "),n("div",{staticClass:"line-numbers-wrapper"},[n("span",{staticClass:"line-number"},[s._v("1")]),n("br"),n("span",{staticClass:"line-number"},[s._v("2")]),n("br"),n("span",{staticClass:"line-number"},[s._v("3")]),n("br")])]),n("p",[s._v("经过一段及其漫长的编译过程后……（make 真的漫长，等了得有 20 分钟，可能是我云服务器配置太差 %>_<%）就能自动的在全局使用 node 和 npm 命令啦~")]),s._v(" "),n("p",[s._v("如果你的在服务器上不行的话，加上这一句试试：")]),s._v(" "),n("div",{staticClass:"language-bash line-numbers-mode"},[n("pre",{pre:!0,attrs:{class:"language-bash"}},[n("code",[n("span",{pre:!0,attrs:{class:"token function"}},[s._v("cp")]),s._v(" /usr/local/bin/node /usr/sbin/\n")])]),s._v(" "),n("div",{staticClass:"line-numbers-wrapper"},[n("span",{staticClass:"line-number"},[s._v("1")]),n("br")])]),n("p",[s._v("这种方式是最推荐使用的，出问题的可能性最小，卸载修改也都很好解决。缺点是……实在是太麻烦了……")]),s._v(" "),n("h3",{attrs:{id:"_3-第三种方式-通过系统安装-apt-get-或-yum-等方式安装-nodejs"}},[n("a",{staticClass:"header-anchor",attrs:{href:"#_3-第三种方式-通过系统安装-apt-get-或-yum-等方式安装-nodejs"}},[s._v("#")]),s._v(" 3. 第三种方式，通过系统安装 apt-get 或 yum 等方式安装 nodejs")]),s._v(" "),n("p",[s._v("我写这种方式在这里只是因为确实可以下载并安装。但我这里就不写过程了，因为这种方式下载到的安装包不仅下载慢，下载完成后的包版本还可能不是最新的，安装后还可能出现各种各样的问题，非常的不推荐使用。")]),s._v(" "),n("p",[s._v("（完）")])])}),[],!1,null,null,null);a.default=t.exports}}]);