---
title: React16.8 useHook特性
date: 2020-01-21 18:19:28
categories: "JavaScript"
tags: "React"
---

React16.8迎来了大众期盼已久的函数式编程利器：`useHook`特性。它能大大增强函数式组件的能力，使得立即执行的、没有生命周期与state等等类组件特性的函数式组件拥有相同的能力。

`useHook`的原理实际上是利用了JavaScript的闭包机制，因此在多次执行函数的同时记住一些状态。

`useHook`拥有多种函数，我们也可以自定义自己的hook。在这里主要来说说其中最常用的两种，简述他们的大致原理，以及使用时的注意事项。

# useState

`useState`就是为了给纯函数组件加入class组件中的state能力。它返回一个有两个元素的数组，第一个元素是需要设置的state变量，第二个是改变这个变量的setter函数。`useState`的入参决定了返回变量的初始值。

在每一次执行setter之后，使用了`useState`的整个函数组件都会被重新执行一次。但是此时`useState`函数本身并不会被再次执行。这是因为实际上，`useState`利用了闭包的特性，在闭包内设置了一个私有变量。事实上setter改变的值是这个私有变量，我们能取出的变量是这个私有变量的getter返回值。

注意，只能在函数的最外层调用Hook，不能在循环、条件判断或子函数中使用。

这是因为，为了支持在同一个函数组件中使用多次`useState`，在闭包中，被`useState`的赋值的私有变量本质上是一个数组类型，通过函数首次被调用的`useState`的顺序来决定被赋值变量的索引位置，最后getter通过索引顺序找到希望取得的变量值。若在循环、条件判断或子函数中使用，则有可能造成函数组件重新执行时顺序与首次执行不一致，这将导致`useState`的取值混乱。

# useEffect

useEffect为纯函数组件提供了class组件中的`componentDidMount`、`componentDidUpdate`、`componentWillUnMount`、`shouldComponentUpdate`这些生命周期能力。

useEffect接收两个参数，第一个参数是一个函数，在函数中执行的动作相当于完成了`componentDidMount`、`componentDidUpdate`的工作，因为纯函数组件没有首次渲染和更新渲染的概念。该函数的返回值也是一个函数，若不为空的话它执行的时机等同于`componentWillUnMount`。

第二个参数是一个数组，传入的是需要监听props的变量，若填写该值，则每次props更新时，若变更变量不在监听范围内，则不更新组件，相当于`shouldComponentUpdate`。
