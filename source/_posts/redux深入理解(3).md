---
title: Redux 深入理解 (3)
categories: JavaScript
tags: React
abbrlink: 1db5
date: 2017-12-03 13:00:52
---

上一节说到，reducer 是一个纯函数。那么纯函数具体的定义是什么呢？阮一峰老师是这样说的：

纯函数是函数式编程的概念，必须遵守以下一些约束。

> - 不得改写参数
>
> - 不能调用系统 I/O 的 API
>
> - 不能调用`Date.now()`或者`Math.random()`等不纯的方法，因为每次会得到不一样的结果

<!-- more -->

我们知道，处理业务逻辑的过程中不可避免的要用到异步操作，而 reducer 是一个纯函数，无法完成这项使命，那怎么办呢？

这又是一个非常复杂的故事了。

首先我想到的是，`action`不是由`actionCreator`函数生成的吗？我们可以在`actionCreator`函数里面进行异步操作，返回不同的`payload`，问题不就解决了吗？但是问题又来了，之前说过，reducer 不能接收一个函数作为参数传入啊。

事实上，著名的中间件`redux-thunk`就是处理这样的问题的，使得`actionCreator`方法能接受一个返回 action 对象的函数作为返回值。

那么这里就引入了一个中间件的概念。中间件实际上就是用来修饰 reducer 操作，增强 reducer 函数功能的。

我们来看看 redux 中间件是怎么运作的：

> 若 reducer 涉及到异步操作，则必须使用中间件。创建 store 时使用`applyMiddleware(middleware)(createStore)(reducer, initialState)`来创建 store

这看起来实在是太绕了……

实际上，我们可以将`applyMiddleware(middleware)`看成一个修饰器，用来修饰`createStore(reducer, initialState)`函数。是不是看明白了一点？

因此，这个函数我们也能写成这样：

```js
const store = createStore(
  reducer,
  initial_state,
  applyMiddleware(middleware)
);
```

将`applyMiddleware(middleware)`作为`createStore`的最后一个参数传入，现在是不是好理解多了？

另外，中间件的传入是有顺序讲究的，涉及到执行顺序的问题，通过 redux 中`applyMiddleware`的源码中可以看出，`applyMiddleware(middleware1，middleware2，middleware3)`的实际执行顺序为`store.dispatch`=>`middleware1`=>`middleware2`=>`middleware3`。这一点一定要非常小心，比如著名的 redux-logger 中间件是用来记录操作日志的，一定要放在最后一个参数中以便第一时间执行。

redux 中间件的各种组件可谓是博大精深，有各种各样好用的中间件让人去探索学习，本文着重讲解 redux 本身的原理，对中间件插件就不多做介绍了。
