---
title: Redux深入理解(4)
date: 2017-12-04 15:22:30
categories: "JavaScript"
tags: "React"
---

这一节主要来讲讲redux在react项目中的具体使用。

将学的新知识新组件集成进项目里是初学者最大的障碍，这也是我最初学习redux的时候很难有进展的原因。redux的源码体积很小，加起来连1k行都不到，利用的原理在之前已经说过，也很好理解，但由于redux只是flux对react的一种优化，但并不只是服务于react，如果你愿意，在vue中使用redux也是完全可行的，毕竟状态管理的思想还是不会变的嘛。

因此我们需要一个redux与react之间的连接件来方便我们的搭建，这就是`react-redux`。也是我们将redux合并进react最后也是最大的难点。

## `react-redux`的总体思想

> `react-redux` 将所有组件分成两大类：UI 组件和容器组件。

UI组件和容器组件的定义很好理解。

UI组件不负责任何的交互逻辑，只负责展示，类比于纯函数，它是一个“纯组件”。不应该有自己定义的state，所有的状态和事件动作应全由上层的props获取。

容器组件则跟UI组件相反，可以有自己的状态，能处理业务交互逻辑。

> `react-redux` 规定，所有的 UI 组件都由用户提供，容器组件则是由 `react-redux` 自动生成。也就是说，用户负责视觉层，状态管理则是全部交给它。

这个思想完美的解决了逻辑数据处理与UI界面耦合的问题，让程序的思路更清晰，极大地提高开发与调试效率，这也是为什么越大型的项目越需要使用这样的状态管理组件的根本原因。

------

之后我们来看看`react-redux`几个主要的功能方法：

## `<Provider store={store}><app></app></Provider>`

作为一个全局状态管理组件，我们首先应该想到的就是状态的传递。

最简单的想法是从应用的最外层传入当前的state状态，之后在接下来的每一层中层层props传递。但是这样做太麻烦了，而且很容易让传入状态难以维护，比如你要删去一个状态，就必须把这个组件下的所有子组件使用到这个状态的删除，不然就会报错。

我在[redux深入理解（一）](http://kelekexiao.cn/2017/11/30/redux%E6%B7%B1%E5%85%A5%E7%90%86%E8%A7%A3%EF%BC%88%E4%B8%80%EF%BC%89/)里面悄悄的提到了一个东西：context，也就是上下文，它可以实现祖先与后台之间的状态直接传值。这个特性被`react-redux`利用了，放入了Provider组件中。

<Provider>组件直接包裹在需要调用全局store的根组件的外层，然后传入属性store，即可在该根组件的任何后代组件中直接拿到state数据了。

如果你的项目还需要用到react-router的话，Provider组件应包裹在router组件的外层。

```jsx
<Provider store={store}>
  <Router>
    <Route path="/" component={App} />
  </Router>
</Provider>
```



## `connect(mapStateToProps, mapDispatchToProps)(App)`

之前说过，`react-redux`希望用户只编写UI组件而不用注意状态管理，容器组件则是由 `react-redux` 自动生成，那么生成的方法就是`connect()`方法，我们用它将外层的状态以props的方式传入进UI组件。

`connect()`方法接受两个参数，`mapStateToProps`用于传递state，`mapDispatchToProps`用于传递UI组件需要调用的store.dispatch中的方法。

## `mapStateToProps(state, ownProps)`

`mapStateToProps`是一个函数，它接受`state`作为参数，返回一个对象。

```js
const mapStateToProps = (state) => {
  return {
    name: state.name
  }
}
```

对象的键名代表 UI 组件的props中的同名参数，键值为你希望传入的处理过后的值。

`mapStateToProps`会订阅 Store，每当`state`更新的时候，就会重新计算 UI 组件的参数，从而触发 UI 组件的重新渲染。

至于`mapStateToProps`的第二个参数`ownProps`是可选的，为该容器组件自身的props，传入后若容器组件自身的props被改变同样会触发UI组件的重新渲染。

## `mapDispatchToProps()`

`mapDispatchToProps`可以是一个函数，也可以是一个对象。它定义了UI组件中的一些操作能够发出action，被store响应。

当`mapDispatchToProps`作为对象时，结构与`mapStateToProps`类似。它的每个键名也是对应 UI 组件的同名参数，键值应该是一个函数，这个函数我们之前提到过，叫做`actionCreator` ，它返回的 action 会由 redux 自动发出。

```jsx
const mapDispatchToProps = {
  onClick: (e) => {
    const action = {
      type: 'SET_CURRENT_TARGET',
      payload: {
         target: e.target       
      }
    }
    return action
  };
}
```

当`mapDispatchToProps`是一个函数时，可以传入`dispatch`和`ownProps`（容器组件的`props`对象）两个参数。返回值仍然一个对象，该对象的每个键值对事实上都是一个映射，定义了 UI 组件的这个键名参数应该怎样dispatch，发出action。

```jsx
const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onClick: () => {
      dispatch({
        type: 'SET_CURRENT_TARGET',
        payload: {
           target: e.target       
        }
      });
    }
  };
}
```

