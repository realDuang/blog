(window.webpackJsonp=window.webpackJsonp||[]).push([[18],{564:function(e,t,r){"use strict";r.r(t);var l=r(11),a=Object(l.a)({},(function(){var e=this,t=e.$createElement,r=e._self._c||t;return r("ContentSlotsDistributor",{attrs:{"slot-key":e.$parent.slotKey}},[r("div",{staticClass:"custom-block tip"},[r("p",{staticClass:"title"}),r("p",[e._v("还在为各种布局的 hack 方法犯愁么？还在想着网上流传的各类垂直居中存在的各种奇怪 bug 而影响工作体验么？还在为找不到一个合适自己的规范而疯狂造轮子么？现在，一个全新的布局解决方案规范已经展现在我们面前，它就是 flex 布局。只要 998，各类布局完美解决方案带回家！")])]),e._v(" "),r("blockquote",[r("p",[e._v("2009 年，W3C 提出了一种新的方案—-Flex 布局，可以简便、完整、响应式地实现各种页面布局。目前，它已经得到了所有浏览器的支持，这意味着，现在就能很安全地使用这项功能。")])]),e._v(" "),r("p",[e._v("看到没，w3c 大佬亲自提出来，这权威性不用质疑了吧。")]),e._v(" "),r("p",[e._v('Flex 是 Flexible Box 的缩写，意为"弹性布局"，用来为盒状模型提供最大的灵活性。任何一个容器都可以指定为 Flex 布局，包括行内元素。只需要设置元素的 display 为 flex 或者 flex-inline 即可。需要注意的是，元素设为 Flex 布局以后，它的子元素的 float、clear 和 vertical-align 属性将失效。')]),e._v(" "),r("p",[e._v("好，接下来我们就来看看，flex 布局到底是个什么样的布局原理和思想。以下内容摘自阮一峰老师的 "),r("a",{attrs:{href:"http://www.ruanyifeng.com/blog/2015/07/flex-grammar.html?utm_source=tuicool",target:"_blank",rel:"noopener noreferrer"}},[e._v("Flex 布局教程"),r("OutboundLink")],1),e._v(":")]),e._v(" "),r("blockquote",[r("p",[e._v('采用 Flex 布局的元素，称为 Flex 容器（flex container），简称"容器"。它的所有子元素自动成为容器成员，称为 Flex 项目（flex item），简称"项目"。')])]),e._v(" "),r("p",[r("img",{attrs:{src:"https://cdn.jsdelivr.net/gh/realDuang/blog-storage/images/flex-02.png",alt:"flex 结构图"}})]),e._v(" "),r("blockquote",[r("p",[e._v("容器默认存在两根轴：水平的主轴（main axis）和垂直的交叉轴（cross axis）。主轴的开始位置（与边框的交叉点）叫做 main start，结束位置叫做 main end；交叉轴的开始位置叫做 cross start，结束位置叫做 cross end。项目默认沿主轴排列。单个项目占据的主轴空间叫做 main size，占据的交叉轴空间叫做 cross size。")])]),e._v(" "),r("p",[e._v("因此啊，我们只需要关注当前元素的水平轴和垂直轴位置，即可完全定位整个元素，是不是很有道理呢？")]),e._v(" "),r("p",[e._v("具体的工具教程请自行查阅相关文档，这里我随便给个 "),r("a",{attrs:{href:"http://www.runoob.com/w3cnote/flex-grammar.html",target:"_blank",rel:"noopener noreferrer"}},[e._v("传送门"),r("OutboundLink")],1),e._v("，要授人以渔喔。")]),e._v(" "),r("h2",{attrs:{id:"demo-分割线"}},[r("a",{staticClass:"header-anchor",attrs:{href:"#demo-分割线"}},[e._v("#")]),e._v(" demo 分割线")]),e._v(" "),r("p",[e._v("那我带大家做什么呢？当然是做 demo 啦，这种东西实用，进步最快啦。")]),e._v(" "),r("p",[e._v("先给大家上个效果图：")]),e._v(" "),r("p",[r("img",{attrs:{src:"https://cdn.jsdelivr.net/gh/realDuang/blog-storage/images/flex-01.png",alt:"demo 示例"}})]),e._v(" "),r("p",[e._v("这是一个自适应宽高的九个骰子图（好吧我知道骰子没有 9 个），大家先根据以往的经验，每个骰子应该怎样实现，再用 flex 布局试一次。")]),e._v(" "),r("p",[e._v("然后附上我的实现代码："),r("a",{attrs:{href:"https://github.com/realDuang/blog-storage/master/flex-test.html",target:"_blank",rel:"noopener noreferrer"}},[e._v("flex_demo"),r("OutboundLink")],1)]),e._v(" "),r("p",[e._v("如果大家有什么更好的想法和建议，欢迎留言或者 pull request 呐～")])])}),[],!1,null,null,null);t.default=a.exports}}]);