---
title: es6学习笔记（一）
date: 2017-4-16 22:41:33
categories: "es6学习笔记"
tags:
---
es6学习笔记（一）
===

最近在尝试学习新框架，感觉学习曲线异常的陡峭，全然没有当时学习bootstrap和jquery的顺畅感觉。后面仔细想来，自己应该是缺了一些基础知识没有补上来，才会导致框架学习遇到了极大的阻力。那自己的知识栈到底缺失了哪一块呢？没错，就是面向未来的javascript语法————ES6。

那么现在开始恶补吧，还不算晚。我将我的学习过程记录下来，为自己做notes，也与各位分享。

---

这个学习笔记我决定由浅入深，先说说es6中最有用、最常用的一些新特性，并举例子介绍它们的特点，所举例子大部分参考自阮一峰老师的 [《ECMAScript 6 入门》](http://es6.ruanyifeng.com/)。这本书可是es6入门的一本佳作，更难能可贵的是还获得了开源许可，推荐大家一读。

好了言归正传，这一期我准备先来介绍es6新增的用来定义变量的新命令。

---

let命令
---

只要是听过es6大名的人，第一个想到的应该就是let命令，因为它的出现一举解决了es5时代的许多莫名其妙的变量提升，变量污染的问题。

我们都知道，es5以前的规范中，javascript并没有作用域作用块的概念，唯一能够限制使用var定义的变量不溢出的块只有函数包裹的块。其他的任何方式都很容易一个不小心就把局部变量泄漏了出去。比如这样：

```javascript
function fun() {
    var a = 1;
}
console.log(a)  //ReferenceError: a is not defined

{
    var b = 1;
}
console.log(b);  // 1

for(var c = 0; c < 5; c++){

};
console.log(c)  // 5
```

但是自从引入了let命令，js就有了作用域和代码块，我们可以定义只在块作用域(使用花括号括起来的作用域，包括函数、对象等)中作用的变量了。

```javascript
function fun() {
    let a = 1;
}
console.log(a)  //ReferenceError: a is not defined

{
    let b = 1;
}
console.log(b);  //ReferenceError: b is not defined

for(let c = 0; c < 5; c++){

};
console.log(c)  //ReferenceError: c is not defined
```

这就是let的特性。

---

那么有了这个新的定义变量的命令，我们就能解决许多从前我们极其痛恨过的js缺陷了。

1. 妈妈再也不用担心我的变量提升

我们都知道，var命令会发生”变量提升“现象，即变量可以在声明之前使用，值为undefined。而let命令改变了语法行为，它所声明的变量一定要在声明后使用，否则报错。

```javascript
console.log(a);  //undefined
var a = 1;

console.log(b);  //ReferenceError: b is not defined
let b = 1;
```

写很长的代码时，经常会遇到很尴尬的事儿：忘记自己定义过了一个变量导致重复定义，或在变量声明前就使用这个变量，从而导致意料之外的行为。

我们来看一道超级经典的面试题,var a=a 的运算结果：

```javascript
var a = a;
console.log(a);  //undefined

let b = b;
console.log(b);  //ReferenceError: b is not defined
```

由于var定义的变量存在变量提升，因此a变量被提前定义，值为undefined。再由js语法中运算符的计算顺序是从右到左，因此在右侧的a先进行运算，此时a的值为undefined，因此左侧的a被赋值为undefined。

对这么简单的代码，里面包含的过程就是这么复杂。

但是没必要啊，粗略一看这样的赋值行为就是不合理的，怎么能在没声明变量前就先使用了这个变量呢。于是let命令告诉了我们，再也不会有这样的事情了。

---

2. 解决闭包缺陷变得so easy

还是让我们再来看一道超级经典的面试题，求以下a数组中任意一个项目的值：

```javascript
var a = [];
for (var i = 0; i < 5; i++) {
    (a[i] = function () {
        return i;
    })();
}

console.log(a[2]());  //5
```

很明显我们看到，这是一个由闭包引发的灾难，内部函数持续保持对i的引用导致最后取值的时候获得的都是已经被循环完成后的值了。

那么以前我们会怎么解决呢？很简单，会再加一层闭包，保持对当前i的引用，并立即执行掉：

```javascript
var a = [];
for (var i = 0; i < 5; i++) {
    (function(i){
        a[i] = function () {
            return i;
        }
    })(i);
}

console.log(a[2]());  //2
```

或者干脆将函数移出循环体：

```javascript
var a = [];

function fun(i) {
    return function(){
        return i;
    };
}
for (var i = 0; i < 5; i++) {
    a[i] = fun(i);
}

console.log(a[2]());  //2
```

看看，为了解决个这么小的问题，这代码一下就变得复杂了起来。

有了let命令，这一切问题都不存在了：

```javascript
var a = [];
for (let i = 0; i < 5; i++) {
    (a[i] = function () {
        return i;
    })();
}

console.log(a[2]());  //2
```

const命令
---

const命令又是另外一个用来声明变量的常用命令。const声明一个只读的常量。一旦声明，常量的值就不能改变。

这个命令我感觉尤其在nodejs里面使用的多，包括定义端口呀、定义服务指令呀都需要用到它。

对于这个命令，我们只需要知道一点：

>const实际上保证的，并不是变量的值不得改动，而是变量指向的那个内存地址不得改动。

也就是说，我们不能改变使用const定义的基本数据类型，但定义的函数、数组、对象等引用类型里面的值我们还是可以随意更改的。

```javascript
const a = 1;
a = 2;  //TypeError: Assignment to constant variable.
console.log(a);

const b = [1, 2];
b[0] = 2;
b.push(3);
console.log(b);  //[ 2, 2, 3 ]
```

如果你连这点权利也不让这个变量使用的话，那真是太没人性了！
（悄悄的告诉你，使用Object.freeze()函数吧，他会锁死引用对象，不让其中的数据增删改。：）