---
title: css 的垂直居中方法
categories: CSS
tags: css
abbrlink: b04a
date: 2018-03-14 16:51:25
---

CSS 是每一个前端工程师都绕不过去的坎，熟练运用 CSS 后，实现同样一种效果我们可以有很多种写法，但由于兼容问题，通常简洁的写法并不能实现全平台统一效果，复杂的写法对性能又不太友好，导致我们在编写 CSS 过程中有很多需要注意的点，要踩很多的坑，因此用一个笔记来集中记录一下方法。

<!-- more -->

（为方便表达代码，在此定义 html 结构为：

```html
  <div class="parent">
    <div class="target"></div>
  </div>
```

默认的 css 样式为：

```css
  .parent {
    background-color: #ccc;
    width: 100%;
    height: 400px;
  }
  .target {
    background-color: #333;
    width: 25%;
    height: 100px;
  }
```

行内元素 html 结构改为：

```html
  <div class="parent">
    <label class="target">Duang</label>
  </div>
```

css 样式改为：

```css
  .target {
    background-color: #eee;
    font-size: 25px;
  }
```

以下无特殊说明的话结构都使用这个。

## 水平居中

### 1. 行内元素

只需要把行内元素包裹在一个属性 display 为 block 的父层元素中，并且把父层元素添加 text-align:center 即可：

```css
  .parent {
    text-align: center;
  }
```

![text-align](https://cdn.jsdelivr.net/gh/realDuang/blog-storage/images/20200713145226.png)

### 2. 块状元素

对于块状元素来说，我们需要将它的左右外边距（即，margin-left，margin-right）设置为 auto，即可实现块状元素的居中，如下：

```css
  .target {
    margin: 0 auto;
  }
```

![margin-0-auto](https://cdn.jsdelivr.net/gh/realDuang/blog-storage/images/20200713144819.png)

## 垂直居中

### 1. 行内元素单行居中

对于单行行内元素来说，垂直居中就是设定父元素行高等于其块状元素高度。

```css
  .parent {
    line-height: 400px;
  }
  .target {
    display: inline-block;
  }
```

![line-height](https://cdn.jsdelivr.net/gh/realDuang/blog-storage/images/20200715165311.png)

### 2. 行内元素多行居中

这个使用的手段是比较复杂的，我这里组合使用 display:table-cell 和 vertical-align:middle 属性来定义需要居中的元素的父容器元素，但是缺点有很多，比如这里因为格式变成了 table 类型，宽高必须设置成定值才行，希望有大佬提出更好的解决方法。

```css
  .parent {
    display: table-cell;
    width: 400px;
    vertical-align:middle;
  }
```

![table-cell](https://cdn.jsdelivr.net/gh/realDuang/blog-storage/images/20200715165348.png)

## 水平垂直居中

这里的方法同样适用于仅水平或者仅垂直居中。取与之相关的居中代码即可。

### 1. 最通用且实用的首选方法

在不知道自己高度和父容器高度的情况下，给父元素设置相对定位，子元素绝对定位，然后按照向右向下偏移的办法移到中心位置即可。

这里绝对定位的好处是无论父元素的实际高度以及子元素的个数，都能够完成覆盖型的居中显示。

代码示例如下：

```css
  .parent {
    position: relative;
  }
  .target {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
```

（注：其实这里可以不用知道父子元素高度，为了方便显示才使用）

![absolute-top-left](https://cdn.jsdelivr.net/gh/realDuang/blog-storage/images/20200715165411.png)

### 2. 已知父元素的高度，并且子元素有且只有一个

如果已知父元素的高度，并且子元素有且只有一个的话，完全可以只对子元素使用相对定位完成同样的效果：

```css
  .target {
    position: relative;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
```

![relative-top-left](https://cdn.jsdelivr.net/gh/realDuang/blog-storage/images/20200715165411.png)

### 3. 多个子元素自适应的同时水平垂直居中

如果想实现多个子元素自适应的同时水平垂直居中，同时浏览器兼容性也支持的不错的话，推荐使用简单方便的 flex 布局。仅仅只设定父元素 display 属性为 flex 即可。

```css
  .parent {
    display: flex;
    align-items: center;
    justify-content: center;
  }
```

![flex](https://cdn.jsdelivr.net/gh/realDuang/blog-storage/images/20200715165507.png)

### 4. table-cell 方式

附加一个兼容性更好但是不太推荐的方法，就是由刚才多行行内元素垂直居中衍生出来的，再加一行行内水平居中的代码就能解决了。

```css
  .parent {
    display: table-cell;
    width: 400px;
    vertical-align:middle;
    text-align: center;
  }
```

![table-cell](https://cdn.jsdelivr.net/gh/realDuang/blog-storage/images/20200715165534.png)

不太推荐的原因同垂直居中时说的。

而且想实现这个效果还不如直接用一个块状元素包裹这些行内元素，然后再用块状元素的水平垂直居中即可，当然显示方式可能会有少许的不同，自己斟酌使用吧~
