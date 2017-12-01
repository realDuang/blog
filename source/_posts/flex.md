---
title: flex布局初体验
date: 2017-05-25 14:17:25
categories: "css"
tags: "css"
---

---

还在为各种布局的hack方法犯愁么？还在想着网上流传的各类垂直居中存在的各种奇怪bug而影响工作体验么？还在为找不到一个合适自己的规范而疯狂造轮子么？现在，一个全新的布局解决方案规范已经展现在我们面前，它就是flex布局。只要998，各类布局完美解决方案带回家！

> 2009年，W3C提出了一种新的方案—-Flex布局，可以简便、完整、响应式地实现各种页面布局。目前，它已经得到了所有浏览器的支持，这意味着，现在就能很安全地使用这项功能。

看到没，w3c大佬亲自提出来，这权威性不用质疑了吧。

Flex 是 Flexible Box 的缩写，意为"弹性布局"，用来为盒状模型提供最大的灵活性。任何一个容器都可以指定为Flex布局，包括行内元素。只需要设置元素的display为flex或者flex-inline即可。需要注意的是，元素设为 Flex 布局以后，它的子元素的float、clear和vertical-align属性将失效。

好，接下来我们就来看看，flex布局到底是个什么样的布局原理和思想。以下内容摘自阮一峰老师的[Flex 布局教程](http://www.ruanyifeng.com/blog/2015/07/flex-grammar.html?utm_source=tuicool):

>采用 Flex 布局的元素，称为 Flex 容器（flex container），简称"容器"。它的所有子元素自动成为容器成员，称为 Flex 项目（flex item），简称"项目"。

![flex结构图](https://raw.githubusercontent.com/kelekexiao123/markdown-image/master/flex-02.png)

>容器默认存在两根轴：水平的主轴（main axis）和垂直的交叉轴（cross axis）。主轴的开始位置（与边框的交叉点）叫做main start，结束位置叫做main end；交叉轴的开始位置叫做cross start，结束位置叫做cross end。项目默认沿主轴排列。单个项目占据的主轴空间叫做main size，占据的交叉轴空间叫做cross size。

因此啊，我们只需要关注当前元素的水平轴和垂直轴位置，即可完全定位整个元素，是不是很有道理呢？

具体的工具教程请自行查阅相关文档，这里我随便给个[传送门](http://www.runoob.com/w3cnote/flex-grammar.html)，要授人以渔喔。

demo分割线
---

那我带大家做什么呢？当然是做demo啦，这种东西实用，进步最快啦。

先给大家上个效果图：

![demo示例](https://raw.githubusercontent.com/kelekexiao123/markdown-image/master/flex-01.png)

这是一个自适应宽高的九个骰子图（好吧我知道骰子没有9个），大家先根据以往的经验，每个骰子应该怎样实现，再用flex布局试一次。

然后附上我的实现代码：[flex_demo](https://github.com/kelekexiao123/markdown-image/blob/master/flex-test.html)

因为我也是新手嘛，如果大家有什么更好的想法和建议，欢迎留言或者pull request呐～

