---
title: redux深入理解（一）
date: 2017-11-30 11:10:37
categories: "react"
tags: "javascript"
---

---

学习react的过程中，redux的熟练掌握是一个绕不开并且很难绕过去的坎。接触react已经有一段时间了，甚至连一些小项目都用react做了不少了，但redux的使用上还是有诸多不理解不熟练的地方。正好有很长一段时间没有更过博客了，就从这里着手，增强一下自己的理解。



## 先从解决全局事件的问题开始

我们都知道，react的数据流是单向的，这样做是为了保证数据同源。

一般来说，子组件可以直接从父组件提供的props中获取数据放入state或是渲染出来，但是子组件要影响父组件的state的话就比较困难了，一般来说需要从父组件写一个回调函数通过props传入子组件，子组件调用这个回调函数之后，值就能在父组件中获取了。

那么，如何与孙组件传值呢？依据单向数据流的思路，层层props传递，回调函数再层层传递回来，是不是在写法上就有点看不懂了？

那么，跟与这个组件几乎完全没关系的远房亲戚组件传值呢？数据状态管理上就非常混乱了。我们自然而然的会想到，是不是能设计出一种思路，解决多级无关层次属性传递的问题呢？

有计算机基础的同学应该会从设计模式中找到灵感。没错，发布-订阅模式啊，全局订阅一个事件，将监听函数的回调函数置入其中，之后让想要改变数据的操作dispatch一个action的话，会依次激活通知所有订阅了这个事件的组件，这样再也不用辛苦的一级一级传递数据了，岂不是美滋滋？



```js
var EventEmitter = {
  _events: {},
  dispatch: function (event, data) {
    if (!this._events[event]) return;
    for (var i = 0; i < this._events[event].length; i++)
    	this._events[event][i](data);
  },
  subscribe: function (event, callback) {
    if (!this._events[event]) 
      this._events[event] = [];
    this._events[event].push(callback);
  },
  unSubscribe: function(event){
    if(this._events && this._events[event]) {
      delete this._events[event];
    }
  }
}
```



是不是看起来很简单？事实上，redux本身的思路就是这么简单，甚至你可以直接拿这个自己写的“myRedux”中的发布订阅功能投入到react项目的使用中。举个例子：

```js
var MyContainer = React.createClass({
  render: function(){
    return (
      <div>
        <CurItemPanel />
        <SelectionButtons/>
      </div>
    )
  }
});

var CurItemPanel = React.createClass({
  getInitialState: function(){
    return {
      curItem: 'item1'
    }
  },
  componentDidMount: function(){
    var self = this;
    EventEmitter.subscribe('changeItem', function(newItem){
      self.setState({
      	curItem: newItem
      });
    })
  },
  componentWillUnmount: function(){
    EventEmitter.unSubscribe('changeItem');
  },
  render: function(){
    return (
      <p>The curItem is: {this.state.curItem}</p>
    )
  }
});

var SelectionButtons = React.createClass({
  onClickItem: function(item){
  EventEmitter.dispatch('changeItem', item);
  },
  render: function(){
  return (
      <div>
        <button onClick={this.onClickItem.bind(this, 'item1')}>item1</button>
        <button onClick={this.onClickItem.bind(this, 'item2')}>item2</button>
      </div>
    )
  }
});
```

当点击按钮时，`SelectionButtons`的兄弟节点`CurItemPanel`可直接通过订阅的回调函数取得数据啦。

redux本身的思路就是这么简洁明了。



## 有没有别的方法

如果你的工程的数据流动没有那么繁杂，不想加入redux库来强行增加代码复杂度，但又实在觉得单项数据流的祖先传值太不友好的话，react本身还提供了一个解决办法：Context（上下文）。它同样能解决层次传递的痛点，可以使子组件直接访问祖先组件数据，先写一个示例：

```js
var CurItemWrapper = React.createClass({
  render: function(){
    return (
      <div>
        <CurItemPanel />
      </div>
    )
  }
});

var CurItemPanel = React.createClass({
  contextTypes: {
  	curItem: React.PropTypes.any
  },
  render: function(){
    return (
      <p>The curItem is: {this.context.curItem}</p>
    )
  }
});

var MyContainer = React.createClass({
  getInitialState: function(){
  	……
  },
  childContextTypes: {
    curItem: React.PropTypes.any,
    changeItem: React.PropTypes.any
  },
  getChildContext: function(){
    return {
      curItem: this.state.curItem,
      changeItem: this.changeItem
    }
  },
  changeItem: function(item){
    this.setState({
    	curItem: item
    });
  },
  render: function(){
    return (
      <div>
        <CurItemWrapper />
        <ListWrapper changeItem={this.changeItem}/>
      </div>
    )
  }
});

var ListWrapper = React.createClass({
  render: function(){
    return (
      <div>
      	<List />
      </div>
    )
  }
});

var List = React.createClass({
  contextTypes: {
  	changeItem: React.PropTypes.any
  },
  onClickItem: function(item){
  	this.context.changeItem(item);
  },
  render: function(){
    return (
      <ul>
        <li onClick={this.onClickItem.bind(this, 'item1')}> item1</li>
        <li onClick={this.onClickItem.bind(this, 'item2')}>item2</li>
      </ul>
    )
  }
});

var MyContainer = React.createClass({
  getInitialState: function(){
  	……
  },
  childContextTypes: {
    curItem: React.PropTypes.any,
    changeItem: React.PropTypes.any
  },
  getChildContext: function(){
    return {
      curItem: this.state.curItem,
      changeItem: this.changeItem
    }
  },
  changeItem: function(item){
    this.setState({
    	curItem: item
    });
  },
  render: function(){
    return (
      <div>
        <CurItemWrapper />
        <ListWrapper changeItem={this.changeItem}/>
      </div>
    )
  }
});
```

可以看出，通过指定`childContextTypes`后，父组件通过`getChildContext`方法可以直接获取到子孙组件中的context，而子孙组件通过调用context对象也能轻松获取来自祖先的回调函数，省去了中间商赚差价（误

`getChildContext` 函数将会在每次state或者props改变时调用。为了更新context中的数据，使用 `this.setState`触发本地状态的更新。这将触发一个的context并且数据的改变可以被子元素收到。



但是！官方似乎并不希望context这个功能被广泛的使用，并声称在日后很可能下架这项功能。以下是原话：

> 绝大多数的应用程序不需要使用上下文(context)。
>
> 如果你希望使用应用程序更加稳定，就不要使用上下文(context)。这只是一个实验性的 API ，并且可能在未来的 React 版本中移除。
>
> 如果你不熟悉 [Redux](https://github.com/reactjs/redux) 或者 [MobX](https://github.com/mobxjs/mobx) 这类 state 管理库，就不要使用 context 。在许多实际应用中，这些库以及和React 绑定是一个很好的管理 和许多组件相关的 state 。Redux 相比 context 是更好的解决方案。
>
> 如果你不是一个经验丰富的 React 开发者，就不要使用 context 。更好的方式是使用 props 和 state 。
>
> 如果你不顾这些警告仍然坚持使用 context ，尝试着将 context 的使用隔离在一个将小的范围内，并且在可能的情况下直接使用 context ，以便在API改变的时候进行升级。



emmm，所以呀，我们还是尽情拥抱redux吧，作为一个状态管理flux的react优化版，还是很值得学习一番的。