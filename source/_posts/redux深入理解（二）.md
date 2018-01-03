---
title: redux深入理解（二）
date: 2017-12-01 12:44:56
categories: "JavaScript"
tags: "react"
description: "学习react的过程中，redux的熟练掌握是一个绕不开并且很难绕过去的坎。接触react已经有一段时间了，甚至连一些小项目都用react做了不少了，但redux的使用上还是有诸多不理解不熟练的地方。正好有很长一段时间没有更过博客了，就从这里着手，增强一下自己的理解。"
---

---

在理解了redux的作用原理后，我们来看看redux的基本概念。

### state

`state`：state是状态管理的根本。在redux中，有唯一的状态树state，为整个应用共享。本质上是一个普通对象。处于程序逻辑中，无法直接调用。

### store

`store`：store是state的管理者，一个应用同样只有唯一的store，管理着唯一的state。store包含下列四个函数：

> `getState()` ：用于获取整个state
>
> `dispatch(action)` ：View触发action 改变 state 的**唯一途径**，请注意我用了**唯一**这个词
>
> `subscribe(listener)` ：可以理解成是 DOM 中的 addEventListener ，也就是我在上一篇里说过的发布订阅模式中的订阅方法，在redux的使用中，这个方法通常不需要手动使用，一般会放在setState方法中。
>
> `replaceReducer(nextReducer)` ：这个不太常用，一般在 Webpack Code-Splitting 按需加载的时候用获取state的方式：

这几个方法中，`dispatch`函数略微难理解一点，单独提出来说说。

### dispatch

`dispatch(action)`用于View层想要更改 state 的操作，发布订阅模式中的发布操作。用于通知store做相应变更。

那么怎么让store知道变更哪一个属性呢？这里就要提到`action`了。`action`实际上是一个包含了`type`属性以及`payload`对象属性（这个叫载荷，不是必须的，但是在规范里推荐使用）的普通对象。其中`type`属性定义了应该进行的操作名。

我们从这里可以看出，由于载荷的存在，通常我们需要对`action`进行一些处理，因此，通常`action`对象由一个返回`action`对象的普通函数生成，一般我们称之为`actionCreator`函数。

`actionCreator`函数不仅可以直接返回`action`对象，也可以返回一个闭包，闭包传入的参数可以为我们刚才介绍的store中的四个函数，最终结果必须返回一个`action`对象。

> 注：`actionCreator`函数不能直接当做参数传入dispatch中，必须引入中间件`redux-thunk`。

### createStore

于是问题来了，既然`state`是由`store`生成和管理的，那么这个`store`又是怎么来的呢？生成store的方式又需要用到一个新的函数：`createStore(reducer, intialState, applyMiddleware)`。（`initialState`参数可以设置初始state，非必须。`applyMiddleware(middlewares)`方法用于引入中间件，这里按住不表）这里又引出来一个新东西：reducer，这是干什么的呢？

### reducer

刚刚说到的 action ，我的简单的理解是：type的值就是函数名，payload的值就是函数的传入参数。那么这个特殊的“函数”在哪里执行呢？redux的思想是：当View层调用`dispatch`方法，发出相应的`action`给`store`，`store` 收到 `action` 以后，必须给出一个新的 `state`，这样 View 才会发生变化。这种 `state` 的计算过程就叫做 `reducer`。

`reducer(oldState, action)`是一个纯函数（指任何时候输入同一个数据，返回的数据永远都相同，也就是说reducer函数中的处理不能带有任何异步操作），`reducer`负责对`state`操作，接收旧的state和action，根据`action.type`的类型以及`action.payload`中的数据，处理state并返回。

```js
const reducer = (state, action) => {
  switch (action.type) {
    case 'ADD':
      return {
        ...state,
        count: state.count + action.payload.num;
      }
    case 'DELETE':
      return {
        ...state,
        count: state.count - action.payload.num;
      }
    default: 
      return state;
  }
};
```



一行代码简单来说就是`(oldState, action) => newState`。由于`reducer`是直接替换`state`，因此`reducer`必须有返回值。不然整个redux就会得不到`state`了。

话说一个计算变化重新生成state的方法为什么要叫reducer呢？我查了查资料，原来这个方法可以作为数组的`reduce`方法的参数。使用方法如下：

```js
const actions = [
  { type: 'ADD', payload: {num: 1} },
  { type: 'ADD', payload: {num: 2} }
];

const newState = actions.reduce(reducer, state); // {..., count: 3}
```



由于redux中，`reducer`和`state`一样，也是唯一的，因此如果我们需要根据不同的处理逻辑分割`reducer`的话，需要用`combineReducers({reducer})`将这些`reducer`合并成一个`rootReducer`。



