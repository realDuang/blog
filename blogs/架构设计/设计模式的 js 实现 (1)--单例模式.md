---
title: 设计模式的 js 实现 (1)--单例模式
date: 2019/09/20 16:58:52
categories: 
  - 架构设计
tags: 
  - JavaScript
  - 设计模式
---

:::tip
了解设计模式是学习一切软件架构设计的基础，大到一个项目的整体框架设计，小到一个功能函数的优化，都有着重要意义。《代码大全》中将设计模式共分为了 23 类，分别为：

1. 创建型模式（5 种）：工厂方法模式、抽象工厂模式、单例模式、建造者模式、原型模式。
2. 结构型模式（7 种）：适配器模式、装饰器模式、代理模式、外观模式、桥接模式、组合模式、享元模式。
3. 行为型模式（11 种）：策略模式、模板方法模式、观察者模式、迭代子模式、责任链模式、命令模式、备忘录模式、状态模式、访问者模式、中介者模式、解释器模式。

接下来我将针对其中常用的几种设计模式进行解读与实现，供大家参考。
:::

## 介绍

在所有设计模式中，最基础同时也非常实用的一类就是单例模式了。单例模式，顾名思义，指的是在此种设计模式下，整个系统将只会构建一次实例，接下来每一次的新的生成都视为对第一次生成实例的引用。

其实，单例模式在我们的项目中运用的十分广泛，例如浏览器的全局变量 window 就是一个例子，所有声明的全局变量都要挂靠在 window 下，并且 window 变量只生成一次，全局都能够调用。再比如一些一些需要保持唯一性的组件，例如顶部提示框、对话框、抽屉组件等等，也都可以用单例模式来解决。

<!-- more -->

## 基础实现

接下来我们尝试着来实现一下单例模式的构造函数。假设我们现在想实现一个单例的顶部提示框组件，简单展示如下：

```js
class Notification {
  constructor(message = "") {
    this.message = message;
  }

  getMessage() {
    return this.message;
  }
}
```

为了实现所需的目标，我们需要为该类增添一个获取单例实例的函数 getInstance。先定义一个标志位记录生成的实例，每次调用时检查，若未实例化则生成一个实例，否则返回之前生成实例的引用。

```js
Notification.getInstance = function(...args) {
  // 若未生成过实例，则实例化该方法，并将实例引用赋值给一个属性，之后返回该属性
  if (!Notification.instance) {
    Notification.instance = new Notification(...args);
  }
  return Notification.instance;
};

const a = Notification.getInstance();
const b = Notification.getInstance();

console.log(a === b); // true
```

这样就实现了这个组件的单例化。

## 能不能更通用

上面这个例子能够实现所需要的目标，但是代码过于耦合，且不方便复用。我们可以考虑使用更通用的方法来实现这一目标。比如我们可以将单例逻辑抽离出来，在原组件外层包裹一个用于生成单例的函数，返回一个功能相同，但拥有单例功能的新组件。

```js
const Singleton = function(Class) {
  let instance = null;
  return function(...args) {
    if (!instance) instance = new Class(...args);
    return instance;
  };
};

const SingleNotification = new Singleton(Notification);

const a = new SingleNotification("info");
const b = new SingleNotification("warning");

console.log(b.message); // "info"

b.message = "warning";
console.log(a.message); // "warning"
```

这样就实现了单例逻辑与实际功能组件的解耦。这里实际上用到了装饰器模式的一些思想，关于装饰器模式我们留到下一节说。
