import{_ as n,c as s,a as r,b as e,d as t,e as l,r as a,o as c}from"./app-srr4GW5I.js";const i={},d=r('<div class="custom-container tip"><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"></circle><path d="M12 8h.01"></path><path d="M11 12h1v4h1"></path></g></svg><p class="custom-container-title">提示</p><p>还在为各种布局的 hack 方法犯愁么？还在想着网上流传的各类垂直居中存在的各种奇怪 bug 而影响工作体验么？还在为找不到一个合适自己的规范而疯狂造轮子么？现在，一个全新的布局解决方案规范已经展现在我们面前，它就是 flex 布局。只要 998，各类布局完美解决方案带回家！</p></div><blockquote><p>2009 年，W3C 提出了一种新的方案—-Flex 布局，可以简便、完整、响应式地实现各种页面布局。目前，它已经得到了所有浏览器的支持，这意味着，现在就能很安全地使用这项功能。</p></blockquote><p>看到没，w3c 大佬亲自提出来，这权威性不用质疑了吧。</p><p>Flex 是 Flexible Box 的缩写，意为&quot;弹性布局&quot;，用来为盒状模型提供最大的灵活性。任何一个容器都可以指定为 Flex 布局，包括行内元素。只需要设置元素的 display 为 flex 或者 flex-inline 即可。需要注意的是，元素设为 Flex 布局以后，它的子元素的 float、clear 和 vertical-align 属性将失效。</p>',4),m={href:"http://www.ruanyifeng.com/blog/2015/07/flex-grammar.html?utm_source=tuicool",target:"_blank",rel:"noopener noreferrer"},h=e("blockquote",null,[e("p",null,'采用 Flex 布局的元素，称为 Flex 容器(flex container)，简称"容器"。它的所有子元素自动成为容器成员，称为 Flex 项目(flex item)，简称"项目"。')],-1),p=e("p",null,[e("img",{src:"https://cdn.jsdelivr.net/gh/realDuang/blog-storage/images/flex-02.png",alt:"flex 结构图"})],-1),_=e("blockquote",null,[e("p",null,"容器默认存在两根轴：水平的主轴(main axis)和垂直的交叉轴(cross axis)。主轴的开始位置(与边框的交叉点)叫做 main start，结束位置叫做 main end；交叉轴的开始位置叫做 cross start，结束位置叫做 cross end。项目默认沿主轴排列。单个项目占据的主轴空间叫做 main size，占据的交叉轴空间叫做 cross size。")],-1),u=e("p",null,"因此啊，我们只需要关注当前元素的水平轴和垂直轴位置，即可完全定位整个元素，是不是很有道理呢？",-1),g={href:"http://www.runoob.com/w3cnote/flex-grammar.html",target:"_blank",rel:"noopener noreferrer"},x=e("h2",{id:"demo-分割线",tabindex:"-1"},[e("a",{class:"header-anchor",href:"#demo-分割线"},[e("span",null,"demo 分割线")])],-1),f=e("p",null,"那我带大家做什么呢？当然是做 demo 啦，这种东西实用，进步最快啦。",-1),b=e("p",null,"先给大家上个效果图：",-1),k=e("p",null,[e("img",{src:"https://cdn.jsdelivr.net/gh/realDuang/blog-storage/images/flex-01.png",alt:"demo 示例"})],-1),w=e("p",null,"这是一个自适应宽高的九个骰子图(好吧我知道骰子没有 9 个)，大家先根据以往的经验，每个骰子应该怎样实现，再用 flex 布局试一次。",-1),v={href:"https://github.com/realDuang/blog-storage/master/flex-test.html",target:"_blank",rel:"noopener noreferrer"},F=e("p",null,"如果大家有什么更好的想法和建议，欢迎留言或者 pull request 呐～",-1);function q(B,C){const o=a("ExternalLinkIcon");return c(),s("div",null,[d,e("p",null,[t("好，接下来我们就来看看，flex 布局到底是个什么样的布局原理和思想。以下内容摘自阮一峰老师的 "),e("a",m,[t("Flex 布局教程"),l(o)]),t(":")]),h,p,_,u,e("p",null,[t("具体的工具教程请自行查阅相关文档，这里我随便给个 "),e("a",g,[t("传送门"),l(o)]),t("，要授人以渔喔。")]),x,f,b,k,w,e("p",null,[t("然后附上我的实现代码："),e("a",v,[t("flex_demo"),l(o)])]),F])}const S=n(i,[["render",q],["__file","2017-05-25.html.vue"]]),D=JSON.parse('{"path":"/blogs/frontend-basics/2017-05-25.html","title":"Flex 布局体验","lang":"en-US","frontmatter":{"title":"Flex 布局体验","date":"2017-05-25T14:17:25.000Z","categories":["前端基础"],"tags":["CSS"]},"headers":[{"level":2,"title":"demo 分割线","slug":"demo-分割线","link":"#demo-分割线","children":[]}],"git":{"createdTime":1738930383000,"updatedTime":1738930383000,"contributors":[{"name":"Duang Cheng","email":"longcheng@microsoft.com","commits":1}]},"filePathRelative":"blogs/frontend-basics/2017-05-25.md"}');export{S as comp,D as data};
