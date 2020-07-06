---
title: 设计模式的 js 实现 (4)--代理模式
categories: 架构设计
tags: 设计模式
description: >-
  了解设计模式是学习一切软件架构设计的基础，大到一个项目的整体框架设计，小到一个功能函数的优化，都有着重要意义。《代码大全》中将设计模式共分为了 23 类，分别为：
  创建型模式（5 种）：工厂方法模式、抽象工厂模式、单例模式、建造者模式、原型模式。
  结构型模式（7 种）：适配器模式、装饰器模式、代理模式、外观模式、桥接模式、组合模式、享元模式。
  行为型模式（11 种）：策略模式、模板方法模式、观察者模式、迭代子模式、责任链模式、命令模式、备忘录模式、状态模式、访问者模式、中介者模式、解释器模式。
  接下来我将针对其中常用的几种设计模式进行解读与实现，供大家参考。
abbrlink: 34cc
date: 2019-10-07 16:42:54
---

## 介绍

代理模式在注重交互体验的前端应用环境中是一个十分重要的思想，有些时候，当调用方不适合直接访问一个对象的时候，代理模式可以提供出来一个替身对象来控制对这个对象的访问，当替身对象对请求做出一些处理后，再转交给目标对象。

根据上述定义，我们可以将代理模式分解为三种类型：虚拟代理、保护代理以及缓存代理。其中缓存代理能够为计算开销大的一些运算函数提供一层缓存，避免重复计算，多用于一些算法优化的实现，本文暂且不论，重点介绍其他两种代理模式在前端项目中的应用。

<!-- more -->

## 虚拟代理

虚拟代理的应用范围非常广泛，它常用于对创建或使用时开支较大的目标对象进行代理，以达到推迟与减少资源消耗的目的。例如异步请求常用的函数节流、函数防抖、以及懒加载都可以使用此种思想。

我们以实现某图片懒加载来举例：

```html
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>Document</title>
  <style>
    body {
      height: 2000px;
    }

    #others {
      width: 100%;
      height: 1000px;
    }
  </style>
</head>

<body>
  <div id="others"></div>
  <img id="img" />
  <script>
    function lazyloadImage(node, src) {
      const intersectionObserver = new IntersectionObserver(function(entries) {
        if (entries[0].isIntersecting) {
          // 进入 viewport 后加载图片，并解除监听，防止离开 viewport 后再次触发
          node.src = src;
          intersectionObserver.unobserve(node);
        }
      });
      // 开始监听
      intersectionObserver.observe(node);
    }

    const imgNode = document.querySelector("#img");
    lazyloadImage(imgNode, "https://github.com/duang-repo/blog-storage/blob/master/avatar.jpg?raw=true");
  </script>
</body>
</html>
```

又或者通过代理模式实现函数的防抖：

```js
// leading 为是否在进入时立即执行一次
const debounce = (
  fn,
  time = 17,
  options = { leading: true, context: null }
) => {
  let timer;
  const _debounce = function(...args) {
    timer && clearTimeout(timer);
    if (options.leading && !timer) {
      // 立即执行一次
      fn.apply(options.context, args);
      timer = setTimeout(null, time);
    } else {
      timer = setTimeout(() => {
        fn.apply(options.context, args);
        timer = null;
      }, time);
    }
  };
  return _debounce;
};

// 目标对象
const scrollFunc = () => {
    let scrollTop =
      document.body.scrollTop || document.documentElement.scrollTop;
    console.log("滚动条位置：" + scrollTop);
  }

// 代理对象
const proxyScrollFunc = debounce(
  scrollFunc,
  200,
  { leading: false }
);

window.onscroll = proxyScrollFunc
```

## 保护代理

保护代理适用于目标对象安全要求较高，需要鉴权功能时，将所有请求汇聚到代理对象中统一进行授权与控制，再将符合要求的请求转发给目标对象。这种代理解耦了复杂鉴权控制与实际业务处理之间的联系，并且负责鉴权控制的代理模块能做到可复用，从而进一步优化代码架构。

能使用保护代理的情况也有很多，这里以最常见的登录验证为例。（为了更明显体现代理模式的存在，使用了 es6 规范下的 Proxy 对象特性）

```js
function getValidatorProxy(target) {
  return new Proxy(target, {
    validator: {
      account: value => {
        const re = /^\d+$/;
        return {
          isValid: re.test(value),
          error: "账号组成必须全为数字",
        };
      },
      password: value => ({
        isValid: value.length >= 6,
        error: "密码长度不能小于 6",
      }),
    },
    set(target, prop, value) {
      const checkVar = this.validator[prop](value);
      if (checkVar.isValid) {
        console.log(`${prop}参数校验通过`);
        return Reflect.set(target, prop, value);
      }
      console.log(`${prop}参数校验不通过，错误原因：${checkVar.error}`);
      return Reflect.set(target, prop, "");
    },
  });
}

const loginProxy = getValidatorProxy({
  account: "",
  password: "",
});

loginProxy.account = "123"; // account 参数校验通过
loginProxy.password = "123"; // password 参数校验不通过，错误原因：密码长度不能小于 6
console.log(loginProxy); // { account: '123', password: '' }
```
