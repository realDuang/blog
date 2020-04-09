---
title: React16.8 useHook特性
date: 2020-01-21 18:19:28
categories: "JavaScript"
tags: "React"
---

React16.8迎来了大众期盼已久的函数式编程利器：`useHook`特性。它能大大增强函数式组件的能力，使得立即执行的、没有生命周期与state等等类组件特性的函数式组件拥有相同的能力。

`useHook`的原理实际上是利用了JavaScript的闭包机制，因此在多次执行函数的同时记住一些状态。

`useHook`拥有多种函数，我们也可以自定义自己的hook。在这里主要来说说其中最常用的两种，简述他们的大致原理，以及使用时的注意事项。

## useState

`useState`就是为了给纯函数组件加入class组件中的state能力。它返回一个有两个元素的数组，第一个元素是需要设置的state变量，第二个是改变这个变量的setter函数。`useState`的入参决定了返回变量的初始值。

在每一次执行setter之后，使用了`useState`的整个函数组件都会被重新执行一次。但是此时`useState`函数本身并不会被再次执行。这是因为实际上，`useState`利用了闭包的特性，在闭包内设置了一个私有变量。事实上setter改变的值是这个私有变量，我们能取出的变量是这个私有变量的getter返回值。

注意，只能在函数的最外层调用Hook，不能在循环、条件判断或子函数中使用。

这是因为，为了支持在同一个函数组件中使用多次`useState`，在闭包中，被`useState`的赋值的私有变量本质上是一个数组类型，通过函数首次被调用的`useState`的顺序来决定被赋值变量的索引位置，最后getter通过索引顺序找到希望取得的变量值。若在循环、条件判断或子函数中使用，则有可能造成函数组件重新执行时顺序与首次执行不一致，这将导致`useState`的取值混乱。

## useEffect

useEffect为纯函数组件提供了class组件中的`componentDidMount`、`componentDidUpdate`、`componentWillUnMount`、`shouldComponentUpdate`这些生命周期能力。

useEffect接收两个参数，第一个参数是一个函数，在函数中执行的动作相当于完成了`componentDidMount`、`componentDidUpdate`的工作，因为纯函数组件没有首次渲染和更新渲染的概念。该函数的返回值也是一个函数，若不为空的话它执行的时机等同于`componentWillUnMount`。

第二个参数是一个数组，传入的是需要监听props的变量，若填写该值，则每次props更新时，若变更变量不在监听范围内，则不更新组件，相当于`shouldComponentUpdate`。

## useMemo 和 useCallback

这两个API我拿在一起来说，原因很简单，他们的目标都是一致的，都是缓存结果，只不过`useCallback`是缓存函数本身，`useMemo`是缓存函数返回的结果。从这里也可以看出，实际上，`useCallback`是可以被`useMemo`通过多包裹一层函数实现的。

这两个API的函数签名与useEffect基本一致，因此调用方法区别不大。在用法功能上，他们之间区别最大的一点是，useEffect是处理副作用的，是在render函数执行完后执行的，相当于class组件的`didMount/didUpdate`。而这两个API不能处理副作用，必须同步调用，即在哪里调用就在哪里立即执行函数内容，在下一行就能直接使用返回的结果。

那么，这两个API的使用情景是什么呢？答案是性能优化。我们先来看看需要使用`useMemo`的情况：

```js
...
function keywordChangeCompute(keyword) {
  /* 执行一些非常消耗资源的同步操作 */
}
const [keyword, setKeyword] = useState('')
useMemo(() => {
  keywordChangeCompute(keyword)
},[keyword])
```

若不使用`useMemo`而直接将函数调用写在render中的话，当外部组件或者该组件的其他state进行频繁的更新时，该组件会不断地多次触发`keywordChangeCompute`函数，造成不必要的性能损失。而对于使用了`useMemo`来说，只在`keyword`变化的时候才会触发一次函数调用，这与`useEffect`的触发机制是一致的。

对于`useCallback`的使用，有一种情况是非常实用的，即该方法会被传给子组件的情况：

```js
const [status, setStatus] = useState(false)
const onChange = (value) => {
  fetch(`/api/get/${value}/${status}`)
}

return (
  <>
    <ChildComponent onChange={useCallback(onChange，[status])}>
  </>
)
```

因为父组件在每一次更新的时候都会生成一个全新的`onChange`函数，而由于`status`状态不变，新的`onChange`函数并没有改变，这样会导致子组件进行一次没必要的更新，造成性能损失。而使用了`useCallback`后，只会在`status`状态更新时生成新的函数传给子组件，从而减少子组件渲染次数。
