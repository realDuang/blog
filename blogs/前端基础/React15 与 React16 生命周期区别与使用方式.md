---
title: React15 与 React16 生命周期区别与使用方式
date: 2019/12/21 17:38:35
categories: 
  - 前端基础
tags: 
  - JavaScript
  - React
---

:::tip
因为 React16 框架使用了全新的`Fiber`架构，这其中有一个特性叫做`async rendering`，render 过程可中断，因此，render 函数之前的所有生命周期函数都有可能被多次执行，如果在这些函数中存在异步请求的话将会造成许多无用的请求被调用。
:::

<!-- more -->

## 为什么要变更生命周期

因为 React16 框架使用了全新的`Fiber`架构，这其中有一个特性叫做`async rendering`，render 过程可中断，因此，render 函数之前的所有生命周期函数都有可能被多次执行，如果在这些函数中存在异步请求的话将会造成许多无用的请求被调用。

涉及到的生命周期函数一共有 4 个：

> componentWillMount
>
> componentWillReceiveProps
>
> shouldComponentUpdate
>
> componentWillUpdate

很多开发者在`componentWillMount`或是`componentWillUpdate`里调用请求的原因是期望请求回更新的状态能在 render 之前刷新，但这样是不可能的，无论请求相应速度多快，异步操作的返回逻辑执行都会被安排在下一次 tick 之后，页面还是会被 render 两次。

而在`componentWillReceiveProps`写同步逻辑也会存在一些问题，如当父组件传入的 props 变更非常频繁的时候，`componentWillReceiveProps`的调用次数是非常多的，但若是将这些逻辑放入 render 及以后的周期函数中则并不会这样，这是因为 react 进行 setState 的时候是会通过`transaction`进行合并的，实际 render 的执行次数并不会增多。

因此，从合理性上来说，推荐将异步请求放在`componentDidMount`里，同步处理逻辑写在 render 中或使用`shouldComponentUpdate`优化直接省去 render 步骤。为了强制开发者彻底摈弃这样的使用习惯，官方在 React16 中干脆去掉了除了`shouldComponentUpdate`以外的其他声明周期。

但仍然有开发者需要在 render 之前获取到 props 的更新，因此官方增加了新的生命周期函数`getDrivedStateFromProps`。它的作用其实与`componentWillReceiveProps`差不多，但优势在于在多次变更 props 操作的过程中，它与 render 一样，只更新一次。

我画了一张图来清晰地展示 React 新旧生命周期过程的对比：

![React 新旧生命周期对比。png](https://cdn.jsdelivr.net/gh/realDuang/blog-storage/images/React%E6%96%B0%E6%97%A7%E7%94%9F%E5%91%BD%E5%91%A8%E6%9C%9F%E5%AF%B9%E6%AF%94.png)

## componentWillXX 生命周期函数的替代者

首先来看看这个新增引入的生命周期函数：

```typescript
static getDrivedStateFromProps(nextProps, prevState): newState || null
```

在组件创建和更新时都会调用，它能获取到更新的 props 与当前的 state，返回更新后的 state，若不需要进行更新则返回 null。

我们需要注意的是，这个函数一定需要写成 static 的静态函数，这样做的目的是不让开发者在这个函数中拿到 this，因此无法进行`setState`操作，使之变成一个纯函数。以这样的方式规范了 react 在 render 函数执行之前不做任何更新状态的异步请求。

## 如何在页面更新后立即获取到更新后的 DOM 信息

这就要提到 React16 的另一个生命周期函数：

```typescript
getSnapshotBeforeUpdate(prevProps, prevState): any
```

这个函数的作用时机是 render 函数之后，实际组件更新之前，这个时候组件无法进行更改但可以读取 DOM 中的信息，我们可以在这个阶段获取到如 `ref` 之类的真实 DOM 数据，并将结果传递给 componentDidUpdate(prevProps, prevState, snapshot) 中的第三个参数，从而在更新后可以根据当前 DOM 的数据进行状态的相应调整。

## React16 如何进行错误捕获与处理

因为 React 是基于 javascript 的框架，因此组件内部若存在 js 异常，将会阻断一些状态的更新，导致应用崩溃。而一般认为，在 UI 部分发生的异常不应该让整个应用 crash，为此在 React16.0 中，引入了一个新的异常处理捕获的生命周期函数`componentDidCatch`。

```ts
componentDidCatch(error, info)
```

它引入了一个新概念：`error boundary`，错误边界。它是一个内部包含`componentDidCatch`函数的 React 类组件，它用以捕获在整个**子组件树**的构造函数以及生命周期函数中的 JS 异常，从而渲染不同的子页面。

注意，由于它本质上还是利用了 React 类的生命周期，因此只能对类组件的错误捕获有效，并且只能对错误边界包裹的子组件（不包括自身）有效。

若没有在错误边界中被 catch 的 JS 错误将导致整个 React 组件被卸载。

与 try/catch 不同的是，错误边界保留了 React 声明式的特性，而前者适用于命令式的代码。并且错误边界能捕获组件树内部底层逻辑导致的错误，如在`componentDidUpdate`中的`setState`。
